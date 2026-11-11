import React from 'react';
import { X, HelpCircle, ShieldCheck, Key, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <div>
              <h2 className="font-semibold text-base text-stone-900">Trailmark Help & Documentation</h2>
              <p className="text-xs text-stone-500">System architecture, Google OAuth, and evaluation guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-stone-600 leading-relaxed">
          {/* 1. Google OAuth Setup Guide */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-stone-900 text-sm">
              <Key className="w-4 h-4 text-stone-600" />
              <span>Google OAuth 2.0 Integration Setup</span>
            </div>
            <p>
              Trailmark implements standard Google OAuth 2.0 authentication. To configure production credentials:
            </p>
            <ol className="list-decimal list-inside space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-200 font-mono text-[11px] text-stone-700">
              <li>Open Google Cloud Console &rarr; APIs & Services &rarr; Credentials.</li>
              <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web application).</li>
              <li>Add Authorized Redirect URI: <code>http://localhost:3000/api/auth/google/callback</code>.</li>
              <li>Copy Client ID and Client Secret into your <code>.env</code> file:</li>
            </ol>
            <pre className="p-2.5 bg-stone-900 text-stone-200 font-mono text-[11px] rounded-lg">
{`GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
SESSION_SECRET_KEY="your_secure_session_secret"`}
            </pre>
            <p className="text-[11px] text-stone-500">
              *Note for Judges:* If live credentials are not set in the environment, clicking "Continue with Google" securely connects using the verified test profile, or you can use "Instant Judge Demo Sign-In".
            </p>
          </div>

          {/* 2. Core Trust Model */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-stone-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>The Asymmetric Trust Model</span>
            </div>
            <p>
              Trailmark strictly separates AI inference from verification authority:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-700">
              <li><strong>AI Extraction:</strong> Parses messy documents into 6 structured categories (`decision`, `ownership`, `risk`, `open_question`, `dependency`, `next_action`).</li>
              <li><strong>Exact Verification:</strong> Application code scans source chunks for exact verbatim quotes. Sub-12 char quotes, wrong chunks, and unverified owners are flagged.</li>
              <li><strong>Human In The Loop:</strong> Only approved and non-confidential statements appear on public handover pages (`/h/:token`) or Markdown exports.</li>
            </ul>
          </div>

          {/* 3. 3-Minute Quickstart */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <p className="font-semibold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>3-Minute Hackathon Demonstration Walkthrough</span>
            </p>
            <p>
              1. Click <strong>"Try Sample Project"</strong> on the Overview dashboard to load the <em>Aegis Pay Settlement Engine</em> case in 0 seconds.
            </p>
            <p>
              2. Open <strong>Review Queue</strong> to inspect quotes in the right-hand Evidence Inspector with highlighted passages.
            </p>
            <p>
              3. Click <strong>"Approve All Verified"</strong> and switch to <strong>"All Handovers"</strong> to view the published document and export Markdown.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
