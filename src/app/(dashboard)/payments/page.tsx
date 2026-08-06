import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { PaymentStatusBadge } from '@/components/StatusBadge';
import { UserLink } from '@/components/UserLink';
import { PaymentModeBanner } from '@/components/PaymentModeBanner';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getDictionary } from '@/lib/i18n/server';

export default async function PaymentsPage() {
  const t = await getDictionary();

  let payments;
  try {
    payments = await api.listPayments();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.payments.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const paid = payments.filter((p) => p.status === 'paid').length;
  const failed = payments.filter((p) => p.status === 'failed').length;
  const pending = payments.filter((p) => p.status === 'created').length;

  return (
    <>
      <PageHeader title={t.payments.title} description={t.payments.description} />
      <PaymentModeBanner />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.payments.total} value={payments.length} tone="blue" />
        <StatCard label={t.payments.paid} value={paid} tone="green" />
        <StatCard label={t.payments.awaitingGateway} value={pending} tone="amber" />
        <StatCard label={t.payments.failed} value={failed} tone="slate" />
      </div>

      <div className="mt-8">
        {payments.length === 0 ? (
          <EmptyState title={t.payments.empty} description={t.payments.emptyHint} />
        ) : (
          <DataTable
            columns={[
              { header: t.common.customer, cell: (p) => <UserLink user={p.user} /> },
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
            rows={payments}
          />
        )}
      </div>
    </>
  );
}
