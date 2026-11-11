import React, { useState } from 'react';
import {
  ShieldCheck,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Link as LinkIcon,
  User,
  ArrowRight,
  Flame,
  FileText,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { HandoverSectionData, ItemRecord } from '../types';

interface PublicHandoverViewProps {
  data: HandoverSectionData;
  onOpenEvidence: (item: ItemRecord) => void;
  onBackToDashboard?: () => void;
  isPublicRoute?: boolean;
}

export const PublicHandoverView: React.FC<PublicHandoverViewProps> = ({
  data,
  onOpenEvidence,
  onBackToDashboard,
  isPublicRoute = false,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/h/${data.case.share_token}`;
  const markdownUrl = `/h/${data.case.share_token}.md`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const renderSectionEmpty = () => (
    <div className="py-6 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500 italic">
      Nothing approved for this section yet
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Handover Document Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified & Approved Handover
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Read-Only Public Transfer Document
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Back to Review
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>

            <a
              href={markdownUrl}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-10">
          {/* Header Title Section */}
          <div className="border-b border-slate-200 pb-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <FileText className="w-4 h-4" />
              <span>Official Project Handover</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {data.case.name}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Outgoing Team Member</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">{data.case.leaver_name}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Incoming Role / Successor</span>
                <span className="text-sm font-semibold text-slate-800 block mt-0.5">{data.case.newcomer_role}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Status</span>
                <span className="text-sm font-semibold text-emerald-700 block mt-0.5">
                  {data.total_approved} Approved Item(s)
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Security Guarantee:</strong> This public document contains exclusively human-approved, non-confidential items. Every statement is substantiated by an exact verified quote from source documentation.
              </p>
            </div>
          </div>

          {/* Section 1: Start Here (Risks first, then Next Actions) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Start Here (Immediate Priorities)</h2>
                <p className="text-xs text-slate-500">Critical operational risks followed by immediate transition tasks</p>
              </div>
            </div>

            {data.sections.start_here.length === 0 ? (
              renderSectionEmpty()
            ) : (
              <div className="space-y-3">
                {data.sections.start_here.map((item) => {
                  const isRisk = item.type === 'risk';
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition ${
                        isRisk
                          ? 'bg-rose-50/60 border-rose-200'
                          : 'bg-sky-50/60 border-sky-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                isRisk
                                  ? 'bg-rose-200 text-rose-800'
                                  : 'bg-sky-200 text-sky-800'
                              }`}
                            >
                              {isRisk ? 'CRITICAL RISK' : 'NEXT ACTION'}
                            </span>
                            {item.owner && (
                              <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                {item.owner}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-slate-900 leading-snug">
                            {item.statement}
                          </p>
                        </div>

                        <button
                          onClick={() => onOpenEvidence(item)}
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>View Evidence</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Key Decisions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Key Decisions</h2>
                <p className="text-xs text-slate-500">Architecture, infrastructure, and policy commitments</p>
              </div>
            </div>

            {data.sections.decisions.length === 0 ? (
              renderSectionEmpty()
            ) : (
              <div className="space-y-3">
                {data.sections.decisions.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.statement}</p>
                      {item.owner && (
                        <p className="text-xs text-slate-500">
                          <strong>Owner / Decision Lead:</strong> {item.owner}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg transition cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Evidence</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Ownership Map */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Ownership Map</h2>
                <p className="text-xs text-slate-500">Responsibility assignment across sub-systems and rotations</p>
              </div>
            </div>

            {data.sections.ownership.length === 0 ? (
              renderSectionEmpty()
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.sections.ownership.map((item) => (
                  <div key={item.id} className="p-4 bg-blue-50/40 rounded-xl border border-blue-200 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                        <span>{item.owner || 'Unassigned / Needs Owner'}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">{item.statement}</p>
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="self-start flex items-center gap-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-900 cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Source: {item.chunk_label || 'Cited chunk'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Open Questions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Open Questions</h2>
                <p className="text-xs text-slate-500">Unresolved ambiguities that need early clarification with stakeholders</p>
              </div>
            </div>

            {data.sections.open_questions.length === 0 ? (
              renderSectionEmpty()
            ) : (
              <div className="space-y-3">
                {data.sections.open_questions.map((item) => (
                  <div key={item.id} className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.statement}</p>
                      {item.owner && (
                        <p className="text-xs text-slate-500">
                          <strong>Point of Contact:</strong> {item.owner}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg transition cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Evidence</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Risks */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                5
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Risks & Vulnerabilities</h2>
                <p className="text-xs text-slate-500">Documented technical debt, load bottlenecks, and compliance checkpoints</p>
              </div>
            </div>

            {data.sections.risks.length === 0 ? (
              renderSectionEmpty()
            ) : (
              <div className="space-y-3">
                {data.sections.risks.map((item) => (
                  <div key={item.id} className="p-4 bg-rose-50/40 rounded-xl border border-rose-200 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.statement}</p>
                      {item.owner && (
                        <p className="text-xs text-slate-500">
                          <strong>Impacted Owner:</strong> {item.owner}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg transition cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Evidence</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 6: Dependencies */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                6
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">External Dependencies</h2>
                <p className="text-xs text-slate-500">Third-party APIs, peer teams, certificates, and infrastructure locks</p>
              </div>
            </div>

            {data.sections.dependencies.length === 0 ? (
              renderSectionEmpty()
            ) : (
              <div className="space-y-3">
                {data.sections.dependencies.map((item) => (
                  <div key={item.id} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.statement}</p>
                      {item.owner && (
                        <p className="text-xs text-slate-500">
                          <strong>Dependency Owner:</strong> {item.owner}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg transition cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Evidence</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Handover Footer Required by Section 12 */}
          <footer className="pt-8 border-t border-slate-200 text-xs text-slate-500 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-slate-700">Trailmark Handover Verification Seal</p>
                <p>
                  Built from <strong>{data.total_sources}</strong> source document(s) &bull;{' '}
                  <strong>{data.total_approved}</strong> human-approved handover item(s) &bull;{' '}
                  <strong>{data.total_extracted}</strong> total AI extractions evaluated.
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-600 font-medium">Confidentiality Guarantee</p>
                <p className="text-[11px] text-slate-400">
                  Unapproved and confidential items are strictly excluded from this public handover.
                </p>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-slate-400">
              Demo uses synthetic data. Do not upload confidential files. All uploaded data is scheduled for 24-hour deletion.
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
