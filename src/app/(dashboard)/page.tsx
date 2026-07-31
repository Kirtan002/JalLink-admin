import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { SubscriptionStatusBadge } from '@/components/StatusBadge';
import { formatDate, formatFrequency } from '@/lib/format';

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
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;
  const completedCount = subscriptions.filter((s) => s.status === 'completed').length;
  const unassigned = subscriptions.filter((s) => s.status === 'active' && s.deliveryPartner === null);
  const activePartners = partners.filter((p) => p.isActive).length;
  const recent = subscriptions.slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of subscriptions, delivery partners, and plans." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active subscriptions" value={activeCount} tone="green" />
        <StatCard label="Completed" value={completedCount} tone="blue" />
        <StatCard label="Cancelled" value={cancelledCount} tone="slate" />
        <StatCard label="Unassigned deliveries" value={unassigned.length} tone={unassigned.length > 0 ? 'amber' : 'green'} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Delivery partners" value={`${activePartners} / ${partners.length} active`} tone="blue" />
        <StatCard label="Subscription plans" value={plans.length} tone="blue" />
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
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id} className="border-b border-(--color-border) last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/subscriptions/${s.id}`} className="font-medium text-(--color-text) hover:underline">
                        {s.user.name ?? 'Unnamed customer'}
                      </Link>
                      <div className="text-xs text-(--color-text-muted)">{s.user.mobile}</div>
                    </td>
                    <td className="px-5 py-3">{s.plan.name}</td>
                    <td className="px-5 py-3">{formatFrequency(s.frequency)}</td>
                    <td className="px-5 py-3">
                      <SubscriptionStatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3 text-(--color-text-muted)">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
