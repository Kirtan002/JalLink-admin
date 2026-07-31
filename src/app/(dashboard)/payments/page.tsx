import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { PaymentStatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { MOCK_PAYMENTS } from '@/lib/mockData';

export default function PaymentsPage() {
  const successful = MOCK_PAYMENTS.filter((p) => p.status === 'success').length;
  const failed = MOCK_PAYMENTS.filter((p) => p.status === 'failed').length;
  const refunds = MOCK_PAYMENTS.filter((p) => p.status === 'refunded').length;

  return (
    <>
      <PageHeader title="Payments" description="Customer subscription payments, renewals, and refunds." />
      <DemoDataNotice />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Transactions" value={MOCK_PAYMENTS.length} tone="blue" />
        <StatCard label="Successful" value={successful} tone="green" />
        <StatCard label="Failed" value={failed} tone="amber" />
        <StatCard label="Refunds" value={refunds} tone="slate" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: 'Transaction', cell: (t) => <span className="font-medium text-(--color-text)">{t.id}</span> },
            { header: 'Customer', cell: (t) => t.customerName },
            { header: 'Type', cell: (t) => t.type },
            { header: 'Amount', cell: (t) => formatCurrency(String(t.amount)) },
            { header: 'Status', cell: (t) => <PaymentStatusBadge status={t.status} /> },
            {
              header: 'Time',
              cell: (t) => <span className="text-(--color-text-muted)">{formatDateTime(t.occurredAt)}</span>,
            },
          ]}
          rows={MOCK_PAYMENTS}
        />
      </div>
    </>
  );
}
