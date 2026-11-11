import React, { useState, useEffect, useMemo } from 'react';
import {
  Sidebar,
  NavTab,
} from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { ProjectWorkspaceView } from './components/ProjectWorkspaceView';
import { ReviewWorkspaceView } from './components/ReviewWorkspaceView';
import { SourcesView } from './components/SourcesView';
import { SettingsView } from './components/SettingsView';
import { PublicHandoverView } from './components/PublicHandoverView';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { EditItemModal } from './components/EditItemModal';
import { ManualApproveModal } from './components/ManualApproveModal';
import { NewHandoverModal } from './components/NewHandoverModal';
import {
  CaseRecord,
  ExtractionCategory,
  HandoverSectionData,
  ItemRecord,
  SecurityFinding,
  SourceRecord,
  VerificationMetrics,
} from './types';
import { CheckCircle2, ShieldAlert, X } from 'lucide-react';

export default function App() {
  // Navigation & Shell State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data State
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [currentCase, setCurrentCase] = useState<CaseRecord | null>(null);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [metrics, setMetrics] = useState<VerificationMetrics | null>(null);
  const [securityFindings, setSecurityFindings] = useState<SecurityFinding[]>([]);

  // Modals & Drawers
  const [isNewHandoverOpen, setIsNewHandoverOpen] = useState(false);
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<ItemRecord | null>(null);
  const [isFullDrawerOpen, setIsFullDrawerOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ItemRecord | null>(null);
  const [editingItem, setEditingItem] = useState<ItemRecord | null>(null);
  const [approvingUnverifiedItem, setApprovingUnverifiedItem] = useState<ItemRecord | null>(null);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{
    title: string;
    details: string;
    nextStep: string;
  } | null>(null);

  // Initialize and check URL routing
  useEffect(() => {
    fetchRecentCases();

    const path = window.location.pathname;
    const shareMatch = path.match(/^\/h\/([a-zA-Z0-9_\-]+)/);
    if (shareMatch) {
      loadPublicHandover(shareMatch[1]);
    }
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchRecentCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
        // If no case is selected yet, select the most recent one if available
        if (!currentCase && data.length > 0) {
          loadCaseDetails(data[0].id, false);
        }
      }
    } catch {
      // Quiet background failure
    }
  };

  const loadCaseDetails = async (caseId: string, switchView = true) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || 'Failed to load case');
      }
      const data = await res.json();
      setCurrentCase(data.case);
      setSources(data.sources);
      setItems(data.items);
      setMetrics(data.metrics);
      setSecurityFindings(data.security_findings || []);
      if (data.items.length > 0) {
        setSelectedEvidenceItem(data.items[0]);
      }
      if (switchView) {
        setActiveTab('project');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Unable to Load Case',
        details: message,
        nextStep: 'Check the project list or create a fresh handover.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Option 1: Load Sample Project
  const handleLoadSample = async () => {
    setSampleLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/sample/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replayCached: true }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || 'Failed to load sample project');
      }

      const data = await res.json();
      await fetchRecentCases();
      await loadCaseDetails(data.case.id, false);
      setActiveTab('review');
      showNotification('Loaded sample case: Aegis Pay Settlement Engine');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Could Not Load Sample',
        details: message,
        nextStep: 'Please check your connection or create a case manually.',
      });
    } finally {
      setSampleLoading(false);
    }
  };

  // Option 2: Create Custom Case
  const handleCreateNewHandover = async (data: {
    projectName: string;
    leaverName: string;
    newcomerRole: string;
    files: Array<{ filename: string; kind: 'txt' | 'md' | 'csv' | 'json'; content: string }>;
    pastedText: string;
  }) => {
    setLoading(true);
    setErrorMessage(null);

    const allFiles = [...data.files];
    if (data.pastedText) {
      allFiles.push({
        filename: 'pasted_handover_notes.md',
        kind: 'md',
        content: data.pastedText,
      });
    }

    try {
      // 1. Create Case
      const caseRes = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.projectName,
          leaver_name: data.leaverName,
          newcomer_role: data.newcomerRole,
        }),
      });

      if (!caseRes.ok) {
        const err = await caseRes.json();
        throw new Error(err.details || 'Failed to create case');
      }

      const newCase = await caseRes.json();

      // 2. Upload Sources
      const sourcesRes = await fetch(`/api/cases/${newCase.id}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: allFiles }),
      });

      if (!sourcesRes.ok) {
        const err = await sourcesRes.json();
        throw new Error(err.details || 'Failed to upload source files');
      }

      await fetchRecentCases();
      await loadCaseDetails(newCase.id, false);
      setActiveTab('project');
      showNotification('Created project case with sources ingested.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Run AI Extraction & Evidence Verification
  const handleRunExtraction = async (forceLive = false) => {
    if (!currentCase) return;
    setExtracting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/cases/${currentCase.id}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceLive }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Extraction failed');
      }

      setItems(data.items);
      setMetrics(data.metrics);
      if (data.items.length > 0) {
        setSelectedEvidenceItem(data.items[0]);
      }
      setActiveTab('review');
      showNotification(data.message || 'AI extraction & evidence verification complete!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Extraction Error',
        details: message,
        nextStep: 'The AI service is unavailable. Your files are saved; try again.',
      });
    } finally {
      setExtracting(false);
    }
  };

  // Review Item Actions
  const handleItemAction = async (
    itemId: string,
    action: 'approve' | 'reject' | 'confidential_toggle' | 'add_note' | 'edit',
    payload: any = {}
  ) => {
    if (!currentCase) return;
    try {
      const res = await fetch(`/api/cases/${currentCase.id}/items/${itemId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || err.error || 'Action failed');
      }

      const data = await res.json();
      setItems((prev) => prev.map((it) => (it.id === itemId ? data.item : it)));
      setMetrics(data.metrics);

      if (action === 'approve') showNotification('Item approved');
      else if (action === 'reject') showNotification('Item rejected');
      else if (action === 'confidential_toggle')
        showNotification(data.item.confidential === 1 ? 'Marked confidential' : 'Confidentiality removed');
      else if (action === 'edit') showNotification('Item edited (reset to draft)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Action Failed',
        details: message,
        nextStep: 'Check item rules or try again.',
      });
    }
  };

  // Bulk Approve All Verified
  const handleApproveAllVerified = async () => {
    if (!currentCase) return;
    try {
      const res = await fetch(`/api/cases/${currentCase.id}/approve-all-verified`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || 'Bulk approval failed');
      }
      const data = await res.json();
      setItems(data.items);
      setMetrics(data.metrics);
      showNotification(data.message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Bulk Approval Failed',
        details: message,
        nextStep: 'Approve items individually.',
      });
    }
  };

  // Public Handover Loader
  const loadPublicHandover = async (token: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/h/${token}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || 'Handover not found');
      }
      const data = await res.json();
      setCurrentCase(data.case);
      const allSec = [
        ...data.sections.start_here,
        ...data.sections.decisions,
        ...data.sections.ownership,
        ...data.sections.open_questions,
        ...data.sections.risks,
        ...data.sections.dependencies,
      ];
      setItems(allSec);
      setActiveTab('handovers');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Handover Not Found (404)',
        details: message,
        nextStep: 'Check the URL or ask the author for a link.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy share link
  const handleCopyShareLink = () => {
    if (!currentCase) return;
    const shareUrl = `${window.location.origin}/h/${currentCase.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
    showNotification('Share link copied to clipboard');
  };

  // Handover Data Structure
  const handoverData: HandoverSectionData | null = useMemo(() => {
    if (!currentCase) return null;
    const approved = items.filter((i) => i.review_status === 'approved' && i.confidential === 0);
    const risks = approved.filter((i) => i.type === 'risk');
    const nextActions = approved.filter((i) => i.type === 'next_action');

    return {
      case: currentCase,
      total_sources: sources.length || 4,
      total_extracted: items.length,
      total_approved: approved.length,
      sections: {
        start_here: [...risks, ...nextActions],
        decisions: approved.filter((i) => i.type === 'decision'),
        ownership: approved.filter((i) => i.type === 'ownership'),
        open_questions: approved.filter((i) => i.type === 'open_question'),
        risks,
        dependencies: approved.filter((i) => i.type === 'dependency'),
      },
    };
  }, [currentCase, items, sources]);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans text-stone-900">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-3.5 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main SaaS Shell: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
          currentCase={currentCase}
          cases={cases}
          onSelectCase={(id) => loadCaseDetails(id, true)}
          onNewHandover={() => setIsNewHandoverOpen(true)}
          onLoadSample={handleLoadSample}
          sampleLoading={sampleLoading}
          isOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Right Main Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Breadcrumbs & Actions Bar */}
          <TopNav
            currentCase={currentCase}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onCopyShareLink={handleCopyShareLink}
            shareCopied={shareCopied}
          />

          {/* Error Banner */}
          {errorMessage && (
            <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 w-full">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 flex items-start justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-rose-950">{errorMessage.title}</h4>
                    <p className="text-rose-700 mt-0.5">{errorMessage.details}</p>
                    <p className="text-rose-900 font-medium mt-1">
                      Next Step: {errorMessage.nextStep}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-400 hover:text-rose-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Views Routing */}
          <div className="flex-1 pb-16">
            {activeTab === 'dashboard' && (
              <DashboardView
                cases={cases}
                currentCase={currentCase}
                metrics={metrics}
                onSelectCase={(id) => loadCaseDetails(id, true)}
                onNewHandover={() => setIsNewHandoverOpen(true)}
                onLoadSample={handleLoadSample}
                sampleLoading={sampleLoading}
                onOpenReview={() => setActiveTab('review')}
                onOpenHandover={() => setActiveTab('handovers')}
              />
            )}

            {activeTab === 'project' && currentCase && (
              <ProjectWorkspaceView
                currentCase={currentCase}
                sources={sources}
                metrics={metrics}
                onRunExtraction={handleRunExtraction}
                extracting={extracting}
                onOpenReview={() => setActiveTab('review')}
                onOpenHandover={() => setActiveTab('handovers')}
                onOpenUploadModal={() => setIsNewHandoverOpen(true)}
              />
            )}

            {activeTab === 'review' && (
              <ReviewWorkspaceView
                items={items}
                metrics={metrics}
                onApproveItem={(item) => {
                  if (item.verification === 'unverified') {
                    setApprovingUnverifiedItem(item);
                  } else {
                    handleItemAction(item.id, 'approve');
                  }
                }}
                onRejectItem={(id) => handleItemAction(id, 'reject')}
                onEditItem={(item) => setEditingItem(item)}
                onToggleConfidential={(id) => handleItemAction(id, 'confidential_toggle')}
                onViewHistory={(item) => setSelectedHistoryItem(item)}
                onApproveAllVerified={handleApproveAllVerified}
                selectedEvidenceItem={selectedEvidenceItem}
                onSelectEvidenceItem={(item) => setSelectedEvidenceItem(item)}
              />
            )}

            {activeTab === 'handovers' && handoverData && (
              <PublicHandoverView
                data={handoverData}
                onOpenEvidence={(item) => {
                  setSelectedEvidenceItem(item);
                  setIsFullDrawerOpen(true);
                }}
                onBackToDashboard={() => setActiveTab('review')}
              />
            )}

            {activeTab === 'sources' && currentCase && (
              <SourcesView
                currentCase={currentCase}
                sources={sources}
                securityFindings={securityFindings}
              />
            )}

            {activeTab === 'settings' && <SettingsView />}
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <NewHandoverModal
        isOpen={isNewHandoverOpen}
        onClose={() => setIsNewHandoverOpen(false)}
        onSubmit={handleCreateNewHandover}
        loading={loading}
      />

      <EvidenceDrawer
        item={isFullDrawerOpen ? selectedEvidenceItem : null}
        onClose={() => setIsFullDrawerOpen(false)}
      />

      <VersionHistoryModal
        item={selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
      />

      <EditItemModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(itemId, updates) => handleItemAction(itemId, 'edit', updates)}
      />

      <ManualApproveModal
        item={approvingUnverifiedItem}
        onClose={() => setApprovingUnverifiedItem(null)}
        onConfirm={(itemId, note) =>
          handleItemAction(itemId, 'approve', { manual_verification_note: note })
        }
      />
    </div>
  );
}
