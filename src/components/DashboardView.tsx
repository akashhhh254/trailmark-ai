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
  Upload,
  CheckSquare,
  Activity,
} from 'lucide-react';
import { CaseRecord, UserRecord, VerificationMetrics } from '../types';

interface DashboardViewProps {
  cases: CaseRecord[];
  currentCase: CaseRecord | null;
  currentUser: UserRecord | null;
  metrics: VerificationMetrics | null;
  onSelectCase: (caseId: string) => void;
  onNewHandover: () => void;
  onLoadSample: () => void;
  sampleLoading: boolean;
  onOpenReview: () => void;
  onOpenHandover: () => void;
  onOpenSources: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  currentCase,
  currentUser,
  metrics,
  onSelectCase,
  onNewHandover,
  onLoadSample,
  sampleLoading,
  onOpenReview,
  onOpenHandover,
  onOpenSources,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = currentUser ? currentUser.name.split(' ')[0] : 'Team Lead';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* 1. Header with Personalized Greeting (Section 6) */}
      <div className="space-y-3 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Evidence-Linked Handover Operations</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Here's what's happening across your projects.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onNewHandover}
              className="py-2 px-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
            <button
              onClick={onLoadSample}
              disabled={sampleLoading}
              className="py-2 px-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{sampleLoading ? 'Loading Sample...' : 'Try Sample Project'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid (Section 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-stone-500 block">Total Projects</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-stone-900 tracking-tight font-mono">
              {cases.length}
            </span>
            <span className="text-xs text-stone-400">active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-stone-500 block">Total Handovers</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-stone-900 tracking-tight font-mono">
              {cases.filter((c) => c.status === 'ready').length || cases.length}
            </span>
            <span className="text-xs text-stone-400">generated</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-stone-500 block">Pending Reviews</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-stone-900 tracking-tight font-mono">
              {metrics ? metrics.unverified + metrics.approximate : '0'}
            </span>
            <span className="text-xs text-amber-700 font-medium">in queue</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-stone-500 block">Approved Decisions</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-emerald-800 tracking-tight font-mono">
              {metrics ? metrics.verified : '0'}
            </span>
            <span className="text-xs text-emerald-700 font-medium">verified</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Toolbar (Section 6) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onNewHandover}
            className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition cursor-pointer space-y-1 shadow-2xs group"
          >
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition">
              <Plus className="w-4 h-4" />
            </div>
            <p className="font-semibold text-xs text-stone-900">Create New Project</p>
            <p className="text-[11px] text-stone-500">Initiate handover</p>
          </button>

          <button
            onClick={onOpenSources}
            className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition cursor-pointer space-y-1 shadow-2xs group"
          >
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition">
              <Upload className="w-4 h-4" />
            </div>
            <p className="font-semibold text-xs text-stone-900">Upload Sources</p>
            <p className="text-[11px] text-stone-500">Attach docs & notes</p>
          </button>

          <button
            onClick={onOpenReview}
            className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition cursor-pointer space-y-1 shadow-2xs group"
          >
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition">
              <CheckSquare className="w-4 h-4" />
            </div>
            <p className="font-semibold text-xs text-stone-900">Open Review Queue</p>
            <p className="text-[11px] text-stone-500">Audit extracted claims</p>
          </button>

          <button
            onClick={onOpenHandover}
            className="p-3.5 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-left transition cursor-pointer space-y-1 shadow-2xs group"
          >
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <p className="font-semibold text-xs text-stone-900">Start New Handover</p>
            <p className="text-[11px] text-stone-500">Publish document</p>
          </button>
        </div>
      </div>

      {/* 4. Active Case Card (if available) */}
      {currentCase && (
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Current Active Project
              </span>
              <span className="text-[11px] text-stone-300">·</span>
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

      {/* 5. Recent Activity & Recent Projects Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Projects (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Recent Projects</h2>
            <span className="text-xs text-stone-400">Click to switch workspace</span>
          </div>

          {cases.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-500 text-xs space-y-2">
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
                      <p className="text-xs text-stone-500">
                        From {c.leaver_name} to {c.newcomer_role}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="font-mono text-[11px]">
                        {new Date(c.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
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

        {/* Recent Activity Stream (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center gap-1.5 text-stone-900 font-semibold text-sm">
            <Activity className="w-4 h-4 text-stone-500" />
            <span>Recent Activity</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-medium text-stone-900">Evidence Verification Completed</p>
                <p className="text-stone-500 text-[11px]">Aegis Pay Settlement Engine V2 quotes matched</p>
                <span className="text-stone-400 text-[10px] font-mono">Today</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-medium text-stone-900">4 Sources Ingested</p>
                <p className="text-stone-500 text-[11px]">Markdown, TXT, CSV, JSON chunked</p>
                <span className="text-stone-400 text-[10px] font-mono">Today</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-medium text-stone-900">Prompt Injection Isolated</p>
                <p className="text-stone-500 text-[11px]">Adversarial attempt neutralized as data</p>
                <span className="text-stone-400 text-[10px] font-mono">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
