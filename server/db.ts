import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import {
  CaseRecord,
  ChunkRecord,
  ItemRecord,
  ItemVersionRecord,
  SourceRecord,
  UserRecord,
} from './types';

export class TrailmarkDatabase {
  private db: Database | null = null;
  private dbFilePath: string;

  constructor(dataDir: string = process.env.DATA_DIR || './data') {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbFilePath = path.join(dataDir, 'trailmark.sqlite');
  }

  public async initialize(): Promise<void> {
    const SQL = await initSqlJs();

    if (fs.existsSync(this.dbFilePath)) {
      try {
        const fileBuffer = fs.readFileSync(this.dbFilePath);
        this.db = new SQL.Database(fileBuffer);
      } catch (e) {
        console.warn('Could not read existing database, initializing fresh one:', e);
        this.db = new SQL.Database();
      }
    } else {
      this.db = new SQL.Database();
    }

    this.db.run('PRAGMA foreign_keys = ON;');
    this.createTables();
    this.saveToFile();
  }

  private saveToFile(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbFilePath, buffer);
    } catch (err) {
      console.error('Error saving SQLite database to file:', err);
    }
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run(`
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        leaver_name TEXT NOT NULL,
        newcomer_role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        error_message TEXT,
        share_token TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        ordinal INTEGER NOT NULL,
        filename TEXT NOT NULL,
        kind TEXT NOT NULL,
        content TEXT NOT NULL,
        char_count INTEGER NOT NULL,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        source_id TEXT NOT NULL,
        label TEXT NOT NULL,
        start_line INTEGER NOT NULL,
        end_line INTEGER NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        type TEXT NOT NULL,
        statement TEXT NOT NULL,
        owner TEXT,
        quote TEXT NOT NULL,
        chunk_id TEXT NOT NULL,
        llm_confidence REAL NOT NULL DEFAULT 1.0,
        verification TEXT NOT NULL DEFAULT 'unverified',
        verification_note TEXT,
        review_status TEXT NOT NULL DEFAULT 'draft',
        confidential INTEGER NOT NULL DEFAULT 0,
        reviewer_note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        match_start INTEGER,
        match_end INTEGER,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS item_versions (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL,
        action TEXT NOT NULL,
        snapshot_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT,
        auth_provider TEXT NOT NULL DEFAULT 'local',
        avatar_url TEXT,
        created_at TEXT NOT NULL
      );
    `);
  }

  // --- User Operations ---
  public createUser(user: UserRecord): UserRecord {
    if (!this.db) throw new Error('DB uninitialized');
    this.db.run(
      `INSERT INTO users (id, email, name, password_hash, auth_provider, avatar_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.email.toLowerCase(),
        user.name,
        user.password_hash || null,
        user.auth_provider,
        user.avatar_url || null,
        user.created_at,
      ]
    );
    this.saveToFile();
    return user;
  }

  public getUserByEmail(email: string): UserRecord | null {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email.toLowerCase()]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as UserRecord;
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  public getUserById(id: string): UserRecord | null {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as UserRecord;
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  // --- Case Operations ---
  public createCase(c: Omit<CaseRecord, 'status' | 'error_message'>): CaseRecord {
    if (!this.db) throw new Error('DB uninitialized');
    this.db.run(
      `INSERT INTO cases (id, name, leaver_name, newcomer_role, status, error_message, share_token, created_at)
       VALUES (?, ?, ?, ?, 'draft', NULL, ?, ?)`,
      [c.id, c.name, c.leaver_name, c.newcomer_role, c.share_token, c.created_at]
    );
    this.saveToFile();
    return {
      ...c,
      status: 'draft',
      error_message: null,
    };
  }

  public getCase(id: string): CaseRecord | null {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare('SELECT * FROM cases WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as CaseRecord;
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  public getCaseByShareToken(token: string): CaseRecord | null {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare('SELECT * FROM cases WHERE share_token = ?');
    stmt.bind([token]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as CaseRecord;
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  public listRecentCases(): CaseRecord[] {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare('SELECT * FROM cases ORDER BY created_at DESC LIMIT 20');
    const results: CaseRecord[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as CaseRecord);
    }
    stmt.free();
    return results;
  }

  public updateCaseStatus(id: string, status: CaseRecord['status'], errorMessage: string | null = null): void {
    if (!this.db) throw new Error('DB uninitialized');
    this.db.run('UPDATE cases SET status = ?, error_message = ? WHERE id = ?', [status, errorMessage, id]);
    this.saveToFile();
  }

  // --- Sources & Chunks Operations ---
  public addSource(source: SourceRecord): void {
    if (!this.db) throw new Error('DB uninitialized');
    this.db.run(
      `INSERT INTO sources (id, case_id, ordinal, filename, kind, content, char_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [source.id, source.case_id, source.ordinal, source.filename, source.kind, source.content, source.char_count]
    );
    this.saveToFile();
  }

  public getSources(caseId: string): SourceRecord[] {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare('SELECT * FROM sources WHERE case_id = ? ORDER BY ordinal ASC');
    stmt.bind([caseId]);
    const list: SourceRecord[] = [];
    while (stmt.step()) {
      list.push(stmt.getAsObject() as unknown as SourceRecord);
    }
    stmt.free();
    return list;
  }

  public addChunks(chunks: ChunkRecord[]): void {
    if (!this.db) throw new Error('DB uninitialized');
    for (const chunk of chunks) {
      this.db.run(
        `INSERT INTO chunks (id, case_id, source_id, label, start_line, end_line, text)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [chunk.id, chunk.case_id, chunk.source_id, chunk.label, chunk.start_line, chunk.end_line, chunk.text]
      );
    }
    this.saveToFile();
  }

  public getChunks(caseId: string): ChunkRecord[] {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare(`
      SELECT c.*, s.filename as source_filename
      FROM chunks c
      JOIN sources s ON c.source_id = s.id
      WHERE c.case_id = ?
      ORDER BY c.start_line ASC
    `);
    stmt.bind([caseId]);
    const list: ChunkRecord[] = [];
    while (stmt.step()) {
      list.push(stmt.getAsObject() as unknown as ChunkRecord);
    }
    stmt.free();
    return list;
  }

  public getChunkById(id: string): (ChunkRecord & { source_filename: string; source_kind: string }) | null {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare(`
      SELECT c.*, s.filename as source_filename, s.kind as source_kind
      FROM chunks c
      JOIN sources s ON c.source_id = s.id
      WHERE c.id = ?
    `);
    stmt.bind([id]);
    if (stmt.step()) {
      const res = stmt.getAsObject() as unknown as ChunkRecord & { source_filename: string; source_kind: string };
      stmt.free();
      return res;
    }
    stmt.free();
    return null;
  }

  // --- Items & Item Versions Operations ---
  public clearItems(caseId: string): void {
    if (!this.db) throw new Error('DB uninitialized');
    this.db.run('DELETE FROM items WHERE case_id = ?', [caseId]);
    this.saveToFile();
  }

  public addItem(item: ItemRecord): void {
    if (!this.db) throw new Error('DB uninitialized');
    this.db.run(
      `INSERT INTO items (
        id, case_id, type, statement, owner, quote, chunk_id, llm_confidence,
        verification, verification_note, review_status, confidential, reviewer_note,
        created_at, updated_at, match_start, match_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.case_id,
        item.type,
        item.statement,
        item.owner,
        item.quote,
        item.chunk_id,
        item.llm_confidence,
        item.verification,
        item.verification_note,
        item.review_status,
        item.confidential,
        item.reviewer_note,
        item.created_at,
        item.updated_at,
        item.match_start ?? null,
        item.match_end ?? null,
      ]
    );

    // Record initial creation version
    this.addVersion(item.id, 'create', item);
    this.saveToFile();
  }

  public getItems(caseId: string): ItemRecord[] {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare(`
      SELECT i.*, c.label as chunk_label, s.filename as source_filename
      FROM items i
      LEFT JOIN chunks c ON i.chunk_id = c.id
      LEFT JOIN sources s ON c.source_id = s.id
      WHERE i.case_id = ?
      ORDER BY i.created_at ASC
    `);
    stmt.bind([caseId]);
    const items: ItemRecord[] = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject() as unknown as ItemRecord);
    }
    stmt.free();
    return items;
  }

  public getItem(itemId: string): ItemRecord | null {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare(`
      SELECT i.*, c.label as chunk_label, s.filename as source_filename
      FROM items i
      LEFT JOIN chunks c ON i.chunk_id = c.id
      LEFT JOIN sources s ON c.source_id = s.id
      WHERE i.id = ?
    `);
    stmt.bind([itemId]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as ItemRecord;
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  public updateItemReview(
    itemId: string,
    action: 'approve' | 'reject' | 'confidential_toggle' | 'add_note' | 'edit',
    updates: Partial<ItemRecord>
  ): ItemRecord | null {
    if (!this.db) throw new Error('DB uninitialized');
    const current = this.getItem(itemId);
    if (!current) return null;

    const updated: ItemRecord = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.db.run(
      `UPDATE items SET
        type = ?, statement = ?, owner = ?, quote = ?,
        verification = ?, verification_note = ?,
        review_status = ?, confidential = ?, reviewer_note = ?,
        updated_at = ?
       WHERE id = ?`,
      [
        updated.type,
        updated.statement,
        updated.owner,
        updated.quote,
        updated.verification,
        updated.verification_note,
        updated.review_status,
        updated.confidential,
        updated.reviewer_note,
        updated.updated_at,
        itemId,
      ]
    );

    // Save version history record
    this.addVersion(itemId, action, updated);
    this.saveToFile();
    return this.getItem(itemId);
  }

  public approveAllVerified(caseId: string): number {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare(
      `SELECT * FROM items WHERE case_id = ? AND verification = 'verified' AND review_status != 'approved'`
    );
    stmt.bind([caseId]);
    const toApprove: ItemRecord[] = [];
    while (stmt.step()) {
      toApprove.push(stmt.getAsObject() as unknown as ItemRecord);
    }
    stmt.free();

    const now = new Date().toISOString();
    for (const item of toApprove) {
      const updatedItem = {
        ...item,
        review_status: 'approved' as const,
        updated_at: now,
      };
      this.db.run(`UPDATE items SET review_status = 'approved', updated_at = ? WHERE id = ?`, [now, item.id]);
      this.addVersion(item.id, 'approve', updatedItem);
    }

    this.saveToFile();
    return toApprove.length;
  }

  public addVersion(itemId: string, action: ItemVersionRecord['action'], snapshot: ItemRecord): void {
    if (!this.db) return;
    const versionId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.db.run(
      `INSERT INTO item_versions (id, item_id, action, snapshot_json, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [versionId, itemId, action, JSON.stringify(snapshot), new Date().toISOString()]
    );
  }

  public getVersions(itemId: string): ItemVersionRecord[] {
    if (!this.db) throw new Error('DB uninitialized');
    const stmt = this.db.prepare(
      'SELECT * FROM item_versions WHERE item_id = ? ORDER BY created_at DESC'
    );
    stmt.bind([itemId]);
    const list: ItemVersionRecord[] = [];
    while (stmt.step()) {
      list.push(stmt.getAsObject() as unknown as ItemVersionRecord);
    }
    stmt.free();
    return list;
  }
}
