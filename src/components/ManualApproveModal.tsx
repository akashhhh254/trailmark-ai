import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ItemRecord } from '../types';

interface ManualApproveModalProps {
  item: ItemRecord | null;
  onClose: () => void;
  onConfirm: (itemId: string, note: string) => void;
}

export const ManualApproveModal: React.FC<ManualApproveModalProps> = ({ item, onClose, onConfirm }) => {
  if (!item) return null;

  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || note.trim().length < 5) {
      setError('A written manual verification note (at least 5 characters) is required to approve an unverified item.');
      return;
    }

    onConfirm(item.id, note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-semibold text-base">Manual Verification Required</h3>
              <p className="text-xs text-amber-100">Item is unverified against cited chunk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-amber-200 hover:text-white hover:bg-amber-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApprove} className="p-6 space-y-4">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">Trust & Verification Policy</p>
            <p>
              Unverified items cannot be approved without manual verification and a written reviewer justification recorded in the immutable audit log.
            </p>
          </div>

          <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Statement</span>
            <p className="font-medium text-slate-800">{item.statement}</p>
            {item.verification_note && (
              <p className="text-rose-700 text-[11px] pt-1">
                <strong>Engine Note:</strong> {item.verification_note}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Manual Verification Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Explain how you verified this fact outside the cited chunk (e.g., 'Confirmed directly with team lead Marcus during exit call')"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-900"
              required
            />
            {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Approve</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
