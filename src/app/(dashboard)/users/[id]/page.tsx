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
import { userDisplayName } from '@/components/UserLink';
import { formatAddress, formatCurrency, formatDate, formatDateTime, formatFrequency } from '@/lib/format';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Assembled from the list endpoints — there's no /admin/users/:id on the backend yet.
  let referrals, subscriptions, payments, orders;
  try {
    [referrals, subscriptions, payments, orders] = await Promise.all([
      api.listReferrals(),
      api.listSubscriptions(),
      api.listPayments(),
      api.listExtraBottleOrders(),
    ]);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="User" />
        <ErrorBanner message={message} />
      </>
    );
  }

  const referral = referrals.find((r) => r.id === id) ?? null;
  const userSubscriptions = subscriptions.filter((s) => s.user.id === id);
  const userPayments = payments.filter((p) => p.user.id === id);
  const userOrders = orders.filter((o) => o.user.id === id);

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
        ← All users
      </Link>

      <PageHeader
        title={userDisplayName(identity)}
        description={identity.mobile}
        action={
          activeSubscriptions.length > 0 ? (
            <Badge tone="green">Active subscriber</Badge>
          ) : (
            <Badge tone="slate">No active subscription</Badge>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Subscriptions" value={userSubscriptions.length} tone="blue" href="/subscriptions" />
        <StatCard label="Total paid" value={formatCurrency(String(paidTotal))} tone="green" href="/payments" />
        <StatCard label="Extra-bottle orders" value={userOrders.length} tone="slate" href="/extra-bottle-orders" />
        <StatCard
          label="Wallet balance"
          value={formatCurrency(referral?.walletBalance ?? '0')}
          tone="amber"
          href="/referrals"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Referrals">
          {referral ? (
            <dl className="flex flex-col gap-3 text-sm">
              <Row label="Referral code">
                <span className="font-mono text-xs">{referral.referralCode}</span>
              </Row>
              <Row label="People referred">{referral.referredCount}</Row>
              <Row label="Bonus earned">{formatCurrency(referral.totalBonusEarned)}</Row>
              <Row label="Leaderboard">
                <Link href="/referrals" className="text-(--color-brand-blue-dark) hover:underline">
                  View referrals →
                </Link>
              </Row>
            </dl>
          ) : (
            <p className="text-sm text-(--color-text-muted)">No referral record for this user.</p>
          )}
        </Card>

        <Card title="Delivery address">
          {latestAddress ? (
            <>
              <p className="text-sm text-(--color-text)">{formatAddress(latestAddress)}</p>
              <p className="mt-2 text-xs text-(--color-text-muted) capitalize">{latestAddress.type} address</p>
            </>
          ) : (
            <p className="text-sm text-(--color-text-muted)">No address on file — this user has never subscribed.</p>
          )}
        </Card>
      </div>

      <Section title="Subscriptions" href="/subscriptions" linkLabel="All subscriptions">
        {userSubscriptions.length === 0 ? (
          <EmptyState title="No subscriptions" description="This user hasn't purchased a plan yet." />
        ) : (
          <DataTable
            columns={[
              {
                header: 'Plan',
                cell: (s) => (
                  <Link href={`/subscriptions/${s.id}`} className="font-medium text-(--color-text) hover:underline">
                    {s.plan.name}
                  </Link>
                ),
              },
              { header: 'Frequency', cell: (s) => formatFrequency(s.frequency) },
              { header: 'Bottles', cell: (s) => `${s.totalBottles} × ${s.bottleSizeLtr}L` },
              {
                header: 'Schedule',
                cell: (s) => (
                  <span className="whitespace-nowrap text-(--color-text-muted)">
                    {formatDate(s.startDate)} → {formatDate(s.endDate)}
                  </span>
                ),
              },
              { header: 'Status', cell: (s) => <SubscriptionStatusBadge status={s.status} /> },
              {
                header: 'Delivery partner',
                cell: (s) =>
                  s.deliveryPartner ? (
                    <Link href="/delivery-partners" className="hover:underline">
                      {s.deliveryPartner.name}
                    </Link>
                  ) : (
                    <Badge tone="amber">Unassigned</Badge>
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
                    View
                  </Link>
                ),
              },
            ]}
            rows={userSubscriptions}
          />
        )}
      </Section>

      <Section title="Payments" href="/payments" linkLabel="All payments">
        {userPayments.length === 0 ? (
          <EmptyState title="No payments" />
        ) : (
          <DataTable
            columns={[
              {
                header: 'Purpose',
                cell: (p) => (
                  <Badge tone="blue">{p.purpose === 'subscription' ? 'Subscription' : 'Extra bottles'}</Badge>
                ),
              },
              { header: 'Total', cell: (p) => formatCurrency(p.totalAmount) },
              {
                header: 'Wallet / Gateway',
                cell: (p) => (
                  <span className="text-(--color-text-muted)">
                    {formatCurrency(p.walletAmount)} / {formatCurrency(p.gatewayAmount)}
                  </span>
                ),
              },
              { header: 'Status', cell: (p) => <PaymentStatusBadge status={p.status} /> },
              {
                header: 'Time',
                cell: (p) => <span className="text-(--color-text-muted)">{formatDateTime(p.createdAt)}</span>,
              },
            ]}
            rows={userPayments}
          />
        )}
      </Section>

      <Section title="Extra-bottle orders" href="/extra-bottle-orders" linkLabel="All orders">
        {userOrders.length === 0 ? (
          <EmptyState title="No extra-bottle orders" />
        ) : (
          <DataTable
            columns={[
              { header: 'Quantity', cell: (o) => o.quantity },
              { header: 'Unit price', cell: (o) => formatCurrency(o.unitPrice) },
              { header: 'Total', cell: (o) => formatCurrency(o.totalAmount) },
              { header: 'Status', cell: (o) => <ExtraBottleOrderStatusBadge status={o.status} /> },
              {
                header: 'Time',
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
        <Link href={href} className="text-sm font-medium text-(--color-brand-blue-dark) hover:underline">
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
