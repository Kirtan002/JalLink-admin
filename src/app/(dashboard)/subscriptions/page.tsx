import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { SubscriptionStatus } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import { DataTable } from '@/components/DataTable';
import { SubscriptionStatusBadge } from '@/components/StatusBadge';
import { UserLink } from '@/components/UserLink';
import { formatDate, formatFrequency } from '@/lib/format';
import { getDictionary } from '@/lib/i18n/server';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const TABS: { key: keyof Dictionary['status']['subscription'] | 'all'; value?: SubscriptionStatus }[] = [
  { key: 'all' },
  { key: 'active', value: 'active' },
  { key: 'paused', value: 'paused' },
  { key: 'cancelled', value: 'cancelled' },
  { key: 'completed', value: 'completed' },
];

function isSubscriptionStatus(value: string | undefined): value is SubscriptionStatus {
  return TABS.some((tab) => tab.value !== undefined && tab.value === value);
}

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const t = await getDictionary();
  const { status: rawStatus } = await searchParams;
  const status = isSubscriptionStatus(rawStatus) ? rawStatus : undefined;

  let subscriptions;
  try {
    subscriptions = await api.listSubscriptions(status);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.subscriptions.title} description={t.subscriptions.description} />
        <ErrorBanner message={message} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t.subscriptions.title} description={t.subscriptions.description} />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = tab.value === status;
          const href = tab.value ? `/subscriptions?status=${tab.value}` : '/subscriptions';
          return (
            <Link
              key={tab.key}
              href={href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'brand-gradient text-white shadow-sm'
                  : 'border border-(--color-border) text-(--color-text-muted) hover:bg-(--color-surface-muted)'
              }`}
            >
              {tab.key === 'all' ? t.common.all : t.status.subscription[tab.key]}
            </Link>
          );
        })}
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState title={t.subscriptions.empty} description={t.subscriptions.emptyHint} />
      ) : (
        <DataTable
          columns={[
            { header: t.common.customer, cell: (s) => <UserLink user={s.user} /> },
            {
              header: t.common.plan,
              cell: (s) => (
                <Link href="/plans" className="hover:underline">
                  {s.plan.name}
                </Link>
              ),
            },
            { header: t.common.frequency, cell: (s) => formatFrequency(s.frequency) },
            {
              header: t.subscriptions.bottles,
              cell: (s) => `${s.totalBottles} × ${s.bottleSizeLtr}L`,
            },
            {
              header: t.subscriptions.schedule,
              cell: (s) => (
                <span className="whitespace-nowrap text-(--color-text-muted)">
                  {formatDate(s.startDate)} → {formatDate(s.endDate)}
                </span>
              ),
            },
            { header: t.common.status, cell: (s) => <SubscriptionStatusBadge status={s.status} /> },
            {
              header: t.subscriptions.deliveryPartner,
              cell: (s) =>
                s.deliveryPartner ? (
                  <Link href={`/delivery-partners/${s.deliveryPartner.id}`} className="hover:underline">
                    {s.deliveryPartner.name}
                  </Link>
                ) : (
                  <Badge tone="amber">{t.common.unassigned}</Badge>
                ),
            },
            {
              header: '',
              align: 'right',
              cell: (s) => (
                <Link
                  href={`/subscriptions/${s.id}`}
                  className="font-medium text-(--color-brand-blue-dark) hover:underline"
                >
                  {t.common.view}
                </Link>
              ),
            },
          ]}
          rows={subscriptions}
        />
      )}
    </>
  );
}
