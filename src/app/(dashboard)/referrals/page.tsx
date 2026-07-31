import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/lib/format';

export default async function ReferralsPage() {
  let leaderboard;
  try {
    leaderboard = await api.listReferrals();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Referrals" />
        <ErrorBanner message={message} />
      </>
    );
  }

  const activeReferrers = leaderboard.filter((r) => r.referredCount > 0).length;
  const totalReferred = leaderboard.reduce((sum, r) => sum + r.referredCount, 0);
  const totalBonusPaid = leaderboard.reduce((sum, r) => sum + Number(r.totalBonusEarned), 0);

  const rows = [...leaderboard].sort((a, b) => b.referredCount - a.referredCount);

  return (
    <>
      <PageHeader
        title="Referrals"
        description="Every user's referral code, how many people they've referred, and how much referral-bonus money it's earned them. Set the referral divisor (and the referral cap it implies) under Plans."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Users" value={leaderboard.length} tone="blue" />
        <StatCard label="Active referrers" value={activeReferrers} tone="green" />
        <StatCard label="Total referred signups" value={totalReferred} tone="slate" />
        <StatCard label="Total bonus paid" value={formatCurrency(String(totalBonusPaid))} tone="amber" />
      </div>

      <div className="mt-8">
        {rows.length === 0 ? (
          <EmptyState title="No users yet" />
        ) : (
          <DataTable
            columns={[
              {
                header: 'User',
                cell: (r) => (
                  <div>
                    <div className="font-medium text-(--color-text)">{r.name ?? r.mobile}</div>
                    <div className="text-xs text-(--color-text-muted)">{r.mobile}</div>
                  </div>
                ),
              },
              { header: 'Code', cell: (r) => <span className="font-mono text-xs">{r.referralCode}</span> },
              { header: 'Referred', cell: (r) => r.referredCount },
              { header: 'Wallet balance', cell: (r) => formatCurrency(r.walletBalance) },
              { header: 'Total bonus earned', cell: (r) => formatCurrency(r.totalBonusEarned) },
            ]}
            rows={rows}
          />
        )}
      </div>
    </>
  );
}
