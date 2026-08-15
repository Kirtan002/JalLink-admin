import { createHmac, timingSafeEqual } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { AdminRole } from './types';

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

/** Everything the panel needs about who's signed in, without another round trip to the
 * backend on every page render. `accessToken` is the backend-issued admin JWT from
 * POST /admin/auth/login — opaque here, just carried along so lib/api.ts can attach it as a
 * Bearer token on the caller's behalf. */
export interface AdminSession {
  adminId: string;
  name: string;
  username: string;
  role: AdminRole;
  accessToken: string;
}

interface SessionPayload extends AdminSession {
  exp: number;
}

/** Builds a signed `payload.signature` session token — no server-side session store needed. */
export function createSessionToken(session: AdminSession): string {
  const payload: SessionPayload = { ...session, exp: Date.now() + SESSION_TTL_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

/** Verifies the signature and expiry, returning the embedded session or null. This is the
 * only place a session cookie's contents are trusted — everything downstream (proxy.ts's
 * route gating, the sidebar's role filtering, lib/api.ts's Bearer header) reads through here
 * rather than decoding the cookie itself. */
export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) return null;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(encoded));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<SessionPayload>;
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) return null;
    if (!payload.adminId || !payload.username || !payload.role || !payload.accessToken || !payload.name) {
      return null;
    }
    const { exp: _exp, ...session } = payload as SessionPayload;
    return session;
  } catch {
    return null;
  }
}
