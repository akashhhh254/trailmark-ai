import React from 'react';
import { ShieldCheck, Cpu, Database, Clock, RefreshCw, Key } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* 1. Header */}
      <div className="space-y-1 pb-6 border-b border-stone-200">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Settings & System Policy</h1>
        <p className="text-xs text-stone-500">
          Architecture, model engine governance, and session security configuration.
        </p>
      </div>

      {/* 2. System Architecture Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-stone-900">System Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-stone-600" />
              <span className="font-semibold text-xs text-stone-900">LLM Extraction Engine</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Google Gemini 3.8 Flash (`gemini-3.8-flash`) executed exclusively on the server side using the modern `@google/genai` TypeScript SDK.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-stone-600" />
              <span className="font-semibold text-xs text-stone-900">Storage & Audit Log</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              SQLite relational database with foreign key constraints and immutable `item_versions` audit snapshots.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Data Governance & 24h Policy */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
          <Clock className="w-4 h-4 text-stone-600" />
          <span>24-Hour Ephemeral Retention Policy</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Trailmark is configured with strict data hygiene for confidential organizational handover. All uploaded text chunks, extracted records, and generated tokens are subject to automated 24-hour cleanup. Do not upload classified credentials or private personal data to the public demo.
        </p>
      </div>

      {/* 4. Hackathon Round 2 Alignment */}
      <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200/80 text-xs text-stone-600 space-y-1">
        <p className="font-semibold text-stone-900">CodePuneThinkers — Round 2 Compliance</p>
        <p>
          Built by Team ERROR404 following the Slite visual design standard and the six core handover categories (`decision`, `ownership`, `risk`, `open_question`, `dependency`, `next_action`).
        </p>
      </div>
    </div>
  );
};
