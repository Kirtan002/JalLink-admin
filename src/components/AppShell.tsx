'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from '@/lib/i18n/client';
import { Logo } from './Logo';
import { Sidebar } from './Sidebar';

/**
 * The dashboard chrome, and the only component that knows the panel has two layouts.
 *
 * From `lg` up the sidebar is a permanent column and the top bar does not exist. Below it,
 * the sidebar becomes an off-canvas drawer opened from a sticky top bar — which is what makes
 * the panel usable on a phone at all, where a 256px fixed column left no room for a table.
 *
 * `children` is server-rendered and passed straight through: marking this file `'use client'`
 * costs nothing but the drawer state itself.
 */
export function AppShell({ username, children }: { username: string; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations();

  // Note: the drawer closes from the nav links themselves (they call `onClose`), not from an
  // effect watching the pathname — tapping a link *is* the event, and reacting to the route
  // change instead would mean an extra render on every navigation, drawer or no drawer.
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    // The page behind an open drawer must not scroll away under it.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen items-start">
      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
        />
      )}

      <Sidebar username={username} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-(--color-border) bg-(--color-surface) px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t.app.openMenu}
            aria-expanded={menuOpen}
            className="-ml-1 rounded-lg p-1.5 text-(--color-text) transition hover:bg-(--color-surface-muted)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <Logo />
        </header>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
