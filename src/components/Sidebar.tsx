'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/(dashboard)/actions';
import { Logo } from './Logo';

const NAV_GROUPS: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: 'Overview',
    items: [{ href: '/', label: 'Dashboard' }],
  },
  {
    label: 'Operations',
    items: [
      { href: '/subscriptions', label: 'Subscriptions' },
      { href: '/delivery-partners', label: 'Delivery Partners' },
      { href: '/deliveries', label: 'Deliveries' },
      { href: '/plans', label: 'Plans' },
      { href: '/extra-bottle-orders', label: 'Extra Bottles' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/wallet', label: 'Wallet' },
      { href: '/commission', label: 'Commission' },
      { href: '/payments', label: 'Payments' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { href: '/referrals', label: 'Referrals' },
      { href: '/notifications', label: 'Notifications' },
    ],
  },
  {
    label: 'Insight',
    items: [
      { href: '/reports', label: 'Reports' },
      { href: '/analytics', label: 'Analytics' },
      { href: '/activity-log', label: 'Activity Log' },
    ],
  },
];

export function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-(--color-border) bg-(--color-surface) px-4 py-6">
      <div className="mb-8 px-2">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-xs font-semibold tracking-wide text-(--color-text-muted) uppercase">
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-(--color-brand-blue-light) text-(--color-brand-blue-dark)'
                        : 'text-(--color-text-muted) hover:bg-(--color-surface-muted) hover:text-(--color-text)'
                    }`}
                  >
                    {item.label}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-(--color-brand-green)" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-(--color-border) pt-4">
        <p className="truncate px-2 text-xs text-(--color-text-muted)">
          Signed in as <span className="font-medium text-(--color-text)">{username}</span>
        </p>
        <form action={logout} className="mt-2">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-(--color-text-muted) transition hover:bg-(--color-surface-muted) hover:text-red-600"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
