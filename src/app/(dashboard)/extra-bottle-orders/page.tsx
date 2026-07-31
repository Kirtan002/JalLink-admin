import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { ExtraBottleOrderStatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/format';

export default async function ExtraBottleOrdersPage() {
  let orders;
  try {
    orders = await api.listExtraBottleOrders();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Extra Bottle Orders" />
        <ErrorBanner message={message} />
      </>
    );
  }

  const paid = orders.filter((o) => o.status === 'paid').length;
  const totalBottles = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <>
      <PageHeader
        title="Extra Bottle Orders"
        description="One-off bottle orders placed by users with an active subscription — priced at the flat rate set under Plans."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Orders" value={orders.length} tone="blue" />
        <StatCard label="Paid" value={paid} tone="green" />
        <StatCard label="Bottles ordered" value={totalBottles} tone="slate" />
        <StatCard label="Revenue" value={formatCurrency(String(totalRevenue))} tone="amber" />
      </div>

      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState title="No extra-bottle orders yet" />
        ) : (
          <DataTable
            columns={[
              {
                header: 'Customer',
                cell: (o) => (
                  <div>
                    <div className="font-medium text-(--color-text)">{o.user.name ?? o.user.mobile}</div>
                    <div className="text-xs text-(--color-text-muted)">{o.user.mobile}</div>
                  </div>
                ),
              },
              { header: 'Quantity', cell: (o) => o.quantity },
              { header: 'Unit price', cell: (o) => formatCurrency(o.unitPrice) },
              { header: 'Total', cell: (o) => formatCurrency(o.totalAmount) },
              { header: 'Status', cell: (o) => <ExtraBottleOrderStatusBadge status={o.status} /> },
              {
                header: 'Time',
                cell: (o) => <span className="text-(--color-text-muted)">{formatDateTime(o.createdAt)}</span>,
              },
            ]}
            rows={orders}
          />
        )}
      </div>
    </>
  );
}
