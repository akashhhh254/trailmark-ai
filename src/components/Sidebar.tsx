import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  FileCheck2,
  CheckSquare,
  FileText,
  Settings,
  Plus,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
} from 'lucide-react';
import { CaseRecord } from '../types';

export type NavTab = 'dashboard' | 'project' | 'review' | 'handovers' | 'sources' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentCase: CaseRecord | null;
  cases: CaseRecord[];
  onSelectCase: (caseId: string) => void;
  onNewHandover: () => void;
  onLoadSample: () => void;
  sampleLoading: boolean;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentCase,
  cases,
  onSelectCase,
  onNewHandover,
  onLoadSample,
  sampleLoading,
  isOpen,
  onToggleSidebar,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-30 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[#fbfbfa] border-r border-stone-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-stone-900 flex items-center justify-center text-white shadow-xs">
              <span className="font-serif font-black text-sm tracking-tighter">T</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-stone-900">Trailmark</span>
                <span className="text-[10px] font-mono px-1 rounded bg-stone-200/70 text-stone-600">v2</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-none mt-0.5">Slite-Inspired Handover</p>
            </div>
          </div>
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1 text-stone-400 hover:text-stone-700 rounded-md"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: New Handover */}
        <div className="p-3 border-b border-stone-200/60 space-y-1.5">
          <button
            onClick={onNewHandover}
            className="w-full py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Handover</span>
          </button>

          <button
            onClick={onLoadSample}
            disabled={sampleLoading}
            className="w-full py-1.5 px-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/90 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{sampleLoading ? 'Loading Sample...' : 'Try Sample Project'}</span>
          </button>
        </div>

        {/* Current Active Case Context */}
        {currentCase && (
          <div className="px-3 pt-3 pb-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 px-2 block mb-1">
              Active Project
            </label>
            <div className="relative">
              <select
                value={currentCase.id}
                onChange={(e) => onSelectCase(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-lg py-1.5 px-2.5 pr-7 appearance-none truncate cursor-pointer hover:border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Main Navigation Menu */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-stone-200/80 text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-stone-500" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => onSelectTab('project')}
            disabled={!currentCase}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              !currentCase
                ? 'opacity-40 cursor-not-allowed text-stone-400'
                : activeTab === 'project'
                ? 'bg-stone-200/80 text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-4 h-4 text-stone-500" />
              <span>Project Workspace</span>
            </div>
            {currentCase && (
              <span className="text-[10px] text-stone-600 font-mono">1</span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('review')}
            disabled={!currentCase}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              !currentCase
                ? 'opacity-40 cursor-not-allowed text-stone-400'
                : activeTab === 'review'
                ? 'bg-stone-200/80 text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4 text-stone-500" />
              <span>Review Queue</span>
            </div>
            {currentCase && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-medium">
                Verify
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('handovers')}
            disabled={!currentCase}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              !currentCase
                ? 'opacity-40 cursor-not-allowed text-stone-400'
                : activeTab === 'handovers'
                ? 'bg-stone-200/80 text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-4 h-4 text-stone-500" />
              <span>All Handovers</span>
            </div>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </button>

          <button
            onClick={() => onSelectTab('sources')}
            disabled={!currentCase}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              !currentCase
                ? 'opacity-40 cursor-not-allowed text-stone-400'
                : activeTab === 'sources'
                ? 'bg-stone-200/80 text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/40'
            }`}
          >
            <FileText className="w-4 h-4 text-stone-500" />
            <span>Sources & Chunks</span>
          </button>

          <div className="pt-3 mt-3 border-t border-stone-200/70">
            <button
              onClick={() => onSelectTab('settings')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-stone-200/80 text-stone-900 font-semibold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/40'
              }`}
            >
              <Settings className="w-4 h-4 text-stone-500" />
              <span>Settings</span>
            </button>
          </div>
        </nav>

        {/* Footer Notice */}
        <div className="p-3 border-t border-stone-200/80 bg-stone-100/50">
          <div className="flex items-start gap-2 text-[11px] text-stone-600">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-800">Slite-Class Document Engine</p>
              <p className="text-[10px] text-stone-600 mt-0.5 leading-snug">
                Strict evidence verification & 24h retention policy.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
