import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { DeliveryStatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/format';
import { MOCK_DELIVERIES } from '@/lib/mockData';

export default function DeliveriesPage() {
  const scheduled = MOCK_DELIVERIES.filter((d) => d.status === 'scheduled').length;
  const delivered = MOCK_DELIVERIES.filter((d) => d.status === 'delivered').length;
  const skipped = MOCK_DELIVERIES.filter((d) => d.status === 'skipped').length;
  const cancelled = MOCK_DELIVERIES.filter((d) => d.status === 'cancelled').length;

  return (
    <>
      <PageHeader title="Deliveries" description="Today's scheduled deliveries and recent delivery history across every subscription." />
      <DemoDataNotice />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Scheduled" value={scheduled} tone="blue" />
        <StatCard label="Delivered" value={delivered} tone="green" />
        <StatCard label="Skipped" value={skipped} tone="amber" />
        <StatCard label="Cancelled" value={cancelled} tone="slate" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: 'Delivery', cell: (d) => <span className="font-medium text-(--color-text)">{d.id}</span> },
            { header: 'Customer', cell: (d) => d.customerName },
            { header: 'Plan', cell: (d) => d.planName },
            {
              header: 'Delivery partner',
              cell: (d) =>
                d.partnerName ?? <span className="text-(--color-text-muted) italic">Unassigned</span>,
            },
            { header: 'Status', cell: (d) => <DeliveryStatusBadge status={d.status} /> },
            {
              header: 'Scheduled',
              cell: (d) => <span className="text-(--color-text-muted)">{formatDate(d.scheduledDate)}</span>,
            },
          ]}
          rows={MOCK_DELIVERIES}
        />
      </div>
    </>
  );
}
