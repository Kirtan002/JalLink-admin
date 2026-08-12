import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { Card } from '@/components/Card';
import { UserLink } from '@/components/UserLink';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getDictionary } from '@/lib/i18n/server';
import { ReferralSettingsForm } from './referral-settings-form';
import { ReferralPayoutsTable } from './referral-payouts-table';

export default async function ReferralsPage() {
  const t = await getDictionary();

  let settings, links, leaderboard, payouts, legacyLeaderboard;
  try {
    [settings, links, leaderboard, payouts, legacyLeaderboard] = await Promise.all([
      api.getSettings(),
      api.listReferralLinks(),
      api.listReferralLinkLeaderboard(),
      api.listReferralPayouts(),
      api.listReferrals(),
    ]);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.referrals.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const totalPayoutVolume = payouts
    .filter((p) => p.status === 'credited')
    .reduce((sum, p) => sum + Number(p.rewardAmount), 0);
  const activeHolders = leaderboard.filter((r) => r.holdersCount > 0).length;

  // Legacy aggregates — unchanged from the old page.
  const legacyActiveReferrers = legacyLeaderboard.filter((r) => r.referredCount > 0).length;
  const legacyTotalReferred = legacyLeaderboard.reduce((sum, r) => sum + r.referredCount, 0);
  const legacyTotalBonusPaid = legacyLeaderboard.reduce((sum, r) => sum + Number(r.totalBonusEarned), 0);
  const legacyRows = [...legacyLeaderboard].sort((a, b) => b.referredCount - a.referredCount);

  return (
    <>
      <PageHeader title={t.referrals.title} description={t.referrals.description} />

      <Card title={t.referrals.settingsTitle} className="mb-8">
        <p className="mb-4 text-sm text-(--color-text-muted)">{t.referrals.settingsHint}</p>
        <ReferralSettingsForm settings={settings} />
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.referrals.programUsers} value={leaderboard.length} tone="blue" href="/users" />
        <StatCard label={t.referrals.activeHolders} value={activeHolders} tone="green" />
        <StatCard label={t.referrals.totalLinks} value={links.length} tone="slate" />
        <StatCard
          label={t.referrals.totalPayoutVolume}
          value={formatCurrency(String(totalPayoutVolume))}
          tone="amber"
          href="/wallet"
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">{t.referrals.linksTitle}</h2>
        {links.length === 0 ? (
          <EmptyState title={t.referrals.linksEmpty} />
        ) : (
          <DataTable
            columns={[
              { header: t.referrals.holder, cell: (l) => <UserLink user={l.holder} /> },
              { header: t.referrals.owner, cell: (l) => <UserLink user={l.owner} /> },
              { header: t.referrals.code, cell: (l) => <span className="font-mono text-xs">{l.referralCode}</span> },
              { header: t.common.added, cell: (l) => <span className="text-(--color-text-muted)">{formatDateTime(l.createdAt)}</span> },
            ]}
            rows={links}
          />
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">{t.referrals.payoutsTitle}</h2>
        <ReferralPayoutsTable payouts={payouts} />
      </div>

      <div className="mt-12 border-t border-(--color-border) pt-8">
        <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{t.referrals.legacyTitle}</h2>
        <p className="mb-4 text-sm text-(--color-text-muted)">{t.referrals.legacyDescription}</p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label={t.referrals.users} value={legacyLeaderboard.length} tone="blue" href="/users" />
          <StatCard label={t.referrals.activeReferrers} value={legacyActiveReferrers} tone="green" />
          <StatCard label={t.referrals.totalReferred} value={legacyTotalReferred} tone="slate" />
          <StatCard
            label={t.referrals.totalBonusPaid}
            value={formatCurrency(String(legacyTotalBonusPaid))}
            tone="amber"
            href="/wallet"
          />
        </div>

        <div className="mt-6">
          {legacyRows.length === 0 ? (
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
              rows={legacyRows}
            />
          )}
        </div>
      </div>
    </>
  );
}
