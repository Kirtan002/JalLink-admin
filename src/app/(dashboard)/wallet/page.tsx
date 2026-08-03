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
import type { WalletTxnReason } from '@/lib/types';

const REASON_LABEL: Record<WalletTxnReason, string> = {
  referral_bonus: 'Referral bonus',
  platform_share: 'Platform share (no referrer)',
  wallet_redemption: 'Wallet redemption',
  withdrawal: 'Withdrawal',
};

export default async function WalletPage() {
  let wallet;
  try {
    wallet = await api.getAdminWallet();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Wallet" />
        <ErrorBanner message={message} />
      </>
    );
  }

  const credited = wallet.transactions.filter((t) => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0);
  const debited = wallet.transactions.filter((t) => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <>
      <PageHeader
        title="Wallet"
        description={
          <>
            The platform&apos;s own wallet — receives a share of every{' '}
            <Link href="/payments" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              subscription purchase
            </Link>{' '}
            from a user with no{' '}
            <Link href="/referrals" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              referrer
            </Link>
            . Admin can withdraw; regular users never can.
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Current balance" value={formatCurrency(wallet.balance)} tone="blue" />
        <StatCard label="Total credited" value={formatCurrency(String(credited))} tone="green" href="/payments" />
        <StatCard label="Total withdrawn" value={formatCurrency(String(debited))} tone="slate" />
        <StatCard label="Transactions" value={wallet.transactions.length} tone="amber" />
      </div>

      <Card title="Withdraw" className="mt-8 mb-8">
        <WithdrawForm />
      </Card>

      {wallet.transactions.length === 0 ? (
        <EmptyState title="No wallet activity yet" />
      ) : (
        <DataTable
          columns={[
            {
              header: 'Type',
              cell: (t) => <Badge tone={t.type === 'credit' ? 'green' : 'slate'}>{t.type === 'credit' ? 'Credit' : 'Debit'}</Badge>,
            },
            { header: 'Amount', cell: (t) => formatCurrency(t.amount) },
            { header: 'Reason', cell: (t) => <span className="text-(--color-text-muted)">{REASON_LABEL[t.reason]}</span> },
            { header: 'Note', cell: (t) => <span className="text-(--color-text-muted)">{t.note ?? '—'}</span> },
            { header: 'Balance after', cell: (t) => formatCurrency(t.balanceAfter) },
            {
              header: 'Time',
              cell: (t) => <span className="text-(--color-text-muted)">{formatDateTime(t.createdAt)}</span>,
            },
          ]}
          rows={wallet.transactions}
        />
      )}
    </>
  );
}
