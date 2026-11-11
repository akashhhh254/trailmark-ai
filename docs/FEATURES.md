# Trailmark — Feature Matrix & Capabilities

## Core Features (Round 2 Specification)

### 1. Ingestion & File Processing
- [x] Multi-format support: `.txt`, `.md`, `.csv`, `.json`, and pasted text.
- [x] Deterministic chunking: ~1,200 characters per chunk without LLM tokenization dependency.
- [x] Line number preservation: 1-indexed line spans (`start_line`, `end_line`).
- [x] CSV Header repetition: Every chunk includes the header row to preserve column semantics across splits.
- [x] JSON pretty-printing: Pre-formats compact JSON before splitting.
- [x] Stable chunk labeling: Deterministic identifiers like `S1:L1-18`.
- [x] File limits: Maximum 10 files per case, 5MB per file, 500,000 characters total.

### 2. Six AI Extraction Categories
- [x] `decision` — Architectural and technical commitments.
- [x] `ownership` — Component leads and task assignees.
- [x] `risk` — Bottlenecks, failure points, and compliance risks.
- [x] `open_question` — Unresolved decisions and stakeholder questions.
- [x] `dependency` — External services, KMS keys, and infrastructure blockers.
- [x] `next_action` — High-priority transition tasks.

### 3. Quote Verification Engine
- [x] Exact matching quote detection (`verified`).
- [x] Whitespace & smart quote normalization (`approximate`).
- [x] Sub-12 character quote rejection (`unverified`).
- [x] Invalid chunk ID rejection (`unverified`).
- [x] Missing owner validation (sets owner to `null` and notes `"owner not found in sources"`).
- [x] Real-time character offset bounds (`match_start`, `match_end`).
- [x] Metrics computation: Total, Verified, Approximate, Unverified, Verification Rate (%).
- [x] Insufficient evidence flag when verified items < 3.

### 4. Human Review Interface
- [x] Status management: Approve, Reject, Edit, Mark Confidential.
- [x] Policy enforcement: Unverified items cannot be approved without a written verification note.
- [x] Policy enforcement: Editing an item automatically returns it to `draft` status.
- [x] Bulk action: "Approve all verified" button approving only verified items.
- [x] Immutable version history: Full JSON snapshot created on every review action.
- [x] Interactive Evidence Drawer: Slide-over drawer with chunk passage and quote highlighted in bright yellow.

### 5. Handover Output
- [x] Reviewer preview at `/cases/:id/handover`.
- [x] Public read-only handover at `/h/:token`.
- [x] Markdown export at `/h/:token.md`.
- [x] Strict filter: ONLY items where `review_status = 'approved' AND confidential = 0`.
- [x] Section ordering: Start Here (Risks first, then Next Actions), Decisions, Ownership map, Open questions, Risks, Dependencies.
- [x] Empty section messaging: *"Nothing approved for this section yet"*.
- [x] Copy Share Link button with clipboard feedback.
- [x] Audit seal footer with source, approved item, and extraction counts.

### 6. Security & Governance
- [x] Prompt-injection detection and neutralisation.
- [x] Secret scanning (AWS keys, Google API keys, bearer tokens, passwords).
- [x] PII detection (emails, phone numbers).
- [x] 24-hour cleanup policy notice.
- [x] Friendly 404, 413, 429, 500 error pages with next-step guidance.
- [x] Synthetic sample project with instant cached replay (0-key evaluation).
