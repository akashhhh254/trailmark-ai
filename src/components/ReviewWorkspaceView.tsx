import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  Edit3,
  Lock,
  Unlock,
  History,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  ExternalLink,
  ShieldAlert,
  User,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ExtractionCategory, ItemRecord, VerificationMetrics } from '../types';

interface ReviewWorkspaceViewProps {
  items: ItemRecord[];
  metrics: VerificationMetrics | null;
  onApproveItem: (item: ItemRecord) => void;
  onRejectItem: (itemId: string) => void;
  onEditItem: (item: ItemRecord) => void;
  onToggleConfidential: (itemId: string) => void;
  onViewHistory: (item: ItemRecord) => void;
  onApproveAllVerified: () => void;
  selectedEvidenceItem: ItemRecord | null;
  onSelectEvidenceItem: (item: ItemRecord) => void;
}

export const ReviewWorkspaceView: React.FC<ReviewWorkspaceViewProps> = ({
  items,
  metrics,
  onApproveItem,
  onRejectItem,
  onEditItem,
  onToggleConfidential,
  onViewHistory,
  onApproveAllVerified,
  selectedEvidenceItem,
  onSelectEvidenceItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Right Panel Evidence Detail State
  const [evidenceData, setEvidenceData] = useState<{
    chunk_id: string;
    label: string;
    source_filename: string;
    source_kind: string;
    start_line: number;
    end_line: number;
    text: string;
  } | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Auto-select first item for right panel if none selected
  useEffect(() => {
    if (!selectedEvidenceItem && items.length > 0) {
      onSelectEvidenceItem(items[0]);
    }
  }, [items, selectedEvidenceItem, onSelectEvidenceItem]);

  // Fetch chunk evidence when selectedEvidenceItem changes
  useEffect(() => {
    if (!selectedEvidenceItem) {
      setEvidenceData(null);
      return;
    }

    setEvidenceLoading(true);
    fetch(`/api/cases/${selectedEvidenceItem.case_id}/evidence/${selectedEvidenceItem.chunk_id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvidenceData(data);
      })
      .catch((err) => {
        console.error('Failed to load evidence chunk:', err);
      })
      .finally(() => {
        setEvidenceLoading(false);
      });
  }, [selectedEvidenceItem]);

  const handleCopyQuote = (quote: string) => {
    navigator.clipboard.writeText(quote);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.type !== selectedCategory) return false;
    if (selectedStatus === 'approved' && item.review_status !== 'approved') return false;
    if (selectedStatus === 'draft' && item.review_status !== 'draft') return false;
    if (selectedStatus === 'rejected' && item.review_status !== 'rejected') return false;
    if (selectedStatus === 'confidential' && item.confidential !== 1) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStatement = item.statement.toLowerCase().includes(q);
      const matchQuote = item.quote.toLowerCase().includes(q);
      const matchOwner = item.owner?.toLowerCase().includes(q);
      if (!matchStatement && !matchQuote && !matchOwner) return false;
    }
    return true;
  });

  const getCategoryLabel = (cat: ExtractionCategory) => {
    switch (cat) {
      case 'decision':
        return 'Decision';
      case 'ownership':
        return 'Ownership';
      case 'risk':
        return 'Risk';
      case 'open_question':
        return 'Open Question';
      case 'dependency':
        return 'Dependency';
      case 'next_action':
        return 'Next Action';
    }
  };

  // Helper to render passage with highlight
  const renderHighlightedPassage = () => {
    if (!evidenceData || !selectedEvidenceItem) return null;

    const fullText = evidenceData.text;
    const targetQuote = selectedEvidenceItem.quote.trim();
    const exactIdx = fullText.indexOf(targetQuote);

    if (exactIdx !== -1) {
      const before = fullText.substring(0, exactIdx);
      const matched = fullText.substring(exactIdx, exactIdx + targetQuote.length);
      const after = fullText.substring(exactIdx + targetQuote.length);

      return (
        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-stone-800 bg-[#fdfdfc] p-3.5 rounded-lg border border-stone-200/80">
          {before}
          <mark className="bg-amber-200 text-stone-900 font-medium px-1 py-0.5 rounded shadow-2xs border border-amber-300">
            {matched}
          </mark>
          {after}
        </pre>
      );
    }

    if (
      selectedEvidenceItem.match_start !== undefined &&
      selectedEvidenceItem.match_end !== undefined &&
      selectedEvidenceItem.match_start >= 0 &&
      selectedEvidenceItem.match_end <= fullText.length
    ) {
      const before = fullText.substring(0, selectedEvidenceItem.match_start);
      const matched = fullText.substring(selectedEvidenceItem.match_start, selectedEvidenceItem.match_end);
      const after = fullText.substring(selectedEvidenceItem.match_end);

      return (
        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-stone-800 bg-[#fdfdfc] p-3.5 rounded-lg border border-stone-200/80">
          {before}
          <mark className="bg-amber-100 text-stone-900 font-medium px-1 py-0.5 rounded border border-amber-200">
            {matched}
          </mark>
          {after}
        </pre>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
          Exact quote text was not detected verbatim inside cited chunk.
        </p>
        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-stone-700 bg-stone-50 p-3.5 rounded-lg border border-stone-200">
          {fullText}
        </pre>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Review Header & Metric Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Review Workspace</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Evaluate and verify AI claims against source chunks before publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {metrics && (
            <button
              onClick={onApproveAllVerified}
              disabled={metrics.verified === 0}
              className="py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-40"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approve All Verified ({metrics.verified})</span>
            </button>
          )}
        </div>
      </div>

      {/* Insufficient Evidence Warning if needed */}
      {metrics && metrics.insufficient_evidence && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Insufficient Evidence Alert:</strong> Fewer than 3 items are verified against source chunks. "Not enough evidence in these sources to build a handover".
          </span>
        </div>
      )}

      {/* 2. Filter Bar */}
      <div className="space-y-2.5">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 bg-white border border-stone-200'
            }`}
          >
            All Categories ({items.length})
          </button>
          {(['decision', 'ownership', 'risk', 'open_question', 'dependency', 'next_action'] as ExtractionCategory[]).map(
            (cat) => {
              const count = items.filter((i) => i.type === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 bg-white border border-stone-200'
                  }`}
                >
                  <span>{getCategoryLabel(cat)}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Secondary Filter & Search */}
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 text-stone-600">
            <span className="font-semibold text-stone-400 mr-1">Status:</span>
            {['all', 'draft', 'approved', 'rejected', 'confidential'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-md capitalize transition cursor-pointer font-medium ${
                  selectedStatus === st
                    ? 'bg-stone-200 text-stone-900'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter claims, quotes, owners..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
            />
          </div>
        </div>
      </div>

      {/* 3. Slite 2-Column Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Item List (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-xs text-stone-500">
              No items match your filter criteria.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedEvidenceItem?.id === item.id;
              const isApproved = item.review_status === 'approved';
              const isRejected = item.review_status === 'rejected';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectEvidenceItem(item)}
                  className={`bg-white rounded-xl p-4 border transition cursor-pointer shadow-2xs space-y-3 ${
                    isSelected
                      ? 'border-stone-900 ring-1 ring-stone-900/10'
                      : isApproved
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isRejected
                      ? 'border-stone-200 opacity-60 bg-stone-50/50'
                      : 'border-stone-200/90 hover:border-stone-300'
                  }`}
                >
                  {/* Top Meta Line: Clean Slite-style unboxed text */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-stone-500 font-medium">
                      <span className="font-semibold text-stone-800">{getCategoryLabel(item.type)}</span>
                      <span aria-hidden="true">·</span>
                      {item.verification === 'verified' && (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Exact Quote</span>
                        </span>
                      )}
                      {item.verification === 'approximate' && (
                        <span className="text-amber-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Normalized</span>
                        </span>
                      )}
                      {item.verification === 'unverified' && (
                        <span className="text-rose-700 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Unverified</span>
                        </span>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{item.review_status}</span>
                      {item.confidential === 1 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-purple-700 flex items-center gap-0.5">
                            <Lock className="w-3 h-3" />
                            <span>Confidential</span>
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewHistory(item);
                      }}
                      className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
                      title="View audit history"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Statement */}
                  <p className="text-sm font-semibold text-stone-900 leading-snug">{item.statement}</p>

                  {/* Responsible Owner */}
                  <div className="text-xs text-stone-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Owner:</span>
                    {item.owner ? (
                      <span className="font-medium text-stone-900">{item.owner}</span>
                    ) : (
                      <span className="text-stone-400 italic">Unassigned (not found in sources)</span>
                    )}
                  </div>

                  {/* Quote Snippet Preview */}
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/80 text-xs italic text-stone-700">
                    "{item.quote}"
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApproveItem(item);
                        }}
                        className={`py-1 px-2.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isApproved ? 'Approved' : 'Approve'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRejectItem(item.id);
                        }}
                        className={`py-1 px-2.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                          isRejected
                            ? 'bg-rose-600 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <X className="w-3 h-3" />
                        <span>{isRejected ? 'Rejected' : 'Reject'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditItem(item);
                        }}
                        className="py-1 px-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition cursor-pointer"
                        title="Edit statement or category (resets to draft)"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleConfidential(item.id);
                        }}
                        className="py-1 px-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition cursor-pointer"
                        title="Toggle confidentiality"
                      >
                        {item.confidential === 1 ? (
                          <Lock className="w-3 h-3 text-purple-600" />
                        ) : (
                          <Unlock className="w-3 h-3 text-stone-400" />
                        )}
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                      <span>{item.chunk_label || item.chunk_id}</span>
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Persistent Slite-style Evidence Viewer (5 cols on desktop) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden flex flex-col">
            {/* Evidence Header */}
            <div className="p-4 border-b border-stone-200 bg-[#fbfbfa] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-600" />
                <h3 className="font-semibold text-xs text-stone-900">Source Evidence Inspector</h3>
              </div>
              {selectedEvidenceItem && (
                <button
                  onClick={() => handleCopyQuote(selectedEvidenceItem.quote)}
                  className="text-[11px] text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedQuote ? 'Copied' : 'Copy Quote'}</span>
                </button>
              )}
            </div>

            {/* Evidence Body */}
            <div className="p-4 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
              {selectedEvidenceItem ? (
                <>
                  {/* Selected Item Statement Brief */}
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Target Assertion ({getCategoryLabel(selectedEvidenceItem.type)})
                    </span>
                    <p className="text-xs font-medium text-stone-900">{selectedEvidenceItem.statement}</p>
                    {selectedEvidenceItem.verification_note && (
                      <p className="text-[11px] text-amber-800 pt-1">
                        <strong>Engine Note:</strong> {selectedEvidenceItem.verification_note}
                      </p>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  {evidenceData && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-stone-50 rounded border border-stone-200/70">
                        <span className="text-[10px] text-stone-400 block uppercase font-medium">Source Document</span>
                        <span className="font-semibold text-stone-800 truncate block text-[11px]" title={evidenceData.source_filename}>
                          {evidenceData.source_filename}
                        </span>
                      </div>
                      <div className="p-2 bg-stone-50 rounded border border-stone-200/70">
                        <span className="text-[10px] text-stone-400 block uppercase font-medium">Chunk / Lines</span>
                        <span className="font-semibold text-stone-800 block text-[11px] font-mono">
                          {evidenceData.label} (L{evidenceData.start_line}–{evidenceData.end_line})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Chunk Passage with Highlight */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Source Chunk Passage
                    </label>
                    {evidenceLoading ? (
                      <div className="p-6 text-center text-xs text-stone-400">Loading chunk passage...</div>
                    ) : (
                      renderHighlightedPassage()
                    )}
                  </div>

                  {/* Direct Verification Confirmation inside Evidence Panel */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500">
                      Quote length: {selectedEvidenceItem.quote.length} chars
                    </span>
                    <button
                      onClick={() => onApproveItem(selectedEvidenceItem)}
                      className="py-1 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Confirm & Approve</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400">
                  Select an item from the review queue on the left to inspect its supporting source chunk.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
