import React, { useEffect, useState } from 'react';
import { X, History, Clock, ArrowRight } from 'lucide-react';
import { ItemRecord, ItemVersionRecord } from '../types';

interface VersionHistoryModalProps {
  item: ItemRecord | null;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ item, onClose }) => {
  const [versions, setVersions] = useState<ItemVersionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!item) {
      setVersions([]);
      return;
    }

    setLoading(true);
    fetch(`/api/cases/${item.case_id}/items/${item.id}/versions`)
      .then((res) => res.json())
      .then((data) => {
        setVersions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load version history:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [item]);

  if (!item) return null;

  const formatAction = (action: string) => {
    switch (action) {
      case 'create':
        return { label: 'Extracted by AI', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'approve':
        return { label: 'Approved by Reviewer', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'reject':
        return { label: 'Rejected by Reviewer', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'edit':
        return { label: 'Edited by Reviewer', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'confidential_toggle':
        return { label: 'Confidentiality Toggled', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'add_note':
        return { label: 'Note Added', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: action, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-base">Item Audit & Version History</h3>
              <p className="text-xs text-slate-400">Complete immutable record of all human review actions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Statement</span>
          <p className="font-medium text-slate-800 line-clamp-2 mt-0.5">{item.statement}</p>
        </div>

        {/* History Timeline */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-500">Loading audit history...</div>
          )}

          {!loading && versions.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">No version records found.</div>
          )}

          {!loading &&
            versions.map((ver, idx) => {
              const actionMeta = formatAction(ver.action);
              const isExpanded = expandedId === ver.id;
              let snapshot: any = null;
              try {
                snapshot = JSON.parse(ver.snapshot_json);
              } catch {
                snapshot = ver.snapshot_json;
              }

              return (
                <div key={ver.id} className="relative pl-6 border-l-2 border-indigo-200 pb-4 last:pb-0">
                  <div className="absolute -left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${actionMeta.color}`}>
                        {actionMeta.label}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(ver.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>

                    {snapshot && (
                      <div className="text-xs text-slate-700 space-y-1">
                        <p>
                          <strong>Review Status:</strong> <span className="capitalize">{snapshot.review_status}</span>
                        </p>
                        {snapshot.reviewer_note && (
                          <p className="bg-white p-2 rounded border border-slate-200 text-slate-800">
                            <strong>Note:</strong> {snapshot.reviewer_note}
                          </p>
                        )}
                        {snapshot.confidential === 1 && (
                          <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            Marked Confidential
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : ver.id)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                    >
                      {isExpanded ? 'Hide Raw Snapshot' : 'View Raw Snapshot JSON'}
                    </button>

                    {isExpanded && (
                      <pre className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-40">
                        {JSON.stringify(snapshot, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded-lg transition cursor-pointer"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
