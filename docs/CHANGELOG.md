# Trailmark — Changelog

## [2.1.0] - 2026-11-11 (Slite Visual & UX Redesign)

### Added
- **Slite SaaS Shell:**
  - Minimalist collapsible left navigation sidebar (`Overview`, `Project Workspace`, `Review Queue`, `All Handovers`, `Sources & Chunks`, `Settings`).
  - Slite-inspired breadcrumb header with project selector and quick actions.
  - Dedicated Overview Dashboard with welcome narrative, quickstart paths, metrics grid, and project table.
  - Project Workspace hub detailing leaver/successor stakeholders, source file management, and extraction triggers.
  - Slite 2-column Review Workspace featuring clean unboxed card items on the left and a persistent sticky Source Evidence Inspector on the right with yellow quote highlighting.
  - Dedicated Sources & Chunks view with raw text explorer and security inspection findings.
  - Refined document-style Public Handover page matching Slite's paper reading experience with Markdown export.
  - Minimalist `NewHandoverModal` for creating cases and uploading files from anywhere in the app.
- **Core Engine & Architecture:**
  - Deterministic chunking engine preserving exact source line numbers (`start_line`, `end_line`) with stable IDs (`S1:L1-18`).
  - Specialized CSV chunking with header repetition across row batches.
  - Pretty-printed JSON chunking module.
- **Verification Engine:**
  - Exact quote verification with character offset tracking (`match_start`, `match_end`) for real-time highlighter drawer.
  - Normalized quote matcher resolving curly/straight quotation marks and multi-space variations (`approximate`).
  - Strict minimum quote length rule (12 characters minimum).
  - Cited chunk identity verification (rejects quotes cited from wrong chunks).
  - Owner presence validation (auto-nulls owners not verified in source corpus).
  - Insufficient evidence alert when verified items count < 3.
- **Human Review Dashboard:**
  - 6 category breakdown tabs (`decision`, `ownership`, `risk`, `open_question`, `dependency`, `next_action`).
  - Review actions: Approve, Reject, Edit, Confidential toggle.
  - Enforced policy: Unverified items require a manual verification note before approval.
  - Enforced policy: Editing an item automatically resets review status to `draft`.
  - "Approve all verified" bulk action.
  - Slide-over Evidence Drawer displaying source filename, line numbers, and yellow-highlighted quote passage.
  - Full audit trail modal displaying immutable `item_versions` JSON snapshots.
- **Public Handover & Exports:**
  - Read-only public handover page at `/h/:token` displaying ONLY approved and non-confidential items.
  - Markdown download at `/h/:token.md` with standardized section structure.
  - Section layout: Start Here (Risks first, then Next Actions), Decisions, Ownership map, Open questions, Risks, Dependencies.
  - Empty section placeholder: *"Nothing approved for this section yet"*.
- **Security & Safety:**
  - Ingested data isolation protecting against prompt-injection attacks.
  - Automated regex scanning for credentials, API keys, passwords, and PII.
  - Synthetic data warning and 24-hour cleanup policy notice.
- **Synthetic Sample Project:**
  - Pre-bundled *Aegis Pay Settlement Engine V2 Migration* case.
  - 0-key replay capability enabling instant 3-minute evaluation for hackathon judges.
