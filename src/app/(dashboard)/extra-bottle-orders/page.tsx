import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { ExtraBottleOrderStatusBadge } from '@/components/StatusBadge';
import { UserLink } from '@/components/UserLink';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getDictionary } from '@/lib/i18n/server';

export default async function ExtraBottleOrdersPage() {
  const t = await getDictionary();

  let orders;
  try {
    orders = await api.listExtraBottleOrders();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.extraBottles.title} />
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
        title={t.extraBottles.title}
        description={
          <>
            {t.extraBottles.descriptionBefore}
            <Link href="/plans" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              {t.extraBottles.descriptionLink}
            </Link>
            {t.extraBottles.descriptionAfter}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.extraBottles.orders} value={orders.length} tone="blue" />
        <StatCard label={t.extraBottles.paid} value={paid} tone="green" href="/payments" />
        <StatCard label={t.extraBottles.bottlesOrdered} value={totalBottles} tone="slate" />
        <StatCard
          label={t.extraBottles.revenue}
          value={formatCurrency(String(totalRevenue))}
          tone="amber"
          href="/payments"
        />
      </div>

      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState title={t.extraBottles.empty} />
        ) : (
          <DataTable
            columns={[
              { header: t.common.customer, cell: (o) => <UserLink user={o.user} /> },
              { header: t.common.quantity, cell: (o) => o.quantity },
              { header: t.extraBottles.unitPrice, cell: (o) => formatCurrency(o.unitPrice) },
              { header: t.common.total, cell: (o) => formatCurrency(o.totalAmount) },
              { header: t.common.status, cell: (o) => <ExtraBottleOrderStatusBadge status={o.status} /> },
              {
                header: t.common.time,
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
