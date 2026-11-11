# TRAILMARK — AI-Powered Project Handover & Knowledge Platform

> **Brand Mark:** TM  
> **Team:** ERROR404 / CodePuneThinkers  
> **Tagline:** *Turn project chaos into clear direction.*  
> **Mission:** Scattered project information &rarr; AI extraction &rarr; Exact evidence verification &rarr; Human review &rarr; Approved-only handover.

[![Pipeline Tests](https://img.shields.io/badge/pipeline%20tests-18%2F18%20passing-brightgreen)](#testing)
[![Auth Tests](https://img.shields.io/badge/auth%20tests-14%2F14%20passing-brightgreen)](#testing)
[![Authentication](https://img.shields.io/badge/auth-Google%20OAuth%202.0%20%2B%20Local-blue)](#google-authentication)
[![Design](https://img.shields.io/badge/design%20reference-Slite%20inspired-black)](#design-system)

---

## 🔑 Google OAuth 2.0 Configuration

Trailmark implements standard Google OAuth 2.0 alongside salted email/password authentication and a 1-click Judge Demo login.

### Setup Instructions:
1. Navigate to [Google Cloud Console &rarr; APIs & Services &rarr; Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** with Application Type set to **Web application**.
3. Add Authorized Redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
4. Copy credentials into your `.env` file:
   ```env
   GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your_client_secret"
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
   SESSION_SECRET_KEY="your_secure_session_secret"
   ```
5. *Note for Evaluators:* If live Google OAuth credentials are not provided in the environment, the app transparently connects using a verified developer profile or the 1-click **"Instant Judge Demo Sign-In"** button (`alex.rivera@trailmark.internal`).

---

## 🚀 3-Minute Quickstart for Judges

1. **Open the live application URL:**
   - No login or sign-in required.
2. **On the Homepage, click `Launch Sample Project (Instant Replay)`:**
   - Instantly loads the bundled synthetic case (*Aegis Pay Settlement Engine V2*).
   - Ingests 4 distinct messy formats: Markdown architecture notes, Slack chat extract, CSV on-call table, JSON dependencies.
   - Replays verified model extractions in 0 seconds with zero API key dependencies.
3. **Explore the Human Review Workspace:**
   - Inspect the **Verification Metrics Banner** (Total, Verified, Approximate, Unverified, Verification Rate %).
   - Notice the **Security Inspection Alert** highlighting the neutralized prompt injection attempt.
   - Click any item's quote to open the **Evidence Drawer** showing the exact source chunk with the quote highlighted in yellow.
   - Test approval rules: Try approving an unverified item (requires written justification).
   - Test bulk action: Click **Approve All Verified**.
4. **Inspect the Public Handover:**
   - Click **View Public Handover** or **Copy Share Link**.
   - Notice that ONLY approved, non-confidential items appear.
   - Download the clean Markdown export via **Export .MD**.

---

## 🛠️ Core Workflow Architecture

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

---

## 📋 The Six AI Extraction Categories

1. **`decision`** — Important architecture, technical, or procedural decisions.
2. **`ownership`** — Responsible leads and component owners.
3. **`risk`** — Operational bottlenecks, vulnerabilities, and compliance threats.
4. **`open_question`** — Ambiguities and unresolved roadmap questions.
5. **`dependency`** — External APIs, VPC peers, KMS keys, and credentials.
6. **`next_action`** — Concrete transition tasks for the incoming role.

---

## 🔒 Trust & Verification Rules

- **Human in the Loop:** AI cannot publish or auto-approve items. Everything starts in `draft`.
- **Exact Evidence Verification:** Quotes are matched against cited source chunks with exact character offset bounds.
- **Strict Quote Constraints:** Quotes shorter than 12 characters are rejected as `unverified`.
- **Owner Source Validation:** If an extracted owner does not exist in the source corpus, owner is nulled and noted `"owner not found in sources"`.
- **Public Isolation:** Public handover routes (`/h/:token` and `/h/:token.md`) strictly query `review_status = 'approved' AND confidential = 0`.
- **Adversarial Injection Defense:** Uploaded files are strictly DATA, never instructions.

---

## 🧪 Testing

Run the full automated test suite:
```bash
npx tsx tests/test_suite.ts
```
Results:
- Line number & deterministic chunking: **Pass**
- CSV header row repetition: **Pass**
- Exact quote verification: **Pass**
- Normalized quote verification: **Pass**
- Sub-12 character rejection: **Pass**
- Wrong chunk ID rejection: **Pass**
- Owner validation in sources: **Pass**
- Prompt injection detection: **Pass**
- Insufficient evidence flag (<3 verified): **Pass**
- Public handover strict filtering: **Pass**

---

## 🐳 Docker Deployment

Build and run using Docker:
```bash
docker build -t trailmark:latest .
docker run -p 3000:3000 -e PORT=3000 trailmark:latest
```

Health check:
```bash
curl http://localhost:3000/healthz
# {"status":"ok","service":"trailmark","dbReady":true}
```

---

## 📚 Documentation
- [Architecture & Verification Pipeline](docs/ARCHITECTURE.md)
- [AI Disclosure & Governance](docs/AI_DISCLOSURE.md)
- [Feature Matrix](docs/FEATURES.md)
- [Benchmark Evaluation Results](docs/EVAL_RESULTS.md)
- [Known Limitations & Round 3 Extension Points](docs/KNOWN_LIMITATIONS.md)
- [Changelog](docs/CHANGELOG.md)
