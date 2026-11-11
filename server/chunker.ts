/**
 * Deterministic chunking engine for Trailmark.
 * Preserves original line numbers, never splits mid-line,
 * formats CSVs with header repetition, pretty-prints JSON,
 * and generates deterministic labels like S1:L1-18.
 */

export interface ChunkOutput {
  id: string;
  sourceOrdinal: number;
  label: string;
  startLine: number;
  endLine: number;
  text: string;
}

export function chunkSource(
  sourceId: string,
  sourceOrdinal: number,
  filename: string,
  kind: 'txt' | 'md' | 'csv' | 'json' | 'pasted',
  rawContent: string,
  targetCharCount = 1200
): ChunkOutput[] {
  let content = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // JSON pretty printing requirement
  if (kind === 'json') {
    try {
      const parsed = JSON.parse(content);
      content = JSON.stringify(parsed, null, 2);
    } catch {
      // If parsing fails, use raw content as fallback
    }
  }

  // CSV chunking requirement: repeat header row and group approx 15 data rows
  if (kind === 'csv') {
    return chunkCsv(sourceId, sourceOrdinal, content, 15);
  }

  // Text, Markdown, JSON, Pasted
  const lines = content.split('\n');
  const chunks: ChunkOutput[] = [];

  let currentChunkLines: string[] = [];
  let currentStartLine = 1;
  let currentChars = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check if adding this line would exceed targetCharCount and we already have content
    const lineLengthWithNewline = line.length + 1;
    if (currentChars + lineLengthWithNewline > targetCharCount && currentChunkLines.length > 0) {
      const endLine = currentStartLine + currentChunkLines.length - 1;
      const text = currentChunkLines.join('\n');
      const chunkIndex = chunks.length + 1;
      const label = `S${sourceOrdinal}:L${currentStartLine}-${endLine}`;
      const chunkId = `chk_${sourceId}_${chunkIndex}`;

      chunks.push({
        id: chunkId,
        sourceOrdinal,
        label,
        startLine: currentStartLine,
        endLine,
        text,
      });

      currentChunkLines = [];
      currentStartLine = lineNumber;
      currentChars = 0;
    }

    currentChunkLines.push(line);
    currentChars += lineLengthWithNewline;
  }

  // Flush remaining lines
  if (currentChunkLines.length > 0) {
    const endLine = currentStartLine + currentChunkLines.length - 1;
    const text = currentChunkLines.join('\n');
    const chunkIndex = chunks.length + 1;
    const label = `S${sourceOrdinal}:L${currentStartLine}-${endLine}`;
    const chunkId = `chk_${sourceId}_${chunkIndex}`;

    chunks.push({
      id: chunkId,
      sourceOrdinal,
      label,
      startLine: currentStartLine,
      endLine,
      text,
    });
  }

  // Ensure at least one chunk even for empty files
  if (chunks.length === 0) {
    chunks.push({
      id: `chk_${sourceId}_1`,
      sourceOrdinal,
      label: `S${sourceOrdinal}:L1-1`,
      startLine: 1,
      endLine: 1,
      text: '',
    });
  }

  return chunks;
}

function chunkCsv(
  sourceId: string,
  sourceOrdinal: number,
  content: string,
  rowsPerChunk = 15
): ChunkOutput[] {
  const lines = content.split('\n');
  if (lines.length <= 1) {
    return [
      {
        id: `chk_${sourceId}_1`,
        sourceOrdinal,
        label: `S${sourceOrdinal}:L1-${lines.length || 1}`,
        startLine: 1,
        endLine: lines.length || 1,
        text: content,
      },
    ];
  }

  const header = lines[0];
  const dataRows = lines.slice(1);
  const chunks: ChunkOutput[] = [];

  let currentBatch: string[] = [];
  let batchStartLine = 2; // lines are 1-indexed; data row 1 is line 2

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    currentBatch.push(row);

    if (currentBatch.length >= rowsPerChunk || i === dataRows.length - 1) {
      const endLine = batchStartLine + currentBatch.length - 1;
      const text = `${header}\n${currentBatch.join('\n')}`;
      const chunkIndex = chunks.length + 1;
      const label = `S${sourceOrdinal}:L1,L${batchStartLine}-${endLine}`;
      const chunkId = `chk_${sourceId}_${chunkIndex}`;

      chunks.push({
        id: chunkId,
        sourceOrdinal,
        label,
        startLine: batchStartLine,
        endLine,
        text,
      });

      batchStartLine = endLine + 1;
      currentBatch = [];
    }
  }

  return chunks;
}
