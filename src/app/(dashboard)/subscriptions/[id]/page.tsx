import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { SubscriptionStatusBadge, DeliveryStatusBadge } from '@/components/StatusBadge';
import { formatAddress, formatCurrency, formatDate, formatFrequency } from '@/lib/format';
import { AssignPartnerForm } from './assign-partner-form';

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Subscription" />
        <ErrorBanner message={message} />
      </>
    );
  }

  const deliveredCount = deliveries.filter((d) => d.status === 'delivered').length;

  return (
    <>
      <Link href="/subscriptions" className="mb-4 inline-block text-sm text-(--color-brand-blue-dark) hover:underline">
        ← All subscriptions
      </Link>

      <PageHeader
        title={subscription.user.name ?? 'Unnamed customer'}
        description={subscription.user.mobile}
        action={<SubscriptionStatusBadge status={subscription.status} />}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Plan & billing">
          <dl className="flex flex-col gap-3 text-sm">
            <Row label="Plan">{subscription.plan.name}</Row>
            <Row label="Price">{formatCurrency(subscription.plan.price)}</Row>
            <Row label="Frequency">{formatFrequency(subscription.frequency)}</Row>
            <Row label="Bottles">
              {subscription.totalBottles} × {subscription.bottleSizeLtr}L
            </Row>
            <Row label="Schedule">
              {formatDate(subscription.startDate)} → {formatDate(subscription.endDate)}
            </Row>
            <Row label="Progress">
              {deliveredCount} / {deliveries.length} delivered
            </Row>
          </dl>
        </Card>

        <Card title="Delivery address">
          <p className="text-sm text-(--color-text)">{formatAddress(subscription.address)}</p>
          <p className="mt-2 text-xs text-(--color-text-muted) capitalize">{subscription.address.type} address</p>
        </Card>

        <Card title="Delivery partner">
          <AssignPartnerForm
            subscriptionId={subscription.id}
            partners={partners}
            currentPartnerId={subscription.deliveryPartner?.id ?? null}
          />
        </Card>

        <Card title="Timeline">
          <dl className="flex flex-col gap-3 text-sm">
            <Row label="Created">{formatDate(subscription.createdAt)}</Row>
            {subscription.cancelledAt && <Row label="Cancelled">{formatDate(subscription.cancelledAt)}</Row>}
          </dl>
        </Card>
      </div>

      <div className="mt-6">
        <Card title={`Delivery calendar (${deliveries.length})`}>
          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-(--color-border)">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-(--color-surface-muted)">
                <tr className="text-left text-xs tracking-wide text-(--color-text-muted) uppercase">
                  <th className="px-4 py-2 font-medium">#</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Status</th>
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
