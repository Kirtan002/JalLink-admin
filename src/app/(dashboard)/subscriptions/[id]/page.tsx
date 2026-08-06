import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { SubscriptionStatusBadge, DeliveryStatusBadge } from '@/components/StatusBadge';
import { formatAddress, formatCurrency, formatDate, formatFrequency } from '@/lib/format';
import { interpolate } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/server';
import { AssignPartnerForm } from './assign-partner-form';

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDictionary();

  let subscription, deliveries, partners;
  try {
    [subscription, deliveries, partners] = await Promise.all([
      api.getSubscription(id),
      api.listSubscriptionDeliveries(id),
      api.listDeliveryPartners(),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.subscriptionDetail.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const deliveredCount = deliveries.filter((d) => d.status === 'delivered').length;

  return (
    <>
      <Link href="/subscriptions" className="mb-4 inline-block text-sm text-(--color-brand-blue-dark) hover:underline">
        {t.subscriptionDetail.back}
      </Link>

      <PageHeader
        title={subscription.user.name ?? t.common.unnamedCustomer}
        description={
          <>
            {subscription.user.mobile} ·{' '}
            <Link
              href={`/users/${subscription.user.id}`}
              className="font-medium text-(--color-brand-blue-dark) hover:underline"
            >
              {t.subscriptionDetail.viewUserProfile}
            </Link>
          </>
        }
        action={<SubscriptionStatusBadge status={subscription.status} />}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title={t.subscriptionDetail.planBilling}>
          <dl className="flex flex-col gap-3 text-sm">
            <Row label={t.common.plan}>
              <Link href="/plans" className="hover:underline">
                {subscription.plan.name}
              </Link>
            </Row>
            <Row label={t.subscriptionDetail.price}>{formatCurrency(subscription.plan.price)}</Row>
            <Row label={t.common.frequency}>{formatFrequency(subscription.frequency)}</Row>
            <Row label={t.subscriptions.bottles}>
              {subscription.totalBottles} × {subscription.bottleSizeLtr}L
            </Row>
            <Row label={t.subscriptions.schedule}>
              {formatDate(subscription.startDate)} → {formatDate(subscription.endDate)}
            </Row>
            <Row label={t.subscriptionDetail.progress}>
              {interpolate(t.subscriptionDetail.deliveredOf, {
                done: deliveredCount,
                total: deliveries.length,
              })}
            </Row>
          </dl>
        </Card>

        <Card title={t.subscriptionDetail.address}>
          <p className="text-sm text-(--color-text)">{formatAddress(subscription.address)}</p>
          <p className="mt-2 text-xs text-(--color-text-muted) capitalize">
            {interpolate(t.subscriptionDetail.addressType, { type: subscription.address.type })}
          </p>
        </Card>

        <Card title={t.subscriptionDetail.deliveryPartner}>
          <AssignPartnerForm
            subscriptionId={subscription.id}
            partners={partners}
            currentPartnerId={subscription.deliveryPartner?.id ?? null}
          />
          <Link
            href="/delivery-partners"
            className="mt-4 inline-block text-sm font-medium text-(--color-brand-blue-dark) hover:underline"
          >
            {t.subscriptionDetail.managePartners}
          </Link>
        </Card>

        <Card title={t.subscriptionDetail.timeline}>
          <dl className="flex flex-col gap-3 text-sm">
            <Row label={t.common.created}>{formatDate(subscription.createdAt)}</Row>
            {subscription.pausedAt && (
              <Row label={t.subscriptionDetail.paused}>{formatDate(subscription.pausedAt)}</Row>
            )}
            {subscription.cancelledAt && (
              <Row label={t.subscriptionDetail.cancelled}>{formatDate(subscription.cancelledAt)}</Row>
            )}
          </dl>
        </Card>
      </div>

      <div className="mt-6">
        <Card title={interpolate(t.subscriptionDetail.deliveryCalendar, { count: deliveries.length })}>
          <Link
            href="/deliveries"
            className="mb-3 inline-block text-sm font-medium text-(--color-brand-blue-dark) hover:underline"
          >
            {t.subscriptionDetail.allDeliveries}
          </Link>
          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-(--color-border)">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-(--color-surface-muted)">
                <tr className="text-left text-xs tracking-wide text-(--color-text-muted) uppercase">
                  <th className="px-4 py-2 font-medium">{t.subscriptionDetail.sequence}</th>
                  <th className="px-4 py-2 font-medium">{t.subscriptionDetail.date}</th>
                  <th className="px-4 py-2 font-medium">{t.common.status}</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-t border-(--color-border)">
                    <td className="px-4 py-2 text-(--color-text-muted)">{d.sequenceNumber}</td>
                    <td className="px-4 py-2">{formatDate(d.scheduledDate)}</td>
                    <td className="px-4 py-2">
                      <DeliveryStatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
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
