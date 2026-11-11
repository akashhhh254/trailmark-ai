import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { TrailmarkDatabase } from './server/db';
import { chunkSource } from './server/chunker';
import { calculateMetrics, verifyExtractedItem } from './server/verifier';
import { scanForSecurityIssues } from './server/security';
import { LLMAdapter } from './server/llm';
import { SAMPLE_CASE, SAMPLE_FILES, SAMPLE_CACHED_EXTRACTIONS } from './server/sample_data';
import { ChunkRecord, ItemRecord, SourceRecord } from './server/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_FILE_BYTES = parseInt(process.env.MAX_FILE_BYTES || '5242880', 10); // 5MB
const MAX_INPUT_CHARS = parseInt(process.env.MAX_INPUT_CHARS || '500000', 10); // 500k chars

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const db = new TrailmarkDatabase();
const llm = new LLMAdapter();

// Initialize Database
let dbReady = false;
db.initialize()
  .then(() => {
    dbReady = true;
    console.log('Trailmark SQLite Database initialized successfully.');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });

// Health check endpoint
app.get('/healthz', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'trailmark', dbReady });
});

// Middleware to check DB ready
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!dbReady && req.path.startsWith('/api')) {
    return res.status(503).json({
      error: 'Database is still initializing',
      next_step: 'Please wait a moment and refresh.',
    });
  }
  next();
});

// --- Sample Project Generator ---
app.post('/api/sample/load', (req: Request, res: Response) => {
  try {
    const replayCached = req.body.replayCached !== false;
    const caseId = `case_sample_${Date.now()}`;
    const shareToken = `share_sample_${Math.random().toString(36).substring(2, 10)}`;

    const newCase = db.createCase({
      id: caseId,
      name: SAMPLE_CASE.name,
      leaver_name: SAMPLE_CASE.leaver_name,
      newcomer_role: SAMPLE_CASE.newcomer_role,
      share_token: shareToken,
      created_at: new Date().toISOString(),
    });

    const chunksToInsert: ChunkRecord[] = [];
    const securityFindings = [];

    // Ingest sample files
    for (let i = 0; i < SAMPLE_FILES.length; i++) {
      const file = SAMPLE_FILES[i];
      const sourceId = `src_sample_${i + 1}_${Date.now()}`;
      const sourceRecord: SourceRecord = {
        id: sourceId,
        case_id: caseId,
        ordinal: i + 1,
        filename: file.filename,
        kind: file.kind,
        content: file.content,
        char_count: file.content.length,
      };
      db.addSource(sourceRecord);

      const fileChunks = chunkSource(sourceId, i + 1, file.filename, file.kind, file.content);
      for (const fc of fileChunks) {
        const chunkRec: ChunkRecord = {
          id: fc.id,
          case_id: caseId,
          source_id: sourceId,
          label: fc.label,
          start_line: fc.startLine,
          end_line: fc.endLine,
          text: fc.text,
          source_filename: file.filename,
        };
        chunksToInsert.push(chunkRec);

        // Security scan
        const findings = scanForSecurityIssues(fc.text, fc.id, file.filename);
        securityFindings.push(...findings);
      }
    }

    db.addChunks(chunksToInsert);

    // If replayCached is true, populate pre-cached items immediately
    if (replayCached) {
      const chunksMap = new Map<string, ChunkRecord>();
      for (const c of chunksToInsert) {
        chunksMap.set(c.id, c);
      }
      const allText = SAMPLE_FILES.map((f) => f.content).join('\n\n');

      for (let i = 0; i < SAMPLE_CACHED_EXTRACTIONS.length; i++) {
        const raw = SAMPLE_CACHED_EXTRACTIONS[i];
        const targetChunk = chunksToInsert.find((c) => c.text.includes(raw.quote)) || chunksToInsert[0];
        const vResult = verifyExtractedItem(
          { ...raw, chunk_id: targetChunk.id },
          chunksMap,
          allText
        );

        const itemRec: ItemRecord = {
          id: `itm_${caseId}_${i + 1}`,
          case_id: caseId,
          type: raw.type,
          statement: raw.statement,
          owner: vResult.adjustedOwner ?? raw.owner,
          quote: raw.quote,
          chunk_id: targetChunk.id,
          llm_confidence: raw.llm_confidence ?? 0.95,
          verification: vResult.status,
          verification_note: vResult.note,
          review_status: 'draft',
          confidential: 0,
          reviewer_note: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          match_start: vResult.matchStart,
          match_end: vResult.matchEnd,
        };
        db.addItem(itemRec);
      }
      db.updateCaseStatus(caseId, 'ready');
    }

    res.json({
      case: newCase,
      mode: replayCached ? 'cached_replay' : 'empty_sample',
      findingsCount: securityFindings.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      error: 'Failed to initialize sample project',
      details: message,
      next_step: 'Please try again or use manual file paste.',
    });
  }
});

