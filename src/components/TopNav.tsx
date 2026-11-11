import React from 'react';
import {
  PanelLeft,
  ChevronRight,
  Share2,
  Download,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { CaseRecord } from '../types';
import { NavTab } from './Sidebar';

interface TopNavProps {
  currentCase: CaseRecord | null;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onToggleSidebar: () => void;
  onCopyShareLink: () => void;
  shareCopied: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentCase,
  activeTab,
  onSelectTab,
  onToggleSidebar,
  onCopyShareLink,
  shareCopied,
}) => {
  const getTabLabel = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Overview';
      case 'project':
        return 'Project Workspace';
      case 'review':
        return 'Review Queue';
      case 'handovers':
        return 'Public Handover';
      case 'sources':
        return 'Sources & Chunks';
      case 'settings':
        return 'Settings';
    }
  };

  return (
    <header className="h-13 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Hamburger & Slite-style Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-100 transition cursor-pointer lg:hidden"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <nav className="flex items-center gap-1.5 text-stone-600 font-medium">
          <span
            onClick={() => onSelectTab('dashboard')}
            className="hover:text-stone-900 cursor-pointer"
          >
            Trailmark
          </span>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          {currentCase && (
            <>
              <span
                onClick={() => onSelectTab('project')}
                className="hover:text-stone-900 cursor-pointer max-w-[140px] sm:max-w-[220px] truncate"
                title={currentCase.name}
              >
                {currentCase.name}
              </span>
              <ChevronRight className="w-3 h-3 text-stone-400" />
            </>
          )}
          <span className="text-stone-900 font-semibold">{getTabLabel(activeTab)}</span>
        </nav>
      </div>

      {/* Right: Quick Context Actions */}
      <div className="flex items-center gap-2">
        {currentCase && activeTab !== 'dashboard' && (
          <>
            <button
              onClick={onCopyShareLink}
              className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-md transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">{shareCopied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <a
              href={`/h/${currentCase.share_token}.md`}
              download
              className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-md transition"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Markdown</span>
            </a>

            {activeTab !== 'handovers' && (
              <button
                onClick={() => onSelectTab('handovers')}
                className="flex items-center gap-1 py-1 px-2.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition cursor-pointer shadow-2xs"
              >
                <span>Handover Doc</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
};
