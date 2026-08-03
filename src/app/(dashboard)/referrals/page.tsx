import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { UserLink } from '@/components/UserLink';
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
        description={
          <>
            Every user&apos;s referral code, how many people they&apos;ve referred, and how much referral-bonus money
            it&apos;s earned them. Set the referral divisor (and the referral cap it implies) under{' '}
            <Link href="/plans" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              Plans
            </Link>
            .
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Users" value={leaderboard.length} tone="blue" href="/users" />
        <StatCard label="Active referrers" value={activeReferrers} tone="green" />
        <StatCard label="Total referred signups" value={totalReferred} tone="slate" />
        <StatCard label="Total bonus paid" value={formatCurrency(String(totalBonusPaid))} tone="amber" href="/wallet" />
      </div>

      <div className="mt-8">
        {rows.length === 0 ? (
          <EmptyState title="No users yet" />
        ) : (
          <DataTable
            columns={[
              { header: 'User', cell: (r) => <UserLink user={r} /> },
              { header: 'Code', cell: (r) => <span className="font-mono text-xs">{r.referralCode}</span> },
              { header: 'Referred', cell: (r) => r.referredCount },
              { header: 'Wallet balance', cell: (r) => formatCurrency(r.walletBalance) },
              { header: 'Total bonus earned', cell: (r) => formatCurrency(r.totalBonusEarned) },
              {
                header: '',
                align: 'right',
                cell: (r) => (
                  <Link
                    href={`/users/${r.id}`}
                    className="font-medium text-(--color-brand-blue-dark) hover:underline"
                  >
                    View
                  </Link>
                ),
              },
            ]}
            rows={rows}
          />
        )}
      </div>
    </>
  );
}
