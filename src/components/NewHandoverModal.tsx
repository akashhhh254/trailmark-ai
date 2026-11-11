import React, { useState } from 'react';
import { X, Plus, Upload, FileText, AlertCircle, Sparkles } from 'lucide-react';

interface NewHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    projectName: string;
    leaverName: string;
    newcomerRole: string;
    files: Array<{ filename: string; kind: 'txt' | 'md' | 'csv' | 'json'; content: string }>;
    pastedText: string;
  }) => Promise<void>;
  loading: boolean;
}

export const NewHandoverModal: React.FC<NewHandoverModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  if (!isOpen) return null;

  const [projectName, setProjectName] = useState('');
  const [leaverName, setLeaverName] = useState('');
  const [newcomerRole, setNewcomerRole] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ filename: string; kind: 'txt' | 'md' | 'csv' | 'json'; content: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let kind: 'txt' | 'md' | 'csv' | 'json' = 'txt';
      if (ext === 'md') kind = 'md';
      else if (ext === 'csv') kind = 'csv';
      else if (ext === 'json') kind = 'json';

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUploadedFiles((prev) => [...prev, { filename: file.name, kind, content }]);
      };
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!projectName.trim() || !leaverName.trim() || !newcomerRole.trim()) {
      setError('Please fill in project name, outgoing leaver name, and newcomer role.');
      return;
    }

    if (uploadedFiles.length === 0 && !pastedText.trim()) {
      setError('Please upload at least one source file or paste handover notes.');
      return;
    }

    try {
      await onSubmit({
        projectName: projectName.trim(),
        leaverName: leaverName.trim(),
        newcomerRole: newcomerRole.trim(),
        files: uploadedFiles,
        pastedText: pastedText.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create handover');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-base text-stone-900">Create New Handover</h2>
            <p className="text-xs text-stone-500">Initiate an evidence-backed transition case</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mx-5 mt-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Core API"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-400 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Outgoing Leaver *
              </label>
              <input
                type="text"
                value={leaverName}
                onChange={(e) => setLeaverName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-400 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Incoming Role *
              </label>
              <input
                type="text"
                value={newcomerRole}
                onChange={(e) => setNewcomerRole(e.target.value)}
                placeholder="e.g. Principal SRE"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-400 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Paste Project Notes / Slack / PR Transcript
            </label>
            <textarea
              rows={4}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw project handover text here..."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-400 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Or Attach Source Files (.txt, .md, .csv, .json)
            </label>
            <input
              type="file"
              multiple
              accept=".txt,.md,.csv,.json"
              onChange={handleFileUpload}
              className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
            />
            {uploadedFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {uploadedFiles.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700"
                  >
                    <FileText className="w-3 h-3 text-stone-400" />
                    {f.filename}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading ? 'Creating Case...' : 'Create & Ingest Sources'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
