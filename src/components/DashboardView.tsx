import React from 'react';
import {
  Sparkles,
  Plus,
  ArrowRight,
  FolderGit2,
  FileCheck2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  AlertTriangle,
  User,
  ExternalLink,
} from 'lucide-react';
import { CaseRecord, VerificationMetrics } from '../types';

interface DashboardViewProps {
  cases: CaseRecord[];
  currentCase: CaseRecord | null;
  metrics: VerificationMetrics | null;
  onSelectCase: (caseId: string) => void;
  onNewHandover: () => void;
  onLoadSample: () => void;
  sampleLoading: boolean;
  onOpenReview: () => void;
  onOpenHandover: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  currentCase,
  metrics,
  onSelectCase,
  onNewHandover,
  onLoadSample,
  sampleLoading,
  onOpenReview,
  onOpenHandover,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* 1. Welcome Section & Value Proposition */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs text-stone-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Evidence-Linked Team Transition Protocol</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Welcome to Trailmark
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
            Turn scattered architectural notes, Slack discussions, and spreadsheets into clean, verified project handover documentation. Every assertion is tied directly to source evidence and requires human approval.
          </p>
        </div>

        {/* Quick Action Pathways */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onNewHandover}
            className="py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Handover</span>
          </button>

          <button
            onClick={onLoadSample}
            disabled={sampleLoading}
            className="py-2 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-lg text-xs font-medium flex items-center gap-2 transition cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{sampleLoading ? 'Loading Sample Project...' : 'Try Sample Project (3-Min Walkthrough)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-stone-600 block">Total Handover Projects</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-stone-900 tracking-tight font-mono">
              {cases.length}
            </span>
            <span className="text-xs text-stone-600">active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-stone-600 block">Current Evidence Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-stone-900 tracking-tight font-mono">
              {metrics ? `${metrics.verification_rate}%` : '—'}
            </span>
            <span className="text-xs text-emerald-700 font-medium">grounded</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-stone-600 block">Approved Handover Items</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-stone-900 tracking-tight font-mono">
              {metrics ? metrics.verified : '—'}
            </span>
            <span className="text-xs text-stone-600">verified</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-stone-600 block">Pending Review</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-stone-900 tracking-tight font-mono">
              {metrics ? metrics.unverified + metrics.approximate : '—'}
            </span>
            <span className="text-xs text-stone-600">in queue</span>
          </div>
        </div>
      </div>

      {/* 3. Current Project Focus Banner if Selected */}
      {currentCase && (
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                Active Project
              </span>
              <span className="text-[11px] text-stone-600">·</span>
              <span className="text-xs text-emerald-700 font-medium">Ready for review</span>
            </div>
            <h2 className="text-lg font-semibold text-stone-900">{currentCase.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
              <span>
                Outgoing: <strong className="text-stone-800">{currentCase.leaver_name}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Successor: <strong className="text-stone-800">{currentCase.newcomer_role}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReview}
              className="py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>Review Evidence Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenHandover}
              className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <span>View Handover Doc</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Recent Handover Projects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">Recent Projects</h2>
          <span className="text-xs text-stone-600">Click to switch workspace</span>
        </div>

        {cases.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-600 text-xs space-y-2">
            <FolderGit2 className="w-6 h-6 mx-auto text-stone-400" />
            <p className="font-medium text-stone-800">No project cases created yet</p>
            <p>Click "Try Sample Project" above to load our realistic demonstration case.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
            {cases.map((c) => {
              const isSelected = currentCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className={`p-4 flex flex-wrap items-center justify-between gap-3 transition cursor-pointer ${
                    isSelected ? 'bg-stone-50' : 'hover:bg-stone-50/60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-900">{c.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600">
                      From {c.leaver_name} to {c.newcomer_role}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-stone-600">
                    <span className="font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c.id);
                        onOpenReview();
                      }}
                      className="py-1 px-2.5 rounded-md text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 transition"
                    >
                      Open &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Slite-Style Principles Box */}
      <div className="p-5 rounded-xl border border-stone-200 bg-stone-100/40 text-xs text-stone-600 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-stone-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>The Trailmark Trust Standard</span>
        </div>
        <p className="leading-relaxed">
          Unlike generic AI chat tools that generate ungrounded summaries, Trailmark uses an independent deterministic engine to verify quote occurrences and character offsets in exact source chunks. Only human-approved statements are published to the public handover.
        </p>
      </div>
    </div>
  );
};
