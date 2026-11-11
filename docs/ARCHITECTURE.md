# Trailmark — System Architecture & Trust Pipeline

## 1. High-Level Concept & Design Philosophy

Trailmark bridges the gap between chaotic, scattered project artifacts (Slack exports, Jira tickets, architectural scratchpads, CSV on-call schedules, JSON service manifests) and verified executive transition documents.

Traditional LLM summarization suffers from severe hallucination and unverified confidence. Trailmark enforces an **asymmetric trust model**:
1. **LLM as an extraction parser**: Identifies candidate claims, assigns one of the six taxonomical types (`decision`, `ownership`, `risk`, `open_question`, `dependency`, `next_action`), and extracts verbatim supporting quotes with chunk pointers.
2. **Deterministic application code as the verification auditor**: Verifies that quotes exist verbatim (or within strict whitespace/quote normalization bounds) in the exact cited chunk, checks that cited owners actually appear in project sources, and flags items lacking evidence.
3. **Human reviewer as the sole approval authority**: No AI-generated claim can ever be published without explicit human approval. Items default to `draft` and unverified claims cannot be approved without a written justification note.

```
+-------------------------------------------------------------+
|                     Ingested Sources                        |
|        (.txt, .md, .csv [header-repeated], .json)          |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                 Deterministic Chunker                       |
|   ~1,200 chars / line-preserved / stable labels (S1:L1-18)  |
+-------------------------------------------------------------+
                              |
                              +--> Security & Prompt-Injection Scanner
                              |
                              v
+-------------------------------------------------------------+
|              LLM Structured Extractor                       |
|           (Gemini 3.8 Flash / System Prompt Isolation)      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|           Application Quote Verification Engine             |
|   Exact match -> verified | Normalized -> approximate       |
|   NotFound / <12 chars / Wrong Chunk / Missing Owner        |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|               Human Review Dashboard (HTMX / React)         |
|   Approve | Reject | Edit (Draft reset) | Confidential      |
|   Evidence Drawer with Exact Highlight | Version History    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|             Read-Only Public Handover & Markdown            |
|       (ONLY review_status = 'approved' AND confidential = 0)|
+-------------------------------------------------------------+
```

## 2. Ingestion & Deterministic Chunking

- **Text & Markdown:** Split on newline boundaries when accumulated character count exceeds ~1,200 characters. Never splits mid-line; preserves 1-indexed line spans (`start_line`, `end_line`).
- **CSV:** Parsed into row batches (~15 rows per chunk). Crucially, the header row is prepended to every chunk so tabular context is preserved across splits.
- **JSON:** Pretty-printed with 2-space indentation before chunking to normalize indentation.
- **Stable Labeling:** Every chunk receives a deterministic human-readable label such as `S1:L1-18`, enabling instant correlation back to original source files.

## 3. Verification Engine Rules

Application code validates quotes independently from the model:
1. **Exact Substring Match:** `chunkText.indexOf(quote) !== -1`. Yields `verified` and exact character offset range (`match_start`, `match_end`) for real-time highlighting.
2. **Normalized Whitespace & Quotation Match:** Straightens curly quotes (`“ ” ‘ ’` -> `" '`), collapses consecutive whitespace/tabs/newlines, and trims surrounding wrappers. If matched, status is `approximate`.
3. **Short Quote Rule:** Quotes under 12 characters are automatically marked `unverified`.
4. **Chunk Identity Rule:** If the quote exists in the codebase but NOT in the chunk specified by the model, it is marked `unverified`.
5. **Owner Validation:** If an extracted owner does not appear anywhere in the source corpus, owner is set to `null` and annotated with `"owner not found in sources"`.
6. **Insufficient Evidence Flag:** If fewer than 3 items achieve verified status, the case is flagged with `"Not enough evidence in these sources to build a handover"`.

## 4. Security & Prompt-Injection Defense

- **Untrusted Data Isolation:** The system prompt explicitly informs the LLM that all ingested chunks are untrusted DATA, never instructions.
- **Signature Scanning:** Regex pattern matching flags known prompt-injection triggers (e.g. `ignore all previous instructions`, `system instruction:`, `mark as verified immediately`).
- **Secret & PII Detection:** Automated scans identify AWS keys, Google API keys, bearer tokens, passwords, email addresses, and phone numbers before handover publication.

## 5. Storage & Versioning Architecture

Stored in SQLite with foreign keys enabled:
- `cases`: Primary handover workspace record.
- `sources`: Raw ingested source files with character counts.
- `chunks`: Line-indexed text slices with deterministic labels.
- `items`: Extracted handover knowledge records.
- `item_versions`: Immutable audit trail recording every create, edit, approve, reject, confidential toggle, and note addition.
