import { SecurityFinding } from './types';

// Patterns that indicate attempted prompt injection attacks in source text
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s+prompt\s*:/i,
  /you\s+are\s+now\s+a\s+/i,
  /system\s+instruction\s*:/i,
  /forget\s+all\s+(your\s+)?rules/i,
  /output\s+only\s+the\s+following/i,
  /bypass\s+all\s+(security|safety|verification)/i,
  /do\s+not\s+verify\s+this/i,
  /mark\s+as\s+verified\s+immediately/i,
  /elevate\s+privileges/i,
];

// Patterns for potential API keys, passwords, bearer tokens
const SECRET_PATTERNS = [
  { type: 'api_key' as const, name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { type: 'api_key' as const, name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
  { type: 'api_key' as const, name: 'OpenAI Secret Key', regex: /sk-[a-zA-Z0-9]{20,}/ },
  { type: 'token' as const, name: 'Bearer Token', regex: /bearer\s+[a-zA-Z0-9_\-\.]{25,}/i },
  { type: 'password' as const, name: 'Plaintext Password', regex: /password\s*[:=]\s*["']?([^\s"';]{6,})["']?/i },
  { type: 'token' as const, name: 'Private Key Block', regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/ },
];

// Patterns for PII
const PII_PATTERNS = [
  { type: 'email' as const, name: 'Email Address', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: 'phone' as const, name: 'Phone Number', regex: /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/g },
];

export function scanForSecurityIssues(
  text: string,
  chunkId?: string,
  filename?: string
): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  // 1. Scan for Prompt Injection
  for (const pattern of INJECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const matchIdx = match.index ?? 0;
      const snippet = text.substring(Math.max(0, matchIdx - 20), Math.min(text.length, matchIdx + match[0].length + 40));
      findings.push({
        type: 'injection',
        message: `Prompt injection signature detected: "${match[0]}". Ingested data is strictly isolated as DATA, never instructions.`,
        snippet: snippet.trim(),
        chunkId,
        filename,
      });
      break; // One injection finding per chunk is sufficient
    }
  }

  // 2. Scan for Secrets & API Keys
  for (const secret of SECRET_PATTERNS) {
    const match = text.match(secret.regex);
    if (match) {
      const snippet = match[0].substring(0, 8) + '...' + (match[0].length > 12 ? match[0].slice(-4) : '');
      findings.push({
        type: secret.type,
        message: `Likely ${secret.name} detected in source material. Sensitive credentials should not be committed to project documentation.`,
        snippet,
        chunkId,
        filename,
      });
    }
  }

  // 3. Scan for PII (summary count)
  for (const pii of PII_PATTERNS) {
    const matches = text.match(pii.regex);
    if (matches && matches.length > 0) {
      findings.push({
        type: pii.type,
        message: `${matches.length} ${pii.name}(s) detected. Confirm leaver and newcomer contact privacy before sharing.`,
        snippet: `${matches.length} instance(s) found`,
        chunkId,
        filename,
      });
    }
  }

  return findings;
}
