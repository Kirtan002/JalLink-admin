'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/(dashboard)/actions';
import { useTranslations } from '@/lib/i18n/client';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';

/**
 * Nav items name their dictionary key instead of a label, so the whole tree translates
 * without the structure being duplicated per locale.
 */
type NavGroupKey = keyof Dictionary['nav']['groups'];
type NavItemKey = keyof Dictionary['nav']['items'];

const NAV_GROUPS: { key: NavGroupKey; items: { href: string; key: NavItemKey }[] }[] = [
  {
    key: 'overview',
    items: [{ href: '/', key: 'dashboard' }],
  },
  {
    key: 'operations',
    items: [
      { href: '/users', key: 'users' },
      { href: '/subscriptions', key: 'subscriptions' },
      { href: '/delivery-partners', key: 'deliveryPartners' },
      { href: '/deliveries', key: 'deliveries' },
      { href: '/plans', key: 'plans' },
      { href: '/extra-bottle-orders', key: 'extraBottles' },
    ],
  },
  {
    key: 'finance',
    items: [
      { href: '/wallet', key: 'wallet' },
      { href: '/commission', key: 'commission' },
      { href: '/payments', key: 'payments' },
    ],
  },
  {
    key: 'growth',
    items: [
      { href: '/referrals', key: 'referrals' },
      { href: '/notifications', key: 'notifications' },
    ],
  },
  {
    key: 'insight',
    items: [
      { href: '/reports', key: 'reports' },
      { href: '/analytics', key: 'analytics' },
      { href: '/activity-log', key: 'activityLog' },
    ],
  },
  {
    key: 'configuration',
    items: [{ href: '/settings', key: 'settings' }],
  },
];

export function Sidebar({
  username,
  open,
  onClose,
}: {
  username: string;
  /** Mobile only — on `lg` and up the sidebar is always in the layout. */
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations();

  // Below `lg` this is an off-canvas drawer; from `lg` it is the permanent column, where
  // sticky + h-screen pin it while only the page content scrolls. `invisible` (not just a
  // transform) is what keeps a closed drawer's links out of the tab order on mobile.
  return (
    <aside
      aria-label={t.app.navigation}
      className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col overflow-y-auto border-r border-(--color-border) bg-(--color-surface) px-4 py-6 transition-[transform,visibility] duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0 lg:transition-none ${
        open ? 'visible translate-x-0 shadow-2xl lg:shadow-none' : 'invisible -translate-x-full lg:visible'
      }`}
    >
      <div className="mb-8 flex items-center justify-between gap-2 px-2">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label={t.app.closeMenu}
          className="-mr-1 rounded-lg p-1.5 text-(--color-text-muted) transition hover:bg-(--color-surface-muted) lg:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-7">
        {NAV_GROUPS.map((group) => (
          <div key={group.key}>
            {/* Headings are deliberately dimmer, smaller and wider-tracked than the items
                below them, so a group label never reads as something you can click. */}
            <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-(--color-text-muted) uppercase opacity-70">
              {t.nav.groups[group.key]}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-(--color-brand-blue-light) font-semibold text-(--color-brand-blue-dark)'
                        : 'font-medium text-(--color-text) hover:bg-(--color-surface-muted)'
                    }`}
                  >
                    {t.nav.items[item.key]}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-(--color-brand-green)" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 border-t border-(--color-border) pt-4">
        <LanguageSwitcher className="mb-3 px-1" />
        <p className="truncate px-2 text-xs text-(--color-text-muted)">
          {t.app.signedInAs} <span className="font-medium text-(--color-text)">{username}</span>
        </p>
        <form action={logout} className="mt-2">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-(--color-text-muted) transition hover:bg-(--color-surface-muted) hover:text-red-600"
          >
            {t.app.signOut}
          </button>
        </form>
      </div>
    </aside>
  );
}
