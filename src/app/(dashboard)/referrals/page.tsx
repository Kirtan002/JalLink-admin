import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { UserLink } from '@/components/UserLink';
import { formatCurrency } from '@/lib/format';
import { getDictionary } from '@/lib/i18n/server';

export default async function ReferralsPage() {
  const t = await getDictionary();

  let leaderboard;
  try {
    leaderboard = await api.listReferrals();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.referrals.title} />
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
        title={t.referrals.title}
        description={
          <>
            {t.referrals.descriptionBefore}
            <Link href="/plans" className="font-medium text-(--color-brand-blue-dark) hover:underline">
              {t.referrals.descriptionLink}
            </Link>
            {t.referrals.descriptionAfter}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.referrals.users} value={leaderboard.length} tone="blue" href="/users" />
        <StatCard label={t.referrals.activeReferrers} value={activeReferrers} tone="green" />
        <StatCard label={t.referrals.totalReferred} value={totalReferred} tone="slate" />
        <StatCard
          label={t.referrals.totalBonusPaid}
          value={formatCurrency(String(totalBonusPaid))}
          tone="amber"
          href="/wallet"
        />
      </div>

      <div className="mt-8">
        {rows.length === 0 ? (
          <EmptyState title={t.referrals.empty} />
        ) : (
          <DataTable
            columns={[
              { header: t.users.user, cell: (r) => <UserLink user={r} /> },
              { header: t.referrals.code, cell: (r) => <span className="font-mono text-xs">{r.referralCode}</span> },
              { header: t.referrals.referred, cell: (r) => r.referredCount },
              { header: t.referrals.walletBalance, cell: (r) => formatCurrency(r.walletBalance) },
              { header: t.referrals.totalBonusEarned, cell: (r) => formatCurrency(r.totalBonusEarned) },
              {
                header: '',
                align: 'right',
                cell: (r) => (
                  <Link
                    href={`/users/${r.id}`}
                    className="font-medium text-(--color-brand-blue-dark) hover:underline"
                  >
                    {t.common.view}
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