// --- Case CRUD ---
app.post('/api/cases', (req: Request, res: Response) => {
  const { name, leaver_name, newcomer_role } = req.body;
  if (!name || !leaver_name || !newcomer_role) {
    return res.status(400).json({
      error: 'Missing required case fields',
      details: 'Project name, leaver name, and newcomer role are all required.',
      next_step: 'Fill in all three fields to create a case.',
    });
  }

  const id = `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const shareToken = Math.random().toString(36).substring(2, 12);

  const newCase = db.createCase({
    id,
    name: name.trim(),
    leaver_name: leaver_name.trim(),
    newcomer_role: newcomer_role.trim(),
    share_token: shareToken,
    created_at: new Date().toISOString(),
  });

  res.status(201).json(newCase);
});

app.get('/api/cases', (_req: Request, res: Response) => {
  const cases = db.listRecentCases();
  res.json(cases);
});

app.get('/api/cases/:id', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const c = db.getCase(caseId);
  if (!c) {
    return res.status(404).json({
      error: 'Case not found',
      details: `No project handover case exists with ID "${caseId}".`,
      next_step: 'Check the URL or create a new handover case from the home screen.',
    });
  }

  const sources = db.getSources(caseId);
  const chunks = db.getChunks(caseId);
  const items = db.getItems(caseId);
  const metrics = calculateMetrics(items);

  // Security scan summary
  const securityFindings = [];
  for (const chunk of chunks) {
    const findings = scanForSecurityIssues(chunk.text, chunk.id, chunk.source_filename);
    securityFindings.push(...findings);
  }

  res.json({
    case: c,
    sources,
    chunks_count: chunks.length,
    items,
    metrics,
    security_findings: securityFindings,
    llm_available: llm.isAvailable(),
  });
});

// --- Add Sources ---
app.post('/api/cases/:id/sources', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const currentCase = db.getCase(caseId);
  if (!currentCase) {
    return res.status(404).json({
      error: 'Case not found',
      details: `Cannot add sources to missing case ${caseId}.`,
      next_step: 'Return to homepage and create a new case.',
    });
  }

  const existingSources = db.getSources(caseId);
  const files: Array<{ filename: string; kind: 'txt' | 'md' | 'csv' | 'json' | 'pasted'; content: string }> =
    req.body.files || [];

  if (!files || files.length === 0) {
    return res.status(400).json({
      error: 'No files or text provided',
      details: 'Please attach at least one file or paste text content.',
      next_step: 'Upload a .txt, .md, .csv, or .json file, or paste your notes into the text box.',
    });
  }

  // Limit check: 10 files max per case
  if (existingSources.length + files.length > 10) {
    return res.status(400).json({
      error: 'File limit exceeded',
      details: `Uploads are limited to 10 files per case. You already have ${existingSources.length} source(s) and attempted to add ${files.length}.`,
      next_step: 'Remove some files or combine text before uploading.',
    });
  }

  let totalChars = 0;
  for (const f of files) {
    if (f.content.length > MAX_FILE_BYTES) {
      return res.status(413).json({
        error: 'File size limit exceeded',
        details: `File "${f.filename}" exceeds the maximum allowed size of 5MB (${f.content.length} bytes).`,
        next_step: 'Split the file into smaller sections or remove unnecessary binaries.',
      });
    }
    totalChars += f.content.length;
  }

  if (totalChars > MAX_INPUT_CHARS) {
    return res.status(413).json({
      error: 'Total input character limit exceeded',
      details: `Total input contains ${totalChars} characters, which exceeds the limit of ${MAX_INPUT_CHARS} characters.`,
      next_step: 'Reduce the volume of uploaded text.',
    });
  }

  const chunksToInsert: ChunkRecord[] = [];
  const addedSources: SourceRecord[] = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const ordinal = existingSources.length + i + 1;
    const sourceId = `src_${caseId}_${ordinal}`;

    const sourceRecord: SourceRecord = {
      id: sourceId,
      case_id: caseId,
      ordinal,
      filename: f.filename || `source_${ordinal}.${f.kind}`,
      kind: f.kind,
      content: f.content,
      char_count: f.content.length,
    };

    db.addSource(sourceRecord);
    addedSources.push(sourceRecord);

    const generatedChunks = chunkSource(sourceId, ordinal, sourceRecord.filename, f.kind, f.content);
    for (const gc of generatedChunks) {
      chunksToInsert.push({
        id: gc.id,
        case_id: caseId,
        source_id: sourceId,
        label: gc.label,
        start_line: gc.startLine,
        end_line: gc.endLine,
        text: gc.text,
      });
    }
  }

  db.addChunks(chunksToInsert);

  res.status(201).json({
    message: `Successfully added ${addedSources.length} source(s) and generated ${chunksToInsert.length} chunk(s).`,
    added_sources: addedSources,
    total_chunks: chunksToInsert.length,
  });
});

// --- Run AI Extraction & Evidence Verification ---
app.post('/api/cases/:id/extract', async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const forceLive = req.body.forceLive === true;
  const currentCase = db.getCase(caseId);

  if (!currentCase) {
    return res.status(404).json({
      error: 'Case not found',
      details: 'Cannot run extraction on a non-existent case.',
      next_step: 'Select or create a valid case first.',
    });
  }

  const sources = db.getSources(caseId);
  const chunks = db.getChunks(caseId);

  if (sources.length === 0 || chunks.length === 0) {
    return res.status(400).json({
      error: 'No source chunks available',
      details: 'This case has no uploaded files or notes to extract knowledge from.',
      next_step: 'Upload at least one source file or paste project notes before running extraction.',
    });
  }

  const isSampleCase = caseId.startsWith('case_sample_');

  try {
    db.updateCaseStatus(caseId, 'processing');

    const chunksMap = new Map<string, ChunkRecord>();
    for (const c of chunks) {
      chunksMap.set(c.id, c);
    }
    const allSourcesText = sources.map((s) => s.content).join('\n\n');

    let rawExtractedItems;
    let runMode: 'live' | 'cached_replay' = 'live';

    if (isSampleCase && !forceLive) {
      // Replay pre-cached extraction results for sample project
      rawExtractedItems = SAMPLE_CACHED_EXTRACTIONS;
      runMode = 'cached_replay';
    } else {
      // Live extraction with Gemini
      if (!llm.isAvailable()) {
        db.updateCaseStatus(caseId, 'error', 'AI service is unavailable.');
        return res.status(503).json({
          error: 'The AI service is unavailable. Your files are saved; try again.',
          details: 'GEMINI_API_KEY is not configured or network request failed.',
          next_step: 'For the sample project, you can use cached replay. For custom files, ensure an API key is attached in Secrets.',
        });
      }

      rawExtractedItems = await llm.extractFromChunks(chunks, {
        name: currentCase.name,
        leaverName: currentCase.leaver_name,
        newcomerRole: currentCase.newcomer_role,
      });
      runMode = 'live';
    }

    // Clear any previous extracted items for this case
    db.clearItems(caseId);

    // Run programmatic quote verification
    const verifiedItems: ItemRecord[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < rawExtractedItems.length; i++) {
      const raw = rawExtractedItems[i];
      // If sample chunk id was synthetic, find the closest matching chunk
      let targetChunkId = raw.chunk_id;
      if (!chunksMap.has(targetChunkId)) {
        const found = chunks.find((c) => c.text.includes(raw.quote));
        if (found) targetChunkId = found.id;
      }

      const vResult = verifyExtractedItem(
        { ...raw, chunk_id: targetChunkId },
        chunksMap,
        allSourcesText
      );

      const itemRecord: ItemRecord = {
        id: `itm_${caseId}_${i + 1}_${Date.now()}`,
        case_id: caseId,
        type: raw.type,
        statement: raw.statement,
        owner: vResult.adjustedOwner ?? raw.owner,
        quote: raw.quote,
        chunk_id: targetChunkId,
        llm_confidence: raw.llm_confidence ?? 0.9,
        verification: vResult.status,
        verification_note: vResult.note,
        review_status: 'draft',
        confidential: 0,
        reviewer_note: null,
        created_at: now,
        updated_at: now,
        match_start: vResult.matchStart,
        match_end: vResult.matchEnd,
      };

      db.addItem(itemRecord);
      verifiedItems.push(itemRecord);
    }

    db.updateCaseStatus(caseId, 'ready');
    const metrics = calculateMetrics(verifiedItems);

    res.json({
      status: 'success',
      run_mode: runMode,
      items: verifiedItems,
      metrics,
      message:
        runMode === 'live'
          ? 'Live model run completed successfully.'
          : 'Sample results replayed from a saved model run.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    db.updateCaseStatus(caseId, 'error', message);
    res.status(500).json({
      error: 'The AI service is unavailable. Your files are saved; try again.',
      details: message,
      next_step: 'Your source files remain intact. Check your connection or retry in a few moments.',
    });
  }
});

// --- Review Item Actions ---
app.post('/api/cases/:id/items/:itemId/review', (req: Request, res: Response) => {
  const { id: caseId, itemId } = req.params;
  const { action, status, confidential, statement, owner, type, note, manual_verification_note } = req.body;

  const currentItem = db.getItem(itemId);
  if (!currentItem) {
    return res.status(404).json({
      error: 'Item not found',
      details: `No handover item with ID ${itemId} exists.`,
      next_step: 'Refresh the review dashboard.',
    });
  }

  // Business Rule: Unverified items cannot be approved without manual verification and a written note
  if (status === 'approved' && currentItem.verification === 'unverified') {
    if (!manual_verification_note || manual_verification_note.trim().length < 5) {
      return res.status(400).json({
        error: 'Manual verification note required',
        details: 'Unverified items cannot be approved without a manual verification note explaining why the claim is accepted.',
        next_step: 'Provide a written reviewer note of at least 5 characters to confirm manual verification.',
      });
    }
  }

  const updates: Partial<ItemRecord> = {};

  if (action === 'approve') {
    updates.review_status = 'approved';
    if (manual_verification_note) {
      updates.reviewer_note = manual_verification_note.trim();
    }
  } else if (action === 'reject') {
    updates.review_status = 'rejected';
    if (note) updates.reviewer_note = note.trim();
  } else if (action === 'confidential_toggle') {
    updates.confidential = currentItem.confidential === 1 ? 0 : 1;
  } else if (action === 'edit') {
    if (statement) updates.statement = statement.trim();
    if (owner !== undefined) updates.owner = owner ? owner.trim() : null;
    if (type) updates.type = type;
    // Rule: Editing an item must return it to draft status
    updates.review_status = 'draft';
  } else if (action === 'add_note') {
    if (note) updates.reviewer_note = note.trim();
  }

  const updatedItem = db.updateItemReview(itemId, action, updates);
  const items = db.getItems(caseId);
  const metrics = calculateMetrics(items);

  res.json({
    item: updatedItem,
    metrics,
  });
});

// --- Approve All Verified ---
app.post('/api/cases/:id/approve-all-verified', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const currentCase = db.getCase(caseId);
  if (!currentCase) {
    return res.status(404).json({
      error: 'Case not found',
      details: 'Cannot approve items for non-existent case.',
      next_step: 'Return to dashboard.',
    });
  }

  const approvedCount = db.approveAllVerified(caseId);
  const items = db.getItems(caseId);
  const metrics = calculateMetrics(items);

  res.json({
    message: `Approved ${approvedCount} verified item(s).`,
    approved_count: approvedCount,
    items,
    metrics,
  });
});

// --- Evidence Drawer Endpoint ---
app.get('/api/cases/:id/evidence/:chunkId', (req: Request, res: Response) => {
  const { chunkId } = req.params;
  const chunk = db.getChunkById(chunkId);
  if (!chunk) {
    return res.status(404).json({
      error: 'Chunk evidence not found',
      details: `No chunk found with ID "${chunkId}".`,
      next_step: 'Verify the chunk reference from the item card.',
    });
  }

  res.json({
    chunk_id: chunk.id,
    label: chunk.label,
    source_filename: chunk.source_filename,
    source_kind: chunk.source_kind,
    start_line: chunk.start_line,
    end_line: chunk.end_line,
    text: chunk.text,
  });
});

// --- Version History Endpoint ---
app.get('/api/cases/:id/items/:itemId/versions', (req: Request, res: Response) => {
  const { itemId } = req.params;
  const versions = db.getVersions(itemId);
  res.json(versions);
});

// --- Public Read-Only Handover & Markdown Export ---
function generateHandoverData(c: NonNullable<ReturnType<typeof db.getCase>>, items: ItemRecord[], sources: SourceRecord[]) {
  // STRICT RULE: Only approved and non-confidential items can appear on the public handover page
  const approvedItems = items.filter(
    (item) => item.review_status === 'approved' && item.confidential === 0
  );

  const risks = approvedItems.filter((i) => i.type === 'risk');
  const nextActions = approvedItems.filter((i) => i.type === 'next_action');
  const decisions = approvedItems.filter((i) => i.type === 'decision');
  const ownerships = approvedItems.filter((i) => i.type === 'ownership');
  const openQuestions = approvedItems.filter((i) => i.type === 'open_question');
  const dependencies = approvedItems.filter((i) => i.type === 'dependency');

  // Start here: Risks first, then Next Actions
  const startHere = [...risks, ...nextActions];

  return {
    case: c,
    total_sources: sources.length,
    total_extracted: items.length,
    total_approved: approvedItems.length,
    sections: {
      start_here: startHere,
      decisions,
      ownership: ownerships,
      open_questions: openQuestions,
      risks,
      dependencies,
    },
  };
}

// Reviewer preview endpoint
app.get('/cases/:id/handover', (req: Request, res: Response) => {
  const c = db.getCase(req.params.id);
  if (!c) {
    return res.status(404).send('<h1>404: Case Not Found</h1><p>Check the project ID.</p>');
  }
  const sources = db.getSources(c.id);
  const items = db.getItems(c.id);
  const data = generateHandoverData(c, items, sources);
  res.json(data);
});

// Public Share JSON endpoint
app.get('/api/h/:token', (req: Request, res: Response) => {
  const c = db.getCaseByShareToken(req.params.token);
  if (!c) {
    return res.status(404).json({
      error: 'Handover not found',
      details: 'This handover link is invalid, expired, or has been removed.',
      next_step: 'Check that the URL matches the copy link or request a new share link from the project reviewer.',
    });
  }
  const sources = db.getSources(c.id);
  const items = db.getItems(c.id);
  const data = generateHandoverData(c, items, sources);
  res.json(data);
});

// Markdown export endpoint (/h/:token.md)
app.get('/h/:token.md', (req: Request, res: Response) => {
  const token = req.params.token.replace(/\.md$/, '');
  const c = db.getCaseByShareToken(token);
  if (!c) {
    return res.status(404).send('# 404: Handover Not Found\n\nThis share link is invalid or expired.');
  }

  const sources = db.getSources(c.id);
  const items = db.getItems(c.id);
  const data = generateHandoverData(c, items, sources);

  let md = `# Handover: ${c.name}\n\n`;
  md += `**Outgoing Lead:** ${c.leaver_name}\n`;
  md += `**Incoming Role:** ${c.newcomer_role}\n`;
  md += `**Generated Date:** ${new Date().toISOString().split('T')[0]}\n\n`;
  md += `> Notice: Demo uses synthetic data. Do not upload confidential files.\n\n`;

  // 1. Start here
  md += `## 1. Start Here\n\n`;
  if (data.sections.start_here.length === 0) {
    md += `*Nothing approved for this section yet*\n\n`;
  } else {
    for (const item of data.sections.start_here) {
      const badge = item.type === 'risk' ? '[CRITICAL RISK]' : '[NEXT ACTION]';
      md += `- ${badge} **${item.statement}**\n`;
      if (item.owner) md += `  - Owner: ${item.owner}\n`;
      md += `  - Evidence Quote: "${item.quote}" (${item.chunk_label || item.chunk_id})\n\n`;
    }
  }

  // 2. Decisions
  md += `## 2. Key Decisions\n\n`;
  if (data.sections.decisions.length === 0) {
    md += `*Nothing approved for this section yet*\n\n`;
  } else {
    for (const item of data.sections.decisions) {
      md += `- **${item.statement}**\n`;
      if (item.owner) md += `  - Owner: ${item.owner}\n`;
      md += `  - Evidence: "${item.quote}" (${item.chunk_label || item.chunk_id})\n\n`;
    }
  }

  // 3. Ownership Map
  md += `## 3. Ownership Map\n\n`;
  if (data.sections.ownership.length === 0) {
    md += `*Nothing approved for this section yet*\n\n`;
  } else {
    for (const item of data.sections.ownership) {
      md += `- **${item.statement}**\n`;
      md += `  - Responsible: **${item.owner || 'Unassigned / Not found in sources'}**\n`;
      md += `  - Evidence: "${item.quote}" (${item.chunk_label || item.chunk_id})\n\n`;
    }
  }

  // 4. Open Questions
  md += `## 4. Open Questions\n\n`;
  if (data.sections.open_questions.length === 0) {
    md += `*Nothing approved for this section yet*\n\n`;
  } else {
    for (const item of data.sections.open_questions) {
      md += `- **${item.statement}**\n`;
      if (item.owner) md += `  - Assignee: ${item.owner}\n`;
      md += `  - Evidence: "${item.quote}" (${item.chunk_label || item.chunk_id})\n\n`;
    }
  }

  // 5. Risks
  md += `## 5. Risks & Bottlenecks\n\n`;
  if (data.sections.risks.length === 0) {
    md += `*Nothing approved for this section yet*\n\n`;
  } else {
    for (const item of data.sections.risks) {
      md += `- **${item.statement}**\n`;
      if (item.owner) md += `  - Owner: ${item.owner}\n`;
      md += `  - Evidence: "${item.quote}" (${item.chunk_label || item.chunk_id})\n\n`;
    }
  }

  // 6. Dependencies
  md += `## 6. External Dependencies\n\n`;
  if (data.sections.dependencies.length === 0) {
    md += `*Nothing approved for this section yet*\n\n`;
  } else {
    for (const item of data.sections.dependencies) {
      md += `- **${item.statement}**\n`;
      if (item.owner) md += `  - Owner: ${item.owner}\n`;
      md += `  - Evidence: "${item.quote}" (${item.chunk_label || item.chunk_id})\n\n`;
    }
  }

  md += `---\n\n`;
  md += `### Handover Verification Footer\n`;
  md += `- Sources ingested: ${data.total_sources}\n`;
  md += `- Approved items: ${data.total_approved}\n`;
  md += `- Total AI-extracted items: ${data.total_extracted}\n`;
  md += `- Notice: Unapproved and confidential items are strictly excluded from this handover.\n`;
  md += `- Retention: All session data subject to 24-hour cleanup policy.\n`;

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${c.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_handover.md"`);
  res.send(md);
});

// Vite dev middleware integration
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Friendly 500 error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: 'An unexpected server error occurred',
      details: err.message,
      next_step: 'Please refresh the page or try the synthetic sample project.',
    });
  });

  app.listen(PORT, () => {
    console.log(`Trailmark server running on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start Vite/Express server:', err);
});
