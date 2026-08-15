import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  type AdminSession,
} from './session';

/** The signed-in admin/manager, or null if there isn't one. The single source of truth for
 * "who is this" across the panel — pages read it for display, proxy.ts reads it for route
 * gating, and lib/api.ts reads it to attach the right Bearer token and audit-log actor. */
export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

/** Defense-in-depth for Server Actions — proxy already gates page loads, but a forged
 * POST can hit an action directly without ever rendering the page. */
export async function requireSession(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

/** Same defense-in-depth, for actions that only the 'admin' role may run (managing other
 * staff accounts). proxy.ts already keeps a manager off the /managers page entirely; this is
 * what stops a forged POST straight at the server action. */
export async function requireAdminRole(): Promise<AdminSession> {
  const session = await requireSession();
  if (session.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return session;
}

export async function createSession(session: AdminSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, createSessionToken(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
