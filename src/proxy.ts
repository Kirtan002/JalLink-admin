import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/session';

/** Every screen a 'manager' account may reach. Everything else under (dashboard) — users,
 * subscriptions, the platform wallet, settings, and so on — stays admin-only; a manager
 * hitting any of those paths directly (typed URL, stale bookmark) is bounced back here rather
 * than the page ever rendering. Keep in sync with components/Sidebar.tsx's manager nav.
 *
 * '/delivery-partners' covers the list, the detail page, and the referral-payouts page — the
 * backend itself scopes a manager token to the partners (and payouts) they own, so the pages
 * don't need their own id-level allowlist here; the page components role-gate the admin-only
 * actions within them (KYC approve/reject, wallet withdraw). */
const MANAGER_ALLOWED_PREFIXES = ['/profile', '/delivery-partners'];

export function proxy(request: NextRequest) {
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isAuthenticated = session !== null;
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!isAuthenticated && !isLoginPage) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL(session.role === 'manager' ? '/profile' : '/', request.url));
  }

  if (isAuthenticated && session.role === 'manager') {
    const allowed = MANAGER_ALLOWED_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
    if (!allowed) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
