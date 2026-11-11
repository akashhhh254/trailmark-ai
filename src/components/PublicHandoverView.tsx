import React, { useState } from 'react';
import {
  ShieldCheck,
  Share2,
  Download,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
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
    setTimeout(() => setCopied(false), 2000);
  };

  const renderEmptySection = () => (
    <div className="py-4 text-xs text-stone-600 italic">
      Nothing approved for this section yet
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-stone-900 pb-20">
      {/* Slite-Style Document Top Action Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-13 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="py-1 px-2.5 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-md transition cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Review Workspace</span>
              </button>
            )}
            <span className="text-xs text-stone-600 hidden sm:inline">
              Verified Handover Document
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="py-1 px-2.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-stone-500" />
              <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>

            <a
              href={markdownUrl}
              download
              className="py-1 px-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Slite-style Document Page */}
      <main className="max-w-3xl mx-auto px-4 sm:px-8 mt-8">
        <article className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-6 sm:p-12 space-y-10">
          {/* Document Header */}
          <header className="space-y-4 pb-8 border-b border-stone-200">
            <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
              <FileText className="w-4 h-4 text-stone-500" />
              <span>Official Transition Document</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">{data.total_approved} Approved Items</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-stone-900">
              {data.case.name}
            </h1>

            {/* Stakeholder Details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-600 pt-1">
              <span>
                Outgoing Lead: <strong className="text-stone-900">{data.case.leaver_name}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Incoming Role: <strong className="text-stone-900">{data.case.newcomer_role}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Updated: <strong className="text-stone-900">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </span>
            </div>

            {/* Quiet Guarantee Callout */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Verification Standard:</strong> This public handover includes only human-approved, non-confidential items verified against original project documentation.
              </p>
            </div>
          </header>

          {/* Section 1: Start Here */}
          <section className="space-y-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-stone-900">1. Start Here</h2>
              <p className="text-xs text-stone-600">High-priority operational risks followed by immediate transition tasks.</p>
            </div>

            {data.sections.start_here.length === 0 ? (
              renderEmptySection()
            ) : (
              <div className="space-y-2.5 pt-1">
                {data.sections.start_here.map((item) => {
                  const isRisk = item.type === 'risk';
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-stone-50/70 hover:bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isRisk ? 'text-rose-700' : 'text-stone-700'
                              }`}
                            >
                              {isRisk ? 'Critical Risk' : 'Next Action'}
                            </span>
                            {item.owner && (
                              <>
                                <span aria-hidden="true" className="text-stone-300">·</span>
                                <span className="text-stone-600">Owner: {item.owner}</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-stone-900 leading-snug">{item.statement}</p>
                        </div>

                        <button
                          onClick={() => onOpenEvidence(item)}
                          className="shrink-0 text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer pt-0.5"
                        >
                          <span>Evidence</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 2: Decisions */}
          <section className="space-y-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-stone-900">2. Key Decisions</h2>
              <p className="text-xs text-stone-600">Architectural, technical, and operational decisions agreed upon.</p>
            </div>

            {data.sections.decisions.length === 0 ? (
              renderEmptySection()
            ) : (
              <div className="space-y-2.5 pt-1">
                {data.sections.decisions.map((item) => (
                  <div key={item.id} className="p-3.5 bg-stone-50/70 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-stone-900">{item.statement}</p>
                      {item.owner && (
                        <p className="text-[11px] text-stone-600">Lead: {item.owner}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="shrink-0 text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Evidence</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Ownership Map */}
          <section className="space-y-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-stone-900">3. Ownership Map</h2>
              <p className="text-xs text-stone-600">Component and task ownership responsibilities.</p>
            </div>

            {data.sections.ownership.length === 0 ? (
              renderEmptySection()
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {data.sections.ownership.map((item) => (
                  <div key={item.id} className="p-3.5 bg-stone-50/70 rounded-xl border border-stone-200/80 flex flex-col justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-stone-900 block">
                        {item.owner || 'Unassigned / Needs Owner'}
                      </span>
                      <p className="text-xs text-stone-600">{item.statement}</p>
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="text-[11px] font-medium text-stone-600 hover:text-stone-900 self-start cursor-pointer flex items-center gap-1"
                    >
                      <span>Source: {item.chunk_label || 'Cited chunk'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 4: Open Questions */}
          <section className="space-y-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-stone-900">4. Open Questions</h2>
              <p className="text-xs text-stone-600">Unresolved ambiguities that need early stakeholder alignment.</p>
            </div>

            {data.sections.open_questions.length === 0 ? (
              renderEmptySection()
            ) : (
              <div className="space-y-2.5 pt-1">
                {data.sections.open_questions.map((item) => (
                  <div key={item.id} className="p-3.5 bg-stone-50/70 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-stone-900">{item.statement}</p>
                      {item.owner && (
                        <p className="text-[11px] text-stone-600">Assignee: {item.owner}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="shrink-0 text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Evidence</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Risks */}
          <section className="space-y-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-stone-900">5. Risks & Vulnerabilities</h2>
              <p className="text-xs text-stone-600">Technical debt, performance limits, and compliance considerations.</p>
            </div>

            {data.sections.risks.length === 0 ? (
              renderEmptySection()
            ) : (
              <div className="space-y-2.5 pt-1">
                {data.sections.risks.map((item) => (
                  <div key={item.id} className="p-3.5 bg-stone-50/70 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-stone-900">{item.statement}</p>
                      {item.owner && (
                        <p className="text-[11px] text-stone-600">Impacted: {item.owner}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="shrink-0 text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Evidence</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 6: Dependencies */}
          <section className="space-y-3">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-stone-900">6. External Dependencies</h2>
              <p className="text-xs text-stone-600">Third-party integrations, certificates, and infrastructure requirements.</p>
            </div>

            {data.sections.dependencies.length === 0 ? (
              renderEmptySection()
            ) : (
              <div className="space-y-2.5 pt-1">
                {data.sections.dependencies.map((item) => (
                  <div key={item.id} className="p-3.5 bg-stone-50/70 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-stone-900">{item.statement}</p>
                      {item.owner && (
                        <p className="text-[11px] text-stone-600">Point of Contact: {item.owner}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenEvidence(item)}
                      className="shrink-0 text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Evidence</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Slite Document Footer Seal */}
          <footer className="pt-8 border-t border-stone-200 text-xs text-stone-600 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>
                Verified across <strong>{data.total_sources}</strong> source document(s) &bull;{' '}
                <strong>{data.total_approved}</strong> human-approved handover item(s).
              </span>
              <span className="text-[11px] text-stone-600">
                Unapproved and confidential items excluded.
              </span>
            </div>
            <p className="text-[11px] text-stone-600">
              Demo uses synthetic data. Do not upload confidential files. All uploaded data is subject to 24-hour cleanup.
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
};
