import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { CaseRecord, SecurityFinding, SourceRecord } from '../types';

interface SourcesViewProps {
  currentCase: CaseRecord;
  sources: SourceRecord[];
  securityFindings: SecurityFinding[];
}

export const SourcesView: React.FC<SourcesViewProps> = ({
  currentCase,
  sources,
  securityFindings,
}) => {
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(
    sources.length > 0 ? sources[0].id : null
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* 1. Header */}
      <div className="space-y-1 pb-6 border-b border-stone-200">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Sources & Chunk Inspector
        </h1>
        <p className="text-xs text-stone-500">
          Examine ingested documentation and deterministic line-chunking boundaries for {currentCase.name}.
        </p>
      </div>

      {/* 2. Security Shield Inspection Report */}
      {securityFindings.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Pre-Processing Security Scanner: {securityFindings.length} Pattern(s) Flagged</span>
          </div>
          <p className="text-stone-700 leading-relaxed">
            All ingested content is treated strictly as <strong>DATA</strong>, never executable instructions. Injected prompts are automatically isolated and neutralized.
          </p>
          <div className="space-y-1.5 pt-1">
            {securityFindings.map((f, i) => (
              <div key={i} className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                <span className="font-mono uppercase font-bold text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  {f.type}
                </span>
                <div>
                  <p className="font-medium text-stone-900">{f.message}</p>
                  <p className="font-mono text-[11px] text-stone-500 mt-0.5 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                    Snippet: {f.snippet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Ingested Sources List with Chunk Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">Ingested Source Documents ({sources.length})</h2>
          <span className="text-xs text-stone-400">Deterministic line-split chunking</span>
        </div>

        <div className="space-y-3">
          {sources.map((src) => {
            const isExpanded = expandedSourceId === src.id;
            return (
              <div
                key={src.id}
                className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden"
              >
                <div
                  onClick={() => setExpandedSourceId(isExpanded ? null : src.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-stone-900">{src.filename}</p>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono mt-0.5">
                        <span className="uppercase">{src.kind}</span>
                        <span>·</span>
                        <span>{(src.char_count / 1000).toFixed(1)}k chars</span>
                        <span>·</span>
                        <span>Source #{src.ordinal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 font-medium hidden sm:inline">
                      {isExpanded ? 'Hide Raw Text' : 'View Raw Text'}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-stone-50/70 border-t border-stone-200">
                    <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-stone-800 bg-white p-4 rounded-lg border border-stone-200 max-h-96 overflow-y-auto">
                      {src.content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
