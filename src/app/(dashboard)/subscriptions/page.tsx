import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { SubscriptionStatus } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import { SubscriptionStatusBadge } from '@/components/StatusBadge';
import { UserLink } from '@/components/UserLink';
import { formatDate, formatFrequency } from '@/lib/format';

const TABS: { label: string; value?: SubscriptionStatus }[] = [
  { label: 'All' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' },
];

function isSubscriptionStatus(value: string | undefined): value is SubscriptionStatus {
  return TABS.some((tab) => tab.value !== undefined && tab.value === value);
}

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = isSubscriptionStatus(rawStatus) ? rawStatus : undefined;

  let subscriptions;
  try {
    subscriptions = await api.listSubscriptions(status);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Subscriptions" description="All customer subscriptions across every plan." />
        <ErrorBanner message={message} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Subscriptions" description="All customer subscriptions across every plan." />

      <div className="mb-6 flex gap-2">
        {TABS.map((tab) => {
          const isActive = tab.value === status;
          const href = tab.value ? `/subscriptions?status=${tab.value}` : '/subscriptions';
          return (
            <Link
              key={tab.label}
              href={href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'brand-gradient text-white shadow-sm'
                  : 'border border-(--color-border) text-(--color-text-muted) hover:bg-(--color-surface-muted)'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState title="No subscriptions found" description="Try a different filter, or check back once customers subscribe." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border) text-left text-xs tracking-wide text-(--color-text-muted) uppercase">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Frequency</th>
                <th className="px-5 py-3 font-medium">Bottles</th>
                <th className="px-5 py-3 font-medium">Schedule</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Delivery partner</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
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
                    {s.totalBottles} × {s.bottleSizeLtr}L
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-(--color-text-muted)">
                    {formatDate(s.startDate)} → {formatDate(s.endDate)}
                  </td>
                  <td className="px-5 py-3">
                    <SubscriptionStatusBadge status={s.status} />
                  </td>
                  <td className="px-5 py-3">
                    {s.deliveryPartner ? (
                      <Link href="/delivery-partners" className="hover:underline">
                        {s.deliveryPartner.name}
                      </Link>
                    ) : (
                      <Badge tone="amber">Unassigned</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/subscriptions/${s.id}`} className="font-medium text-(--color-brand-blue-dark) hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
