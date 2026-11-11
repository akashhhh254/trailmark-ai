export type ExtractionCategory =
  | 'decision'
  | 'ownership'
  | 'risk'
  | 'open_question'
  | 'dependency'
  | 'next_action';

export type VerificationStatus = 'verified' | 'approximate' | 'unverified';
export type ReviewStatus = 'draft' | 'approved' | 'rejected';

export interface CaseRecord {
  id: string;
  name: string;
  leaver_name: string;
  newcomer_role: string;
  status: 'draft' | 'processing' | 'ready' | 'error';
  error_message: string | null;
  share_token: string;
  created_at: string;
}

export interface SourceRecord {
  id: string;
  case_id: string;
  ordinal: number;
  filename: string;
  kind: 'txt' | 'md' | 'csv' | 'json' | 'pasted';
  content: string;
  char_count: number;
}

export interface ChunkRecord {
  id: string;
  case_id: string;
  source_id: string;
  label: string;
  start_line: number;
  end_line: number;
  text: string;
  source_filename?: string;
}

export interface ItemRecord {
  id: string;
  case_id: string;
  type: ExtractionCategory;
  statement: string;
  owner: string | null;
  quote: string;
  chunk_id: string;
  llm_confidence: number;
  verification: VerificationStatus;
  verification_note: string | null;
  review_status: ReviewStatus;
  confidential: number; // 0 or 1
  reviewer_note: string | null;
  created_at: string;
  updated_at: string;
  match_start?: number;
  match_end?: number;
  chunk_label?: string;
  source_filename?: string;
}

export interface ItemVersionRecord {
  id: string;
  item_id: string;
  action: 'create' | 'approve' | 'reject' | 'edit' | 'confidential_toggle' | 'add_note';
  snapshot_json: string;
  created_at: string;
}

export interface VerificationMetrics {
  total: number;
  verified: number;
  approximate: number;
  unverified: number;
  verification_rate: number;
  insufficient_evidence: boolean;
}

export interface SecurityFinding {
  type: 'injection' | 'api_key' | 'password' | 'token' | 'email' | 'phone';
  message: string;
  snippet: string;
  chunk_id?: string;
  chunkId?: string;
  filename?: string;
}
