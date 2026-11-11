import React, { useEffect, useState } from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, XCircle, Copy, ExternalLink, ShieldAlert } from 'lucide-react';
import { ItemRecord } from '../types';

interface EvidenceDrawerProps {
  item: ItemRecord | null;
  onClose: () => void;
}

interface ChunkEvidenceDetails {
  chunk_id: string;
  label: string;
  source_filename: string;
  source_kind: string;
  start_line: number;
  end_line: number;
  text: string;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ item, onClose }) => {
  const [evidence, setEvidence] = useState<ChunkEvidenceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!item) {
      setEvidence(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/cases/${item.case_id}/evidence/${item.chunk_id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load chunk evidence');
        return res.json();
      })
      .then((data) => {
        setEvidence(data);
      })
      .catch((err) => {
        setError(err.message || 'Evidence passage not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [item]);

  if (!item) return null;

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(item.quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render text with highlighted matching quote
  const renderHighlightedPassage = () => {
    if (!evidence) return null;

    const fullText = evidence.text;
    const targetQuote = item.quote.trim();

    // 1. Direct substring match
    const exactIdx = fullText.indexOf(targetQuote);
    if (exactIdx !== -1) {
      const before = fullText.substring(0, exactIdx);
      const matched = fullText.substring(exactIdx, exactIdx + targetQuote.length);
      const after = fullText.substring(exactIdx + targetQuote.length);

      return (
        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200">
          {before}
          <mark className="bg-amber-300 text-slate-900 font-semibold px-1 py-0.5 rounded shadow-sm border border-amber-400">
            {matched}
          </mark>
          {after}
        </pre>
      );
    }

    // 2. Fallback to match_start and match_end if provided by backend
    if (
      item.match_start !== undefined &&
      item.match_end !== undefined &&
      item.match_start >= 0 &&
      item.match_end <= fullText.length &&
      item.match_end > item.match_start
    ) {
      const before = fullText.substring(0, item.match_start);
      const matched = fullText.substring(item.match_start, item.match_end);
      const after = fullText.substring(item.match_end);

      return (
        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200">
          {before}
          <mark className="bg-amber-200 text-slate-900 font-semibold px-1 py-0.5 rounded border border-amber-300">
            {matched}
          </mark>
          {after}
        </pre>
      );
    }

    // 3. Fallback: unverified or modified quote
    return (
      <div>
        <div className="mb-2 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            Exact quote substring was not found inside this chunk. The quote may have been altered or cited from a different section.
          </span>
        </div>
        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200">
          {fullText}
        </pre>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-base">Supporting Evidence Passage</h3>
              <p className="text-xs text-slate-400">Application verification check against source chunk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Item Statement Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                Extracted Statement ({item.type.replace('_', ' ')})
              </span>
              <div className="flex items-center gap-1.5">
                {item.verification === 'verified' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Exact Match
                  </span>
                )}
                {item.verification === 'approximate' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Normalized Match
                  </span>
                )}
                {item.verification === 'unverified' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    Unverified
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-800 leading-snug">{item.statement}</p>
            {item.owner && (
              <p className="text-xs text-slate-600">
                <strong>Owner:</strong> {item.owner}
              </p>
            )}
            {item.verification_note && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                <strong>Verification Note:</strong> {item.verification_note}
              </p>
            )}
          </div>

          {/* Cited Quote Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Cited Quote</label>
              <button
                onClick={handleCopyQuote}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied' : 'Copy Quote'}</span>
              </button>
            </div>
            <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-md text-xs italic text-slate-800 leading-relaxed">
              "{item.quote}"
            </div>
          </div>

          {/* Source & Chunk Metadata */}
          {evidence && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Source File</span>
                <span className="font-semibold text-slate-800 truncate block" title={evidence.source_filename}>
                  {evidence.source_filename}
                </span>
              </div>
              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Chunk Label</span>
                <span className="font-semibold text-indigo-700 font-mono block">{evidence.label}</span>
              </div>
              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Line Span</span>
                <span className="font-semibold text-slate-800 block">
                  Lines {evidence.start_line} – {evidence.end_line}
                </span>
              </div>
              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Source Type</span>
                <span className="font-semibold uppercase text-slate-800 block">{evidence.source_kind}</span>
              </div>
            </div>
          )}

          {/* Chunk Text with Highlight */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Source Chunk Passage</label>
              <span className="text-[11px] text-slate-500">Highlighted in yellow where found</span>
            </div>

            {loading && (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                Loading source chunk evidence...
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!loading && !error && renderHighlightedPassage()}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Quote length: {item.quote.length} chars (min 12 required)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md font-medium transition cursor-pointer"
          >
            Close Evidence
          </button>
        </div>
      </div>
    </div>
  );
};
