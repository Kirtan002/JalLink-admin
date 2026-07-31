import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { PaymentStatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/format';

export default async function PaymentsPage() {
  let payments;
  try {
    payments = await api.listPayments();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Payments" />
        <ErrorBanner message={message} />
      </>
    );
  }

  const paid = payments.filter((p) => p.status === 'paid').length;
  const failed = payments.filter((p) => p.status === 'failed').length;
  const pending = payments.filter((p) => p.status === 'created').length;

  return (
    <>
      <PageHeader title="Payments" description="Every subscription and extra-bottle payment, across all users." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={payments.length} tone="blue" />
        <StatCard label="Paid" value={paid} tone="green" />
        <StatCard label="Awaiting gateway" value={pending} tone="amber" />
        <StatCard label="Failed" value={failed} tone="slate" />
      </div>

      <div className="mt-8">
        {payments.length === 0 ? (
          <EmptyState title="No payments yet" description="They'll show up here as users check out." />
        ) : (
          <DataTable
            columns={[
              {
                header: 'Customer',
                cell: (p) => (
                  <div>
                    <div className="font-medium text-(--color-text)">{p.user.name ?? p.user.mobile}</div>
                    <div className="text-xs text-(--color-text-muted)">{p.user.mobile}</div>
                  </div>
                ),
              },
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
            rows={payments}
          />
        )}
      </div>
    </>
  );
}
