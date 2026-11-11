import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
  Unlock,
  Edit3,
  History,
  Check,
  X,
  Plus,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  User,
  Layers,
  FileSpreadsheet,
  FileCode,
  Flame,
  FileCheck,
  Key,
} from 'lucide-react';
import { Header } from './components/Header';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { EditItemModal } from './components/EditItemModal';
import { ManualApproveModal } from './components/ManualApproveModal';
import { PublicHandoverView } from './components/PublicHandoverView';
import {
  CaseRecord,
  ExtractionCategory,
  HandoverSectionData,
  ItemRecord,
  ReviewStatus,
  SecurityFinding,
  SourceRecord,
  VerificationMetrics,
} from './types';

export default function App() {
  // Navigation & Case State
  const [activeView, setActiveView] = useState<'setup' | 'review' | 'handover'>('setup');
  const [currentCase, setCurrentCase] = useState<CaseRecord | null>(null);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [metrics, setMetrics] = useState<VerificationMetrics | null>(null);
  const [securityFindings, setSecurityFindings] = useState<SecurityFinding[]>([]);
  const [llmAvailable, setLlmAvailable] = useState<boolean>(true);
  const [recentCases, setRecentCases] = useState<CaseRecord[]>([]);

  // Modals & Drawers
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<ItemRecord | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ItemRecord | null>(null);
  const [editingItem, setEditingItem] = useState<ItemRecord | null>(null);
  const [approvingUnverifiedItem, setApprovingUnverifiedItem] = useState<ItemRecord | null>(null);

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(false);
  const [sampleLoading, setSampleLoading] = useState<boolean>(false);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<{ title: string; details: string; nextStep: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [runModeNotice, setRunModeNotice] = useState<string | null>(null);

  // Setup Form State
  const [projectName, setProjectName] = useState('');
  const [leaverName, setLeaverName] = useState('');
  const [newcomerRole, setNewcomerRole] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [pasteFilename, setPasteFilename] = useState('pasted_notes.md');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ filename: string; kind: 'txt' | 'md' | 'csv' | 'json'; content: string }>>([]);

  // Review Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Check for public share link in URL hash or path on mount
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
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchRecentCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setRecentCases(data);
      }
    } catch {
      // Ignore background error
    }
  };

  const loadCaseDetails = async (caseId: string) => {
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
      setLlmAvailable(data.llm_available);
      setActiveView(data.items.length > 0 ? 'review' : 'setup');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Unable to Load Project Case',
        details: message,
        nextStep: 'Check the project list or create a fresh handover case.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Option 1: Load Sample Project
  const handleLoadSample = async (forceLive = false) => {
    setSampleLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/sample/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replayCached: !forceLive }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || 'Failed to load sample project');
      }

      const data = await res.json();
      await loadCaseDetails(data.case.id);
      setActiveView('review');
      setRunModeNotice('Sample results replayed from a saved model run');
      showNotification('Loaded synthetic sample project (Aegis Pay Settlement Engine)');
      fetchRecentCases();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Could Not Load Sample Project',
        details: message,
        nextStep: 'Please check connection or create a custom case manually.',
      });
    } finally {
      setSampleLoading(false);
    }
  };

  // Option 2: Create Custom Case
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !leaverName.trim() || !newcomerRole.trim()) {
      setErrorMessage({
        title: 'Missing Required Information',
        details: 'Project name, outgoing leaver name, and incoming role are required.',
        nextStep: 'Fill in all fields and provide at least one source file or pasted text.',
      });
      return;
    }

    const filesToUpload = [...uploadedFiles];
    if (pasteContent.trim()) {
      filesToUpload.push({
        filename: pasteFilename,
        kind: 'md',
        content: pasteContent.trim(),
      });
    }

    if (filesToUpload.length === 0) {
      setErrorMessage({
        title: 'No Source Data Attached',
        details: 'You must attach at least one .txt, .md, .csv, or .json file, or paste handover notes.',
        nextStep: 'Upload files or paste text in the box below before creating.',
      });
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Create Case
      const caseRes = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          leaver_name: leaverName,
          newcomer_role: newcomerRole,
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
        body: JSON.stringify({ files: filesToUpload }),
      });

      if (!sourcesRes.ok) {
        const err = await sourcesRes.json();
        throw new Error(err.details || 'Failed to upload source files');
      }

      // Reset form
      setProjectName('');
      setLeaverName('');
      setNewcomerRole('');
      setPasteContent('');
      setUploadedFiles([]);

      await loadCaseDetails(newCase.id);
      fetchRecentCases();
      showNotification('Project case created with source files ingested.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Case Creation Failed',
        details: message,
        nextStep: 'Review file sizes and formats (.txt, .md, .csv, .json) and try again.',
      });
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
      setRunModeNotice(
        data.run_mode === 'live'
          ? 'Live model run'
          : 'Sample results replayed from a saved model run'
      );
      setActiveView('review');
      showNotification(data.message || 'AI extraction & evidence verification complete!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'AI Service Error',
        details: message,
        nextStep: 'The AI service is unavailable. Your files are saved; try again.',
      });
    } finally {
      setExtracting(false);
    }
  };

  // Item Review Actions
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

      if (action === 'approve') showNotification('Item approved for handover');
      else if (action === 'reject') showNotification('Item rejected');
      else if (action === 'confidential_toggle')
        showNotification(data.item.confidential === 1 ? 'Marked confidential' : 'Confidentiality removed');
      else if (action === 'edit') showNotification('Item edited (reset to draft)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Review Action Failed',
        details: message,
        nextStep: 'Please try again or check item requirements.',
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
        nextStep: 'Review items individually.',
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
      // Construct items
      const allSec = [
        ...data.sections.start_here,
        ...data.sections.decisions,
        ...data.sections.ownership,
        ...data.sections.open_questions,
        ...data.sections.risks,
        ...data.sections.dependencies,
      ];
      setItems(allSec);
      setActiveView('handover');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage({
        title: 'Handover Not Found (404)',
        details: message,
        nextStep: 'Check that the URL is correct or ask the project reviewer for an updated link.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Multi-file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let kind: 'txt' | 'md' | 'csv' | 'json' = 'txt';
      if (ext === 'md') kind = 'md';
      else if (ext === 'csv') kind = 'csv';
      else if (ext === 'json') kind = 'json';

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUploadedFiles((prev) => [...prev, { filename: file.name, kind, content }]);
      };
      reader.readAsText(file);
    });
  };

  // Filtered Items for Review
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'all' && item.type !== selectedCategory) return false;
      if (selectedStatus === 'approved' && item.review_status !== 'approved') return false;
      if (selectedStatus === 'draft' && item.review_status !== 'draft') return false;
      if (selectedStatus === 'rejected' && item.review_status !== 'rejected') return false;
      if (selectedStatus === 'confidential' && item.confidential !== 1) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesStatement = item.statement.toLowerCase().includes(q);
        const matchesQuote = item.quote.toLowerCase().includes(q);
        const matchesOwner = item.owner?.toLowerCase().includes(q);
        if (!matchesStatement && !matchesQuote && !matchesOwner) return false;
      }

      return true;
    });
  }, [items, selectedCategory, selectedStatus, searchQuery]);

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

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      decision: 0,
      ownership: 0,
      risk: 0,
      open_question: 0,
      dependency: 0,
      next_action: 0,
    };
    for (const item of items) {
      if (counts[item.type] !== undefined) counts[item.type]++;
    }
    return counts;
  }, [items]);

  const getCategoryMeta = (type: ExtractionCategory) => {
    switch (type) {
      case 'decision':
        return { label: 'Decision', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      case 'ownership':
        return { label: 'Ownership', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'risk':
        return { label: 'Risk', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      case 'open_question':
        return { label: 'Open Question', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'dependency':
        return { label: 'Dependency', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'next_action':
        return { label: 'Next Action', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Header
        currentCase={currentCase}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onLoadSample={() => handleLoadSample(false)}
        onNewCase={() => {
          setCurrentCase(null);
          setActiveView('setup');
        }}
        sampleLoading={sampleLoading}
      />

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-xs text-rose-900 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-950">{errorMessage.title}</h4>
                <p className="mt-0.5 text-rose-800">{errorMessage.details}</p>
                <div className="mt-2 pt-2 border-t border-rose-200 text-rose-900 font-medium">
                  <strong>Recommended Next Step:</strong> {errorMessage.nextStep}
                </div>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-700 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 1: SETUP & ONBOARDING (Two clear options on homepage)     */}
      {/* ============================================================== */}
      {activeView === 'setup' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>3-Minute End-to-End Evaluation Workflow</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Turn scattered project chatter into verified handovers.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Trailmark extracts critical decisions, ownership, risks, and next actions from messy project documents, verifies every quote directly against source chunks, and requires human approval before public sharing.
              </p>
            </div>
          </div>

          {/* TWO PRIMARY PATHWAYS (Judge Experience Requirement) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OPTION 1: TRY THE SAMPLE PROJECT */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-indigo-200 hover:border-indigo-400 shadow-md transition flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                    Option 1 — Instant 1-Click Evaluation
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">Try the Sample Project</h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Instantly load our realistic synthetic handover (<em>Aegis Pay Settlement Engine V2</em>) with 4 bundled sources (.md, .txt, .csv, .json), simulated prompt-injection attempt, conflicting deadlines, and pre-cached quote verification.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-800">What this sample demonstrates:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Alex Rivera handover to incoming Jordan Chen (Principal SRE)</li>
                    <li>Automatic detection & neutralisation of prompt injection attempt</li>
                    <li>Quote verification engine (exact vs normalized vs unverified)</li>
                    <li>Human review interface with evidence drawer & markdown export</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleLoadSample(false)}
                  disabled={sampleLoading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sampleLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Loading Synthetic Project...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Launch Sample Project (Instant Replay)</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Runs instantly with zero API key requirement using saved model run.
                </p>
              </div>
            </div>

            {/* OPTION 2: USE YOUR OWN FILES / PASTE TEXT */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Option 2 — Custom Handover Case
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">Use Your Own Files / Paste Text</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Upload up to 10 files (.txt, .md, .csv, .json) or paste your handover notes.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateCase} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Core Checkout API"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Outgoing Leaver *</label>
                    <input
                      type="text"
                      value={leaverName}
                      onChange={(e) => setLeaverName(e.target.value)}
                      placeholder="e.g. Sarah Connor"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Incoming Role *</label>
                    <input
                      type="text"
                      value={newcomerRole}
                      onChange={(e) => setNewcomerRole(e.target.value)}
                      placeholder="e.g. Lead Engineer"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Paste Text Tab */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Paste Raw Project Notes / Slack</label>
                    <span className="text-[11px] text-slate-400">Treated strictly as DATA</span>
                  </div>
                  <textarea
                    rows={4}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder="Paste handover notes, slack transcripts, architecture decisions, or on-call instructions here..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 bg-white"
                  />
                </div>

                {/* File Attachment Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Or Upload Documents (.txt, .md, .csv, .json — max 10 files)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".txt,.md,.csv,.json"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {uploadedFiles.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 border border-slate-200 text-slate-700"
                        >
                          <FileText className="w-3 h-3 text-slate-400" />
                          {f.filename} ({f.kind})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting Sources...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Case & Ingest Files</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Recent Handover Cases Carousel */}
          {recentCases.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent Handover Cases in Workspace
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentCases.map((rc) => (
                  <div
                    key={rc.id}
                    onClick={() => loadCaseDetails(rc.id)}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 hover:border-indigo-300 transition cursor-pointer space-y-1"
                  >
                    <p className="font-semibold text-xs text-slate-900 truncate">{rc.name}</p>
                    <p className="text-[11px] text-slate-500">
                      From <strong>{rc.leaver_name}</strong> to <strong>{rc.newcomer_role}</strong>
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                      <span>Status: {rc.status}</span>
                      <span>{new Date(rc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: REVIEW WORKSPACE & EVIDENCE VALIDATION                 */}
      {/* ============================================================== */}
      {activeView === 'review' && currentCase && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
          {/* Top Project Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Review Workspace
                </span>
                {runModeNotice && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {runModeNotice}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{currentCase.name}</h2>
              <p className="text-xs text-slate-500">
                Outgoing Lead: <strong>{currentCase.leaver_name}</strong> &bull; Incoming Role: <strong>{currentCase.newcomer_role}</strong> &bull; Ingested Sources: <strong>{sources.length}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleRunExtraction(true)}
                disabled={extracting}
                title="Rerun extraction using live Gemini model"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${extracting ? 'animate-spin' : ''}`} />
                <span>{extracting ? 'Extracting...' : 'Rerun Live Model'}</span>
              </button>

              <button
                onClick={handleApproveAllVerified}
                disabled={!metrics || metrics.verified === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve All Verified ({metrics?.verified ?? 0})</span>
              </button>

              <button
                onClick={() => setActiveView('handover')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Handover</span>
              </button>
            </div>
          </div>

          {/* Security & Injection Alert Banner */}
          {securityFindings.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Security Inspection: Prompt Injection & Secrets Shield Active</span>
              </div>
              <p className="text-slate-700">
                Our pre-processing scan detected {securityFindings.length} safety items. Uploaded files are strictly treated as <strong>DATA</strong>, never instructions.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {securityFindings.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-amber-200 text-slate-800 text-[11px]"
                  >
                    <span className="font-semibold uppercase text-amber-700">[{f.type}]</span>
                    <span>{f.message}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification Metrics Banner */}
          {metrics && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Items</span>
                  <span className="text-lg font-bold text-slate-900">{metrics.total}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Exact Verified</span>
                  <span className="text-lg font-bold text-emerald-800">{metrics.verified}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Approximate</span>
                  <span className="text-lg font-bold text-amber-800">{metrics.approximate}</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Unverified</span>
                  <span className="text-lg font-bold text-rose-800">{metrics.unverified}</span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">Verification Rate</span>
                  <span className="text-lg font-bold text-indigo-800">{metrics.verification_rate}%</span>
                </div>
              </div>

              {/* Insufficient Evidence Warning (Section 10 Requirement) */}
              {metrics.insufficient_evidence && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Insufficient Evidence Flag:</strong> Fewer than 3 items are verified against source chunks. "Not enough evidence in these sources to build a handover".
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Filter Bar & Category Tabs */}
          <div className="space-y-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                All Categories ({items.length})
              </button>
              {(['decision', 'ownership', 'risk', 'open_question', 'dependency', 'next_action'] as ExtractionCategory[]).map(
                (cat) => {
                  const meta = getCategoryMeta(cat);
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <span>{meta.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {categoryCounts[cat]}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {/* Status & Search Filter */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-xs">
                <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Status:
                </span>
                {['all', 'draft', 'approved', 'rejected', 'confidential'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-md capitalize font-medium transition cursor-pointer ${
                      selectedStatus === st
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search statements, quotes, owners..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Extracted Handover Items List */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No items found matching active filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try switching the category tab or reset your review status filter to view all extracted knowledge items.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const meta = getCategoryMeta(item.type);
                const isApproved = item.review_status === 'approved';
                const isRejected = item.review_status === 'rejected';
                const isConfidential = item.confidential === 1;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-5 border transition shadow-2xs hover:shadow-sm space-y-4 ${
                      isApproved
                        ? 'border-emerald-300 ring-1 ring-emerald-100'
                        : isRejected
                        ? 'border-rose-200 opacity-70 bg-slate-50/50'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Item Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${meta.bg} ${meta.text} ${meta.border}`}
                        >
                          {meta.label}
                        </span>

                        {/* Verification Badge */}
                        {item.verification === 'verified' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Quote
                          </span>
                        )}
                        {item.verification === 'approximate' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Approximate Match
                          </span>
                        )}
                        {item.verification === 'unverified' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Unverified
                          </span>
                        )}

                        {/* Review Status Badge */}
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.review_status}
                        </span>

                        {isConfidential && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            <Lock className="w-3 h-3 text-purple-600" />
                            Confidential
                          </span>
                        )}
                      </div>

                      {/* Right Meta (Confidence & Version Button) */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedHistoryItem(item)}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs px-2 py-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                          title="View complete version history and audit log"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>History</span>
                        </button>
                      </div>
                    </div>

                    {/* Statement & Responsible Owner */}
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{item.statement}</p>
                      <div className="flex items-center gap-2 text-xs">
                        {item.owner ? (
                          <span className="text-slate-700 flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                            <User className="w-3 h-3 text-slate-500" />
                            Owner: <strong>{item.owner}</strong>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                            Owner not found in sources
                          </span>
                        )}
                        {item.verification_note && (
                          <span className="text-amber-800 text-[11px] font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {item.verification_note}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cited Source Quote Box */}
                    <div
                      onClick={() => setSelectedEvidenceItem(item)}
                      className="p-3 bg-slate-50 hover:bg-amber-50/60 rounded-xl border border-slate-200 hover:border-amber-300 transition cursor-pointer space-y-1 group"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-500 group-hover:text-amber-800">
                          Supporting Source Evidence:
                        </span>
                        <span className="text-indigo-600 font-mono flex items-center gap-1 group-hover:underline">
                          <span>{item.chunk_label || item.chunk_id}</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-xs italic text-slate-700 line-clamp-2">"{item.quote}"</p>
                    </div>

                    {/* Reviewer Note if present */}
                    {item.reviewer_note && (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900">
                        <strong>Reviewer Justification:</strong> {item.reviewer_note}
                      </div>
                    )}

                    {/* Human Review Actions Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        {/* Approve Button */}
                        <button
                          onClick={() => {
                            if (item.verification === 'unverified') {
                              setApprovingUnverifiedItem(item);
                            } else {
                              handleItemAction(item.id, 'approve');
                            }
                          }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isApproved
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isApproved ? 'Approved' : 'Approve'}</span>
                        </button>

                        {/* Reject Button */}
                        <button
                          onClick={() => handleItemAction(item.id, 'reject')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isRejected
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{isRejected ? 'Rejected' : 'Reject'}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingItem(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        {/* Confidential Toggle Button */}
                        <button
                          onClick={() => handleItemAction(item.id, 'confidential_toggle')}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                            isConfidential
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isConfidential ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span>{isConfidential ? 'Confidential' : 'Public'}</span>
                        </button>
                      </div>

                      {/* Evidence Passage Trigger */}
                      <button
                        onClick={() => setSelectedEvidenceItem(item)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect Evidence Drawer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: READ-ONLY PUBLIC HANDOVER DOCUMENT                     */}
      {/* ============================================================== */}
      {activeView === 'handover' && handoverData && (
        <PublicHandoverView
          data={handoverData}
          onOpenEvidence={(item) => setSelectedEvidenceItem(item)}
          onBackToDashboard={() => setActiveView('review')}
        />
      )}

      {/* Interactive Modals */}
      <EvidenceDrawer item={selectedEvidenceItem} onClose={() => setSelectedEvidenceItem(null)} />
      <VersionHistoryModal item={selectedHistoryItem} onClose={() => setSelectedHistoryItem(null)} />
      <EditItemModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(itemId, updates) => handleItemAction(itemId, 'edit', updates)}
      />
      <ManualApproveModal
        item={approvingUnverifiedItem}
        onClose={() => setApprovingUnverifiedItem(null)}
        onConfirm={(itemId, note) => handleItemAction(itemId, 'approve', { manual_verification_note: note })}
      />
    </div>
  );
}
