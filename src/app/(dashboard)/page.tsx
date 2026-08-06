import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { SubscriptionStatusBadge } from '@/components/StatusBadge';
import { UserLink } from '@/components/UserLink';
import { DataTable } from '@/components/DataTable';
import { formatDate, formatFrequency } from '@/lib/format';
import { interpolate } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/server';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const QUICK_LINKS: {
  href: string;
  labelKey: keyof Dictionary['nav']['items'];
  descriptionKey: keyof Dictionary['dashboard']['quickLinks'];
}[] = [
  { href: '/deliveries', labelKey: 'deliveries', descriptionKey: 'deliveries' },
  { href: '/extra-bottle-orders', labelKey: 'extraBottles', descriptionKey: 'extraBottles' },
  { href: '/payments', labelKey: 'payments', descriptionKey: 'payments' },
  { href: '/wallet', labelKey: 'wallet', descriptionKey: 'wallet' },
  { href: '/commission', labelKey: 'commission', descriptionKey: 'commission' },
  { href: '/referrals', labelKey: 'referrals', descriptionKey: 'referrals' },
  { href: '/notifications', labelKey: 'notifications', descriptionKey: 'notifications' },
  { href: '/activity-log', labelKey: 'activityLog', descriptionKey: 'activityLog' },
];

export default async function DashboardPage() {
  const t = await getDictionary();

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
        ? interpolate(t.dashboard.loadError, { message: err.message })
        : t.dashboard.unreachable;
    return (
      <>
        <PageHeader title={t.dashboard.title} description={t.dashboard.description} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;
  const completedCount = subscriptions.filter((s) => s.status === 'completed').length;
  const unassigned = subscriptions.filter((s) => s.status === 'active' && s.deliveryPartner === null);
  const activePartners = partners.filter((p) => p.isActive && p.kycStatus === 'approved').length;
  const pendingKyc = partners.filter((p) => p.kycStatus === 'pending').length;
  const customerCount = new Set(subscriptions.map((s) => s.user.id)).size;
  const recent = subscriptions.slice(0, 5);

  return (
    <>
      <PageHeader title={t.dashboard.title} description={t.dashboard.description} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label={t.dashboard.activeSubscriptions}
          value={activeCount}
          tone="green"
          href="/subscriptions?status=active"
        />
        <StatCard label={t.dashboard.paused} value={pausedCount} tone="amber" href="/subscriptions?status=paused" />
        <StatCard
          label={t.dashboard.completed}
          value={completedCount}
          tone="blue"
          href="/subscriptions?status=completed"
        />
        <StatCard
          label={t.dashboard.cancelled}
          value={cancelledCount}
          tone="slate"
          href="/subscriptions?status=cancelled"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label={t.dashboard.unassignedDeliveries}
          value={unassigned.length}
          tone={unassigned.length > 0 ? 'amber' : 'green'}
          href="/subscriptions?status=active"
        />
        <StatCard
          label={t.dashboard.kycPending}
          value={pendingKyc}
          tone={pendingKyc > 0 ? 'amber' : 'green'}
          href="/delivery-partners"
        />
        <StatCard
          label={t.dashboard.deliveryPartners}
          value={interpolate(t.dashboard.partnersActive, {
            active: activePartners,
            total: partners.length,
          })}
          tone="blue"
          href="/delivery-partners"
        />
        <StatCard label={t.dashboard.subscriptionPlans} value={plans.length} tone="blue" href="/plans" />
        <StatCard label={t.dashboard.customers} value={customerCount} tone="blue" href="/users" />
      </div>

      {/* Two different things can block the operation, and each gets its own banner rather
          than one combined "attention needed" — they are fixed on different screens. */}
      {pendingKyc > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {pendingKyc === 1
            ? t.dashboard.kycBannerOne
            : interpolate(t.dashboard.kycBannerMany, { count: pendingKyc })}{' '}
          <Link href="/delivery-partners" className="font-semibold underline underline-offset-2">
            {t.dashboard.reviewKyc}
          </Link>
        </div>
      )}

      {unassigned.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {unassigned.length === 1
            ? t.dashboard.unassignedBannerOne
            : interpolate(t.dashboard.unassignedBannerMany, { count: unassigned.length })}{' '}
          <Link href="/subscriptions?status=active" className="font-semibold underline underline-offset-2">
            {t.dashboard.reviewActive}
          </Link>
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {t.dashboard.recentSubscriptions}
          </h2>
          <Link
            href="/subscriptions"
            className="shrink-0 text-sm font-medium text-(--color-brand-blue-dark) hover:underline"
          >
            {t.common.viewAll}
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState title={t.dashboard.noSubscriptions} description={t.dashboard.noSubscriptionsHint} />
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
              { header: t.common.status, cell: (s) => <SubscriptionStatusBadge status={s.status} /> },
              {
                header: t.common.created,
                cell: (s) => <span className="text-(--color-text-muted)">{formatDate(s.createdAt)}</span>,
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
            rows={recent}
          />
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
          {t.dashboard.jumpTo}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-(--color-brand-blue) hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-(--color-text)">
                  {t.nav.items[link.labelKey]}
                </span>
                <span
                  aria-hidden="true"
                  className="text-(--color-text-muted) opacity-0 transition group-hover:opacity-100"
                >
                  →
                </span>
              </div>
              <p className="mt-1 text-xs text-(--color-text-muted)">
                {t.dashboard.quickLinks[link.descriptionKey]}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
