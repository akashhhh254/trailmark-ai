import React from 'react';
import { ShieldCheck, FileText, Plus, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { CaseRecord } from '../types';

interface HeaderProps {
  currentCase: CaseRecord | null;
  activeView: 'setup' | 'review' | 'handover';
  onNavigate: (view: 'setup' | 'review' | 'handover') => void;
  onLoadSample: () => void;
  onNewCase: () => void;
  sampleLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentCase,
  activeView,
  onNavigate,
  onLoadSample,
  onNewCase,
  sampleLoading,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Compliance Notice Bar */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Judge Notice:</strong> Demo uses synthetic data. Do not upload confidential files. All data is isolated and subject to a 24-hour cleanup policy.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] text-amber-300/80">
          Round 2 — Team ERROR404
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('setup')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Trailmark</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Handover
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Evidence-Linked Project Transitions
            </p>
          </div>
        </div>

        {/* Center Navigation if Case is Active */}
        {currentCase && (
          <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => onNavigate('review')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                activeView === 'review'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Review Workspace</span>
            </button>
            <button
              onClick={() => onNavigate('handover')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                activeView === 'handover'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Handover</span>
            </button>
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            disabled={sampleLoading}
            title="Load the bundled synthetic messy project with full evidence demo"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Try Sample Project</span>
            <span className="sm:hidden">Sample</span>
          </button>

          <button
            onClick={onNewCase}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Case</span>
          </button>
        </div>
      </div>
    </header>
  );
};
