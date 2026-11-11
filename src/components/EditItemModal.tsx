import React, { useState } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';
import { ExtractionCategory, ItemRecord } from '../types';

interface EditItemModalProps {
  item: ItemRecord | null;
  onClose: () => void;
  onSave: (itemId: string, updates: { statement: string; owner: string | null; type: ExtractionCategory }) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({ item, onClose, onSave }) => {
  if (!item) return null;

  const [statement, setStatement] = useState(item.statement);
  const [owner, setOwner] = useState(item.owner || '');
  const [type, setType] = useState<ExtractionCategory>(item.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) return;

    onSave(item.id, {
      statement: statement.trim(),
      owner: owner.trim() ? owner.trim() : null,
      type,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-base">Edit Handover Item</h3>
              <p className="text-xs text-slate-400">Editing resets this item to draft status for re-review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning banner */}
        <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Policy rule:</strong> Modifying statements or ownership resets review status back to <strong>Draft</strong>.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ExtractionCategory)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-900"
            >
              <option value="decision">Decision — Important architectural/product choice</option>
              <option value="ownership">Ownership — Component or service lead</option>
              <option value="risk">Risk — Critical bottleneck, threat or flaw</option>
              <option value="open_question">Open Question — Unresolved ambiguity</option>
              <option value="dependency">Dependency — External system/blocker</option>
              <option value="next_action">Next Action — High priority transition task</option>
            </select>
          </div>

          {/* Statement */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Statement Summary</label>
            <textarea
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-900"
              placeholder="Concise, factual handover statement"
              required
            />
          </div>

          {/* Owner */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Responsible Owner <span className="font-normal text-slate-500">(Optional / Nullable)</span>
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Marcus Cole (or leave blank if unassigned)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-900"
            />
          </div>

          {/* Readonly Quote Preview */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-500 mb-1">Supporting Verbatim Quote</span>
            <p className="text-xs italic bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 line-clamp-3">
              "{item.quote}"
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition"
            >
              Save Changes (Set to Draft)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
