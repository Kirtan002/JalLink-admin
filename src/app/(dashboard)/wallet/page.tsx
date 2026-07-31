import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { MOCK_WALLET_ENTRIES } from '@/lib/mockData';

export default function WalletPage() {
  const totalBalance = MOCK_WALLET_ENTRIES.reduce(
    (max, e) => Math.max(max, e.balanceAfter),
    0,
  );
  const payoutsDue = MOCK_WALLET_ENTRIES.filter((e) => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
  const paidOut = MOCK_WALLET_ENTRIES.filter((e) => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <PageHeader title="Wallet" description="Delivery partner payout ledger — credits and debits against each partner's balance." />
      <DemoDataNotice />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Highest partner balance" value={formatCurrency(String(totalBalance))} tone="blue" />
        <StatCard label="Payouts accrued" value={formatCurrency(String(payoutsDue))} tone="green" />
        <StatCard label="Paid out this week" value={formatCurrency(String(paidOut))} tone="slate" />
        <StatCard label="Failed payouts" value={0} tone="amber" />
      </div>

      <div className="mt-8">
        <DataTable
          columns={[
            { header: 'Partner', cell: (e) => <span className="font-medium text-(--color-text)">{e.partnerName}</span> },
            {
              header: 'Type',
              cell: (e) => <Badge tone={e.type === 'credit' ? 'green' : 'slate'}>{e.type === 'credit' ? 'Credit' : 'Debit'}</Badge>,
            },
            { header: 'Amount', cell: (e) => formatCurrency(String(e.amount)) },
            { header: 'Reason', cell: (e) => <span className="text-(--color-text-muted)">{e.reason}</span> },
            { header: 'Balance after', cell: (e) => formatCurrency(String(e.balanceAfter)) },
            {
              header: 'Time',
              cell: (e) => <span className="text-(--color-text-muted)">{formatDateTime(e.occurredAt)}</span>,
            },
          ]}
          rows={MOCK_WALLET_ENTRIES}
        />
      </div>
    </>
  );
}
