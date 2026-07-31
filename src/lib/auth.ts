import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, createSessionToken, isValidSessionToken } from './session';

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionToken(store.get(SESSION_COOKIE_NAME)?.value);
}

/** Defense-in-depth for Server Actions — proxy already gates page loads, but a forged
 * POST can hit an action directly without ever rendering the page. */
export async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error('UNAUTHORIZED');
  }
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, createSessionToken(), {
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
