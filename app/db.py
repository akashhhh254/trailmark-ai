"""SQLite database initialization for Trailmark."""
import sqlite3
import os
from .config import settings

def get_db_path() -> str:
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    return os.path.join(settings.DATA_DIR, "trailmark.sqlite")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    with conn:
        conn.executescript("""
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
        """)
    conn.close()
