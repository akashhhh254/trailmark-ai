import React from 'react';
import {
  FolderGit2,
  FileText,
  User,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { CaseRecord, SourceRecord, VerificationMetrics } from '../types';

interface ProjectWorkspaceViewProps {
  currentCase: CaseRecord;
  sources: SourceRecord[];
  metrics: VerificationMetrics | null;
  onRunExtraction: (forceLive: boolean) => void;
  extracting: boolean;
  onOpenReview: () => void;
  onOpenHandover: () => void;
  onOpenUploadModal: () => void;
}

export const ProjectWorkspaceView: React.FC<ProjectWorkspaceViewProps> = ({
  currentCase,
  sources,
  metrics,
  onRunExtraction,
  extracting,
  onOpenReview,
  onOpenHandover,
  onOpenUploadModal,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* 1. Project Title & Overview Header */}
      <div className="space-y-3 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <FolderGit2 className="w-4 h-4 text-stone-600" />
          <span>Project Workspace</span>
          <span aria-hidden="true">·</span>
          <span className="text-stone-700 font-mono text-[11px]">{currentCase.id}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
              {currentCase.name}
            </h1>
            <p className="text-xs text-stone-600">
              Created on {new Date(currentCase.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunExtraction(true)}
              disabled={extracting}
              className="py-1.5 px-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${extracting ? 'animate-spin' : ''}`} />
              <span>{extracting ? 'Re-extracting...' : 'Run Reconstruction'}</span>
            </button>

            <button
              onClick={onOpenReview}
              className="py-1.5 px-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>Go to Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Transition Stakeholders Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Outgoing Team Member (Leaver)
          </span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 font-medium text-xs">
              <User className="w-4 h-4 text-stone-500" />
            </div>
            <div>
              <p className="font-semibold text-xs text-stone-900">{currentCase.leaver_name}</p>
              <p className="text-[11px] text-stone-500">Author & Context Lead</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Incoming Role / Successor
          </span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-medium text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-xs text-stone-900">{currentCase.newcomer_role}</p>
              <p className="text-[11px] text-stone-500">Handover Recipient</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Status & Evidence Progress */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Handover Preparation Progress</h2>
            <p className="text-xs text-stone-500">Deterministic quote verification against chunk corpus</p>
          </div>
          {metrics && (
            <span className="text-xs font-semibold text-stone-900 font-mono">
              {metrics.verification_rate}% Verified
            </span>
          )}
        </div>

        {metrics && (
          <div className="space-y-2">
            <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full"
                style={{ width: `${metrics.verification_rate}%` }}
                title={`Verified: ${metrics.verified}`}
              />
              <div
                className="bg-amber-400 h-full"
                style={{
                  width: `${metrics.total > 0 ? (metrics.approximate / metrics.total) * 100 : 0}%`,
                }}
                title={`Approximate: ${metrics.approximate}`}
              />
              <div
                className="bg-rose-400 h-full"
                style={{
                  width: `${metrics.total > 0 ? (metrics.unverified / metrics.total) * 100 : 0}%`,
                }}
                title={`Unverified: ${metrics.unverified}`}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
              <span>{metrics.verified} exact quotes verified</span>
              <span>{metrics.approximate} normalized</span>
              <span>{metrics.unverified} unverified</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Uploaded Sources List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-stone-900">Uploaded Sources</h2>
            <span className="text-xs text-stone-500 font-mono">({sources.length} files)</span>
          </div>
          <button
            onClick={onOpenUploadModal}
            className="py-1 px-2.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition cursor-pointer flex items-center gap-1"
          >
            <Upload className="w-3 h-3 text-stone-500" />
            <span>Add Sources</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
          {sources.map((src) => (
            <div key={src.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <p className="font-medium text-stone-800">{src.filename}</p>
                  <p className="text-[11px] text-stone-400 uppercase font-mono">
                    Format: {src.kind} &bull; {(src.char_count / 1000).toFixed(1)}k chars
                  </p>
                </div>
              </div>
              <span className="text-stone-500 font-mono text-[11px]">Source #{src.ordinal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
