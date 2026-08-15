import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import {
  ExtraBottleOrderStatusBadge,
  PaymentStatusBadge,
  SubscriptionStatusBadge,
} from '@/components/StatusBadge';
import { formatAddress, formatCurrency, formatDate, formatDateTime, formatFloor, formatFrequency } from '@/lib/format';
import { interpolate } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/server';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getDictionary();

  // Assembled from the list endpoints — there's no /admin/users/:id on the backend yet.
  let referrals, subscriptions, payments, orders, links, payouts, settings;
  try {
    [referrals, subscriptions, payments, orders, links, payouts, settings] = await Promise.all([
      api.listReferrals(),
      api.listSubscriptions(),
      api.listPayments(),
      api.listExtraBottleOrders(),
      api.listReferralLinks(),
      api.listReferralPayouts(),
      api.getSettings(),
    ]);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.users.detail.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const referral = referrals.find((r) => r.id === id) ?? null;
  const userSubscriptions = subscriptions.filter((s) => s.user.id === id);
  const userPayments = payments.filter((p) => p.user.id === id);
  const userOrders = orders.filter((o) => o.user.id === id);
  const holdersOfCode = links.filter((l) => l.owner.id === id);
  const codesHeld = links.filter((l) => l.holder.id === id);
  const earnedAsHolder = payouts
    .filter((p) => p.holder.id === id && p.status === 'credited')
    .reduce((sum, p) => sum + Number(p.rewardAmount), 0);
  // Only available once this user has bought at least one plan — there's no dedicated
  // /admin/users/:id endpoint to read it from directly otherwise (see comment above).
  const programSelection = userSubscriptions[0]?.user.programSelection ?? null;

  // Fall back to whatever record mentions them, so a user missing from the referral
  // leaderboard still resolves instead of 404-ing.
  const identity =
    referral ?? userSubscriptions[0]?.user ?? userPayments[0]?.user ?? userOrders[0]?.user ?? null;
  if (!identity) {
    notFound();
  }

  const activeSubscriptions = userSubscriptions.filter((s) => s.status === 'active');
  const paidTotal = userPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const latestAddress = userSubscriptions[0]?.address ?? null;

  return (
    <>
      <Link href="/users" className="mb-4 inline-block text-sm text-(--color-brand-blue-dark) hover:underline">
        {t.users.detail.back}
      </Link>

      <PageHeader
        title={identity.name ?? t.common.unnamedCustomer}
        description={identity.mobile}
        action={
          activeSubscriptions.length > 0 ? (
            <Badge tone="green">{t.users.detail.activeSubscriber}</Badge>
          ) : (
            <Badge tone="slate">{t.users.detail.noActiveSubscription}</Badge>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label={t.users.detail.subscriptions}
          value={userSubscriptions.length}
          tone="blue"
          href="/subscriptions"
        />
        <StatCard
          label={t.users.detail.totalPaid}
          value={formatCurrency(String(paidTotal))}
          tone="green"
          href="/payments"
        />
        <StatCard
          label={t.users.detail.extraBottleOrders}
          value={userOrders.length}
          tone="slate"
          href="/extra-bottle-orders"
        />
        <StatCard
          label={t.users.walletBalance}
          value={formatCurrency(referral?.walletBalance ?? '0')}
          tone="amber"
          href="/referrals"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          title={t.users.detail.referrals}
          action={
            programSelection ? (
              <Badge tone={programSelection === 'referral' ? 'blue' : 'green'}>
                {programSelection === 'referral' ? t.users.detail.referralProgram : t.users.detail.discountProgram}
              </Badge>
            ) : (
              <Badge tone="slate">{t.users.detail.programNotChosen}</Badge>
            )
          }
        >
          <dl className="flex flex-col gap-3 text-sm">
            <Row label={t.users.referralCode}>
              <span className="font-mono text-xs">{referral?.referralCode ?? t.common.dash}</span>
            </Row>
            <Row label={t.users.detail.holdersOfCode}>
              {holdersOfCode.length} / {settings.referralMaxGivers}
            </Row>
            <Row label={t.users.detail.codesHeld}>
              {codesHeld.length} / {settings.referralMaxEntries}
            </Row>
            <Row label={t.users.detail.totalEarnedAsHolder}>{formatCurrency(String(earnedAsHolder))}</Row>
            <Row label={t.users.detail.leaderboard}>
              <Link href="/referrals" className="text-(--color-brand-blue-dark) hover:underline">
                {t.users.detail.viewReferrals}
              </Link>
            </Row>
          </dl>
        </Card>

        <Card title={t.users.detail.address}>
          {latestAddress ? (
            <>
              <p className="text-sm text-(--color-text)">{formatAddress(latestAddress)}</p>
              <p className="mt-2 flex flex-wrap gap-x-2 text-xs text-(--color-text-muted)">
                <span className="capitalize">{interpolate(t.subscriptionDetail.addressType, { type: latestAddress.type })}</span>
                <span>·</span>
                <span>
                  {formatFloor(latestAddress.floor)}
                  {latestAddress.floor > 1 && (
                    <>
                      {' '}
                      ({latestAddress.floorType === 'ground_plus_one'
                        ? t.plans.floorGroundPlusOne
                        : t.plans.floorHigherFloors}
                      )
                    </>
                  )}
                </span>
              </p>
            </>
          ) : (
            <p className="text-sm text-(--color-text-muted)">{t.users.detail.noAddress}</p>
          )}
        </Card>
      </div>

      <Section
        title={t.users.detail.subscriptions}
        href="/subscriptions"
        linkLabel={t.users.detail.allSubscriptions}
      >
        {userSubscriptions.length === 0 ? (
          <EmptyState
            title={t.users.detail.noSubscriptions}
            description={t.users.detail.noSubscriptionsHint}
          />
        ) : (
          <DataTable
            columns={[
              {
                header: t.common.plan,
                cell: (s) => (
                  <Link href={`/subscriptions/${s.id}`} className="font-medium text-(--color-text) hover:underline">
                    {s.plan.name}
                  </Link>
                ),
              },
              { header: t.common.frequency, cell: (s) => formatFrequency(s.frequency) },
              { header: t.subscriptions.bottles, cell: (s) => `${s.totalBottles} × ${s.bottleSizeLtr}L` },
              {
                header: t.subscriptionDetail.price,
                cell: (s) =>
                  s.discountTier ? (
                    <span className="whitespace-nowrap">
                      {formatCurrency(s.finalPrice)}{' '}
                      <span className="text-xs text-(--color-text-muted)">
                        ({interpolate(t.subscriptionDetail.tierN, { tier: s.discountTier })} · {s.discountPercent}%)
                      </span>
                    </span>
                  ) : (
                    formatCurrency(s.finalPrice)
                  ),
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
            rows={userSubscriptions}
          />
        )}
      </Section>

      <Section title={t.users.detail.payments} href="/payments" linkLabel={t.users.detail.allPayments}>
        {userPayments.length === 0 ? (
          <EmptyState title={t.users.detail.noPayments} />
        ) : (
          <DataTable
            columns={[
              {
                header: t.payments.purpose,
                cell: (p) => (
                  <Badge tone="blue">
                    {p.purpose === 'subscription' ? t.payments.subscription : t.payments.extraBottles}
                  </Badge>
                ),
              },
              { header: t.common.total, cell: (p) => formatCurrency(p.totalAmount) },
              {
                header: t.payments.walletGateway,
                cell: (p) => (
                  <span className="text-(--color-text-muted)">
                    {formatCurrency(p.walletAmount)} / {formatCurrency(p.gatewayAmount)}
                  </span>
                ),
              },
              { header: t.common.status, cell: (p) => <PaymentStatusBadge status={p.status} /> },
              {
                header: t.common.time,
                cell: (p) => <span className="text-(--color-text-muted)">{formatDateTime(p.createdAt)}</span>,
              },
            ]}
            rows={userPayments}
          />
        )}
      </Section>

      <Section
        title={t.users.detail.extraBottleOrders}
        href="/extra-bottle-orders"
        linkLabel={t.users.detail.allOrders}
      >
        {userOrders.length === 0 ? (
          <EmptyState title={t.users.detail.noOrders} />
        ) : (
          <DataTable
            columns={[
              { header: t.common.quantity, cell: (o) => o.quantity },
              { header: t.extraBottles.unitPrice, cell: (o) => formatCurrency(o.unitPrice) },
              { header: t.common.total, cell: (o) => formatCurrency(o.totalAmount) },
              { header: t.common.status, cell: (o) => <ExtraBottleOrderStatusBadge status={o.status} /> },
              {
                header: t.common.time,
                cell: (o) => <span className="text-(--color-text-muted)">{formatDateTime(o.createdAt)}</span>,
              },
            ]}
            rows={userOrders}
          />
        )}
      </Section>
    </>
  );
}

function Section({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-(--color-brand-blue-dark) hover:underline"
        >
          {linkLabel} →
        </Link>
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-(--color-text-muted)">{label}</dt>
      <dd className="font-medium text-(--color-text)">{children}</dd>
    </div>
  );
}
