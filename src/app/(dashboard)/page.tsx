import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { SubscriptionStatusBadge } from '@/components/StatusBadge';
import { UserLink } from '@/components/UserLink';
import { formatDate, formatFrequency } from '@/lib/format';

const QUICK_LINKS: { href: string; label: string; description: string }[] = [
  { href: '/deliveries', label: 'Deliveries', description: "Today's runs and recent history" },
  { href: '/extra-bottle-orders', label: 'Extra Bottles', description: 'One-off bottle orders' },
  { href: '/payments', label: 'Payments', description: 'Every checkout, all users' },
  { href: '/wallet', label: 'Wallet', description: 'Platform balance and withdrawals' },
  { href: '/commission', label: 'Commission', description: 'Partner payout tiers' },
  { href: '/referrals', label: 'Referrals', description: 'Codes, signups, and bonuses' },
  { href: '/notifications', label: 'Notifications', description: 'Customer campaigns' },
  { href: '/activity-log', label: 'Activity Log', description: 'Who changed what, and when' },
];

export default async function DashboardPage() {
  let subscriptions, partners, plans;
  try {
    [subscriptions, partners, plans] = await Promise.all([
      api.listSubscriptions(),
      api.listDeliveryPartners(),
      api.listPlans(),
    ]);
  } catch (err) {
    const message =
      err instanceof ApiError
        ? `Could not load dashboard data: ${err.message}`
        : 'Could not reach the JalLink API — check API_BASE_URL and that the backend is running.';
    return (
      <>
        <PageHeader title="Dashboard" description="Overview of subscriptions, delivery partners, and plans." />
        <ErrorBanner message={message} />
      </>
    );
  }

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;
  const completedCount = subscriptions.filter((s) => s.status === 'completed').length;
  const unassigned = subscriptions.filter((s) => s.status === 'active' && s.deliveryPartner === null);
  const activePartners = partners.filter((p) => p.isActive).length;
  const customerCount = new Set(subscriptions.map((s) => s.user.id)).size;
  const recent = subscriptions.slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of subscriptions, delivery partners, and plans." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active subscriptions" value={activeCount} tone="green" href="/subscriptions?status=active" />
        <StatCard label="Paused" value={pausedCount} tone="amber" href="/subscriptions?status=paused" />
        <StatCard label="Completed" value={completedCount} tone="blue" href="/subscriptions?status=completed" />
        <StatCard label="Cancelled" value={cancelledCount} tone="slate" href="/subscriptions?status=cancelled" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Unassigned deliveries"
          value={unassigned.length}
          tone={unassigned.length > 0 ? 'amber' : 'green'}
          href="/subscriptions?status=active"
        />
        <StatCard
          label="Delivery partners"
          value={`${activePartners} / ${partners.length} active`}
          tone="blue"
          href="/delivery-partners"
        />
        <StatCard label="Subscription plans" value={plans.length} tone="blue" href="/plans" />
        <StatCard label="Customers" value={customerCount} tone="blue" href="/users" />
      </div>

      {unassigned.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <strong>{unassigned.length}</strong> active subscription{unassigned.length === 1 ? '' : 's'} still need
          {unassigned.length === 1 ? 's' : ''} a delivery partner.{' '}
          <Link href="/subscriptions?status=active" className="font-semibold underline underline-offset-2">
            Review active subscriptions
          </Link>
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Recent subscriptions</h2>
          <Link href="/subscriptions" className="text-sm font-medium text-(--color-brand-blue-dark) hover:underline">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState title="No subscriptions yet" description="Once a customer subscribes, it will show up here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border) text-left text-xs tracking-wide text-(--color-text-muted) uppercase">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Frequency</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id} className="border-b border-(--color-border) last:border-0">
                    <td className="px-5 py-3">
                      <UserLink user={s.user} />
                    </td>
                    <td className="px-5 py-3">
                      <Link href="/plans" className="hover:underline">
                        {s.plan.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{formatFrequency(s.frequency)}</td>
                    <td className="px-5 py-3">
                      <SubscriptionStatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3 text-(--color-text-muted)">{formatDate(s.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/subscriptions/${s.id}`}
                        className="font-medium text-(--color-brand-blue-dark) hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Jump to</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-(--color-brand-blue) hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-(--color-text)">{link.label}</span>
                <span
                  aria-hidden="true"
                  className="text-(--color-text-muted) opacity-0 transition group-hover:opacity-100"
                >
                  →
                </span>
              </div>
              <p className="mt-1 text-xs text-(--color-text-muted)">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
