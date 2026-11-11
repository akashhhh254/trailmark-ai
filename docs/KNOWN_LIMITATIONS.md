# Trailmark — Known Limitations & Out-of-Scope Items

## Known Limitations

1. **OCR / Scanned PDF Support:**
   - Round 2 ingestion strictly targets text formats (`.txt`, `.md`, `.csv`, `.json`). Binary PDFs, scanned images, and Word `.docx` documents are rejected and must be converted to plain text or Markdown prior to ingestion.
2. **Context Window Ceiling for Massive Repositories:**
   - Single-case processing is capped at 500,000 characters (approx. 100k tokens) to ensure low latency and prevent context degradation.
3. **Regex-Based PII & Secret Detection:**
   - The security scanner uses deterministic regular expression patterns. While high-precision for standard API keys and email formats, highly obfuscated tokens may require human reviewer vigilance.
4. **Single-Region Ephemeral Storage:**
   - SQLite database is stored locally under `DATA_DIR` and subject to a 24-hour cleanup policy.

## Explicitly Out of Scope (Round 2 Rules)
As mandated by the Round 2 specification:
- User login / authentication accounts
- Billing & Stripe integration
- Native GitHub, Slack, or Google Drive OAuth sync
- Vector databases (RAG / Pinecone / Chroma)
- Autonomous agent loops
- Administrative superuser consoles

## Reserved for Round 3 (Clean Architecture Extension Points)
1. **Leaver Q&A Interactive Assistant:** Automatically detect missing gaps in extracted documentation and generate targeted clarification questionnaires for the departing engineer.
2. **Cross-Source Conflict Detection:** Semantic engine comparing conflicting dates or architecture claims across multiple independent source files (e.g., Nov 15 vs Dec 1 decommissioning date).
3. **Role-Based Redaction & Handover Receipt Sign-off:** Cryptographic or token-based recipient acknowledgment with field-level redaction rules.
