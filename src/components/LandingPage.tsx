import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  FileText,
  UserCheck,
  AlertTriangle,
  HelpCircle,
  Network,
  ListTodo,
  Download,
  Lock,
  Layers,
  Check,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreDemo,
  onLoginClick,
  onRegisterClick,
}) => {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-sans selection:bg-stone-200">
      {/* 1. Public Header / Navigation */}
      <header className="h-16 border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <BrandLogo size="md" />

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
            <a href="#about" className="hover:text-stone-900 transition">
              About
            </a>
            <a href="#features" className="hover:text-stone-900 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-stone-900 transition">
              How It Works
            </a>
            <a href="#team" className="hover:text-stone-900 transition">
              Team
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onLoginClick}
              className="py-1.5 px-3 text-xs font-medium text-stone-700 hover:text-stone-950 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="py-1.5 px-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Evidence-Linked AI Handover Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-tight">
          Every Project Deserves <br className="hidden sm:inline" />
          <span className="text-stone-900">a Clear Handover.</span>
        </h1>

        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Turn scattered project updates and documents into structured knowledge, verified decisions, clear ownership, and actionable next steps.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onGetStarted}
            className="py-2.5 px-5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDemo}
            className="py-2.5 px-5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Explore Live Demo (3-Min Walkthrough)</span>
          </button>
        </div>

        {/* Product Dashboard Preview Showcase */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xl overflow-hidden text-left">
            <div className="bg-stone-100/70 border-b border-stone-200 px-4 py-2.5 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <span className="ml-2 font-mono text-[11px] text-stone-400">
                  trailmark.internal/review/aegis-pay-settlement
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Evidence Verified</span>
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                    Handover Case
                  </span>
                  <h3 className="text-base font-semibold text-stone-900">
                    Aegis Pay — Settlement Engine V2 Migration
                  </h3>
                  <p className="text-xs text-stone-500">
                    Lead Leaver: <strong>Alex Rivera</strong> &bull; Incoming Role: <strong>Jordan Chen (Principal SRE)</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200">
                    86% Grounded Rate
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Ready to Publish
                  </span>
                </div>
              </div>

              {/* Sample Extracted Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                      Decision
                    </span>
                    <span className="text-emerald-700 font-medium">Exact Quote Verified</span>
                  </div>
                  <p className="font-medium text-stone-900 leading-snug">
                    Migrated settlement ledgers from Cassandra to PostgreSQL 16 with TimescaleDB.
                  </p>
                  <p className="text-[11px] text-stone-500 italic">
                    "We migrated from Cassandra to PostgreSQL 16 with TimescaleDB... (S1:L1-18)"
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-rose-700 uppercase tracking-wider text-[10px]">
                      Operational Risk
                    </span>
                    <span className="text-emerald-700 font-medium">Exact Quote Verified</span>
                  </div>
                  <p className="font-medium text-stone-900 leading-snug">
                    Under stress tests &gt; 14k TPS, connection pool experiences starvation capped at 850.
                  </p>
                  <p className="text-[11px] text-stone-500 italic">
                    "PostgreSQL connection pool experiences thread starvation... (S1:L18-30)"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Trailmark Section */}
      <section id="about" className="py-20 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              About Trailmark
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              What is Trailmark?
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Trailmark helps engineering and product teams convert unstructured project chaos—Slack archives, architecture notes, sprint tickets, and configs—into organized and trustworthy handovers.
            </p>
          </div>

          {/* 5-Step Visual Workflow */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-semibold text-xs text-stone-900">Upload Data</h4>
              <p className="text-[11px] text-stone-500 leading-snug">
                Attach .txt, .md, .csv, or .json documents.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-semibold text-xs text-stone-900">AI Extraction</h4>
              <p className="text-[11px] text-stone-500 leading-snug">
                Extracts decisions, ownership, risks, and next actions.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-semibold text-xs text-stone-900">Evidence Audit</h4>
              <p className="text-[11px] text-stone-500 leading-snug">
                Deterministic code verifies verbatim quotes in cited chunks.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="font-semibold text-xs text-stone-900">Human Approval</h4>
              <p className="text-[11px] text-stone-500 leading-snug">
                Reviewer approves or edits claims; nothing is auto-published.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center mx-auto">
                5
              </div>
              <h4 className="font-semibold text-xs text-stone-900">Final Handover</h4>
              <p className="text-[11px] text-stone-500 leading-snug">
                Generate clean read-only public handover & Markdown export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Built for High-Stakes Project Transitions
          </h2>
          <p className="text-sm text-stone-600">
            Every feature is engineered around evidence verification, transparency, and human oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-sm text-stone-900">AI-Powered Extraction</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Extracts high-signal project items across 6 structured categories without hallucinating missing claims.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-sm text-stone-900">Decision Tracking</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Maintains an immutable record of technical and procedural choices made across the project history.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-sm text-stone-900">Ownership Mapping</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Validates that every component, on-call rotation, and service lead is mapped to an identified owner.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-sm text-stone-900">Risk Identification</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Highlights performance limits, thread starvation, and compliance gaps so newcomers aren't caught off guard.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-sm text-stone-900">Open Questions</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Surfaces unresolved questions that require early clarification with leadership before transition.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <Network className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-sm text-stone-900">Dependency Tracking</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Documents external payment APIs, VPC peering, and KMS keys needed for service survival.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-sm text-stone-900">Exact Evidence Verification</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Application code checks verbatim quotes against source chunks, calculating exact match offsets.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <UserCheck className="w-5 h-5 text-stone-800" />
            <h3 className="font-semibold text-sm text-stone-900">Human-in-the-Loop Review</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              AI-generated claims start in draft. A human must approve, reject, or mark confidential before publishing.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <Download className="w-5 h-5 text-stone-800" />
            <h3 className="font-semibold text-sm text-stone-900">Markdown Export</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Instantly export clean, version-controlled Markdown files suitable for GitHub wikis and internal knowledge bases.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Architecture & Trust
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              The Asymmetric Trust Model
            </h2>
            <p className="text-sm text-stone-600 max-w-xl mx-auto">
              Trailmark never trusts raw LLM outputs. Here is how our 4-tier pipeline verifies every fact before it reaches the final document.
            </p>
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-200/90 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                A
              </div>
              <div>
                <h4 className="font-semibold text-sm text-stone-900">Deterministic Source Chunking</h4>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Raw documents are ingested, scanned for adversarial prompt injections, and split on exact line boundaries into labeled chunks (e.g. <code>S1:L1-18</code>) with CSV headers repeated.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                B
              </div>
              <div>
                <h4 className="font-semibold text-sm text-stone-900">Isolated AI Extraction</h4>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Gemini 3.8 Flash extracts structured claims matching the 6 categories, citing the verbatim quotation and specific chunk ID. Source text is treated strictly as DATA, never instructions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                C
              </div>
              <div>
                <h4 className="font-semibold text-sm text-stone-900">Programmatic Verification Engine</h4>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Deterministic code searches the chunk text for exact substring matches. Quotes &lt; 12 characters, wrong chunk IDs, and unverified owners are flagged automatically.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                D
              </div>
              <div>
                <h4 className="font-semibold text-sm text-stone-900">Approved-Only Handover Publishing</h4>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Only statements where <code>review_status = 'approved' AND confidential = 0</code> are exported or shown in the public link. Draft and confidential items are strictly excluded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Team Section */}
      <section id="team" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Development Team
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Team ERROR404
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Participating in <strong>CodePuneThinkers — Round 2</strong>. Building software grounded in verifiable evidence, algorithmic rigor, and high-craft SaaS design.
        </p>

        <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-2xs max-w-md mx-auto text-xs text-stone-600 space-y-2">
          <p className="font-semibold text-stone-900">Hackathon Submission Details</p>
          <p>Track: AI-Powered Knowledge Management & Organizational Handover</p>
          <div className="pt-2 text-[11px] text-stone-400 font-mono">
            Round 2 &bull; Version 2.1.0 &bull; 18/18 Automated Tests Passing
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-20 bg-stone-900 text-white text-center px-4 sm:px-6 space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to make your project handovers smarter?
          </h2>
          <p className="text-xs sm:text-sm text-stone-300">
            Join engineering teams ensuring zero context is lost when colleagues transition.
          </p>
        </div>

        <div>
          <button
            onClick={onGetStarted}
            className="py-3 px-6 bg-white hover:bg-stone-100 text-stone-900 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-md inline-flex items-center gap-2"
          >
            <span>Start with Trailmark</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 8. Public Footer (Section 11) */}
      <footer className="py-10 bg-white border-t border-stone-200 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span>&bull;</span>
            <span>Made with care by ERROR404 / CodePuneThinkers</span>
          </div>

          <div className="flex items-center gap-4 text-stone-600">
            <a href="#about" className="hover:text-stone-900 transition">
              About Trailmark
            </a>
            <a href="#how-it-works" className="hover:text-stone-900 transition">
              Documentation
            </a>
            <span className="font-mono text-[11px] text-stone-400">v2.1.0</span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4 pt-4 border-t border-stone-100 text-[11px] text-stone-400 flex flex-wrap items-center justify-between gap-2">
          <span>&copy; 2026 Trailmark. All rights reserved.</span>
          <span>Notice: Demo uses synthetic data. 24-hour retention cleanup policy.</span>
        </div>
      </footer>
    </div>
  );
};
