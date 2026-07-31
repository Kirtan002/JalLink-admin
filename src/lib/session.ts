import { createHmac, timingSafeEqual } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const SESSION_COOKIE_NAME = 'jallink_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

function getEnvValue(key: string): string | undefined {
  if (process.env[key] !== undefined) {
    return process.env[key];
  }

  const envFilePath = join(process.cwd(), '.env');
  if (!existsSync(envFilePath)) {
    return undefined;
  }

  const envFile = readFileSync(envFilePath, 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const parsedKey = trimmedLine.slice(0, separatorIndex).trim();
    if (parsedKey !== key) {
      continue;
    }

    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const unquotedValue = rawValue.replace(/^['"]|['"]$/g, '');
    process.env[key] = unquotedValue;
    return unquotedValue;
  }

  return undefined;
}

function getSecret(): string {
  const secret = getEnvValue('SESSION_SECRET');
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  return secret;
}

function sign(encodedPayload: string): string {
  return createHmac('sha256', getSecret()).update(encodedPayload).digest('base64url');
}

/** Builds a signed `payload.signature` session token — no server-side session store needed. */
export function createSessionToken(): string {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const encoded = Buffer.from(payload).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;

  const expected = Buffer.from(sign(encoded));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

/** Constant-time string comparison so a wrong-length guess can't be timed out. */
function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = getEnvValue('ADMIN_USERNAME') ?? '';
  const expectedPassword = getEnvValue('ADMIN_PASSWORD') ?? '';
  return constantTimeEqual(username, expectedUsername) && constantTimeEqual(password, expectedPassword);
}
