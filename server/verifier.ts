import { ChunkRecord, ExtractionCategory, ItemRecord, VerificationMetrics, VerificationStatus } from './types';

export interface RawExtractedItem {
  type: ExtractionCategory;
  statement: string;
  owner: string | null;
  quote: string;
  chunk_id: string;
  llm_confidence?: number;
}

export interface VerificationResult {
  status: VerificationStatus;
  note: string | null;
  matchStart?: number;
  matchEnd?: number;
  adjustedOwner: string | null;
}

/**
 * Normalizes text for comparison:
 * - Replaces curly/smart quotes with straight quotes
 * - Normalizes multiple whitespace / newlines into a single space
 * - Trims edges
 */
export function normalizeText(str: string): string {
  if (!str) return '';
  let cleaned = str
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip leading and trailing quotes if the quote was wrapped in quotation marks
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

/**
 * Verifies a single extracted item against the chunk pool and all source texts.
 */
export function verifyExtractedItem(
  item: RawExtractedItem,
  chunksById: Map<string, ChunkRecord>,
  allSourcesCombinedText: string
): VerificationResult {
  const quote = item.quote ? item.quote.trim() : '';

  // Rule: Quotes shorter than 12 characters must be unverified
  if (!quote || quote.length < 12) {
    return {
      status: 'unverified',
      note: 'Quote is shorter than 12 characters requirement or empty',
      adjustedOwner: checkOwner(item.owner, allSourcesCombinedText).owner,
    };
  }

  // Rule: A wrong chunk ID must not be accepted
  const targetChunk = chunksById.get(item.chunk_id);
  if (!targetChunk) {
    return {
      status: 'unverified',
      note: `Cited chunk ID '${item.chunk_id}' does not exist in ingested sources`,
      adjustedOwner: checkOwner(item.owner, allSourcesCombinedText).owner,
    };
  }

  const chunkText = targetChunk.text;

  // 1. Exact Substring Match Check
  const exactIndex = chunkText.indexOf(quote);
  if (exactIndex !== -1) {
    const ownerCheck = checkOwner(item.owner, allSourcesCombinedText);
    return {
      status: 'verified',
      note: ownerCheck.note,
      matchStart: exactIndex,
      matchEnd: exactIndex + quote.length,
      adjustedOwner: ownerCheck.owner,
    };
  }

  // 2. Approximate Match with Whitespace / Quote Normalization
  const normQuote = normalizeText(quote);
  const normChunk = normalizeText(chunkText);
  const approxIndex = normChunk.indexOf(normQuote);

  if (approxIndex !== -1) {
    // Find approximate char position in raw chunk text
    const roughStart = findRoughCharIndex(chunkText, normQuote);
    const ownerCheck = checkOwner(item.owner, allSourcesCombinedText);
    return {
      status: 'approximate',
      note: ownerCheck.note
        ? `Whitespace/punctuation normalized match. ${ownerCheck.note}`
        : 'Whitespace and quotation normalized match with cited chunk',
      matchStart: roughStart.start,
      matchEnd: roughStart.end,
      adjustedOwner: ownerCheck.owner,
    };
  }

  // 3. Fallback: check if the quote accidentally exists in a different chunk
  let foundInOtherChunk = false;
  for (const [otherId, otherChunk] of chunksById.entries()) {
    if (otherId !== item.chunk_id && otherChunk.text.includes(quote)) {
      foundInOtherChunk = true;
      break;
    }
  }

  const ownerCheck = checkOwner(item.owner, allSourcesCombinedText);
  return {
    status: 'unverified',
    note: foundInOtherChunk
      ? `Quote was found in a different chunk, not the cited chunk '${item.chunk_id}'`
      : 'Quote not found in cited source chunk',
    adjustedOwner: ownerCheck.owner,
  };
}

/**
 * If an owner is specified, check if they exist anywhere in the sources.
 * If not found, set owner to null and return note 'owner not found in sources'.
 */
function checkOwner(
  owner: string | null,
  allSourcesText: string
): { owner: string | null; note: string | null } {
  if (!owner || owner.trim() === '' || owner.toLowerCase() === 'unassigned' || owner.toLowerCase() === 'none') {
    return { owner: null, note: null };
  }

  const cleanOwner = owner.trim();
  const lowerSources = allSourcesText.toLowerCase();

  // Search for full name or first name if multi-word
  const parts = cleanOwner.split(/\s+/);
  const matchesFull = lowerSources.includes(cleanOwner.toLowerCase());
  const matchesFirst = parts.length > 1 && lowerSources.includes(parts[0].toLowerCase());

  if (!matchesFull && !matchesFirst) {
    return {
      owner: null,
      note: 'owner not found in sources',
    };
  }

  return { owner: cleanOwner, note: null };
}

/**
 * Finds approximate start and end offsets in raw text for normalized substring.
 */
function findRoughCharIndex(
  rawText: string,
  targetNorm: string
): { start: number; end: number } {
  const normWords = targetNorm.split(' ').filter(Boolean);
  if (normWords.length === 0) return { start: 0, end: 0 };

  const firstWord = normWords[0];
  const lastWord = normWords[normWords.length - 1];

  const firstIdx = rawText.indexOf(firstWord);
  if (firstIdx === -1) return { start: 0, end: Math.min(rawText.length, 100) };

  const lastIdx = rawText.lastIndexOf(lastWord);
  if (lastIdx !== -1 && lastIdx >= firstIdx) {
    return { start: firstIdx, end: Math.min(rawText.length, lastIdx + lastWord.length) };
  }

  return { start: firstIdx, end: Math.min(rawText.length, firstIdx + targetNorm.length) };
}

/**
 * Computes overall verification metrics according to Section 10 rules.
 */
export function calculateMetrics(items: ItemRecord[]): VerificationMetrics {
  const total = items.length;
  let verified = 0;
  let approximate = 0;
  let unverified = 0;

  for (const item of items) {
    if (item.verification === 'verified') verified++;
    else if (item.verification === 'approximate') approximate++;
    else unverified++;
  }

  const verification_rate = total > 0 ? Math.round((verified / total) * 100) : 0;
  const insufficient_evidence = verified < 3;

  return {
    total,
    verified,
    approximate,
    unverified,
    verification_rate,
    insufficient_evidence,
  };
}
