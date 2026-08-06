import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { WithdrawForm } from './withdraw-form';
import { getDictionary } from '@/lib/i18n/server';

export default async function WalletPage() {
  const t = await getDictionary();

  let wallet;
  try {
    wallet = await api.getAdminWallet();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.wallet.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const credited = wallet.transactions.filter((t) => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0);
  const debited = wallet.transactions.filter((t) => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <>
      <PageHeader
        title={t.wallet.title}
        description={
          <>
            {t.wallet.descriptionBefore}
            <Link href="/payments" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              {t.wallet.descriptionPurchase}
            </Link>
            {t.wallet.descriptionMiddle}
            <Link href="/referrals" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              {t.wallet.descriptionReferrer}
            </Link>
            {t.wallet.descriptionAfter}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.wallet.currentBalance} value={formatCurrency(wallet.balance)} tone="blue" />
        <StatCard
          label={t.wallet.totalCredited}
          value={formatCurrency(String(credited))}
          tone="green"
          href="/payments"
        />
        <StatCard label={t.wallet.totalWithdrawn} value={formatCurrency(String(debited))} tone="slate" />
        <StatCard label={t.wallet.transactions} value={wallet.transactions.length} tone="amber" />
      </div>

      <Card title={t.wallet.withdraw} className="mt-8 mb-8">
        <WithdrawForm />
      </Card>

      {wallet.transactions.length === 0 ? (
        <EmptyState title={t.wallet.empty} />
      ) : (
        <DataTable
          columns={[
            {
              header: t.wallet.type,
              cell: (txn) => (
                <Badge tone={txn.type === 'credit' ? 'green' : 'slate'}>
                  {txn.type === 'credit' ? t.wallet.credit : t.wallet.debit}
                </Badge>
              ),
            },
            { header: t.common.amount, cell: (txn) => formatCurrency(txn.amount) },
            {
              header: t.common.reason,
              cell: (txn) => (
                <span className="text-(--color-text-muted)">{t.wallet.reasons[txn.reason]}</span>
              ),
            },
            {
              header: t.common.note,
              cell: (txn) => <span className="text-(--color-text-muted)">{txn.note ?? t.common.dash}</span>,
            },
            { header: t.wallet.balanceAfter, cell: (txn) => formatCurrency(txn.balanceAfter) },
            {
              header: t.common.time,
              cell: (txn) => (
                <span className="text-(--color-text-muted)">{formatDateTime(txn.createdAt)}</span>
              ),
            },
          ]}
          rows={wallet.transactions}
        />
      )}
    </>
  );
}
