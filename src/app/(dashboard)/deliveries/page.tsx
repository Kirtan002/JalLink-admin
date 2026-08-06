import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { DeliveryStatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/format';
import { MOCK_DELIVERIES } from '@/lib/mockData';
import { getDictionary } from '@/lib/i18n/server';

export default async function DeliveriesPage() {
  const t = await getDictionary();

  const scheduled = MOCK_DELIVERIES.filter((d) => d.status === 'scheduled').length;
  const delivered = MOCK_DELIVERIES.filter((d) => d.status === 'delivered').length;
  const skipped = MOCK_DELIVERIES.filter((d) => d.status === 'skipped').length;
  const cancelled = MOCK_DELIVERIES.filter((d) => d.status === 'cancelled').length;

  return (
    <>
      <PageHeader title={t.deliveries.title} description={t.deliveries.description} />
      <DemoDataNotice message={t.common.demoNotice} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.deliveries.scheduled} value={scheduled} tone="blue" href="/subscriptions?status=active" />
        <StatCard
          label={t.deliveries.delivered}
          value={delivered}
          tone="green"
          href="/subscriptions?status=completed"
        />
        <StatCard label={t.deliveries.skipped} value={skipped} tone="amber" />
        <StatCard
          label={t.deliveries.cancelled}
          value={cancelled}
          tone="slate"
          href="/subscriptions?status=cancelled"
        />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: t.deliveries.delivery, cell: (d) => <span className="font-medium text-(--color-text)">{d.id}</span> },
            {
              header: t.common.customer,
              cell: (d) => (
                <Link href="/users" className="hover:underline">
                  {d.customerName}
                </Link>
              ),
            },
            {
              header: t.common.plan,
              cell: (d) => (
                <Link href="/plans" className="hover:underline">
                  {d.planName}
                </Link>
              ),
            },
            {
              header: t.deliveries.deliveryPartner,
              cell: (d) =>
                d.partnerName ? (
                  <Link href="/delivery-partners" className="hover:underline">
                    {d.partnerName}
                  </Link>
                ) : (
                  <span className="text-(--color-text-muted) italic">{t.common.unassigned}</span>
                ),
            },
            { header: t.common.status, cell: (d) => <DeliveryStatusBadge status={d.status} /> },
            {
              header: t.deliveries.scheduled,
              cell: (d) => <span className="text-(--color-text-muted)">{formatDate(d.scheduledDate)}</span>,
            },
          ]}
          rows={MOCK_DELIVERIES}
        />
      </div>
    </>
  );
}
