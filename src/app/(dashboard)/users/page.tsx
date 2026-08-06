import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { UserLink } from '@/components/UserLink';
import { formatCurrency } from '@/lib/format';
import { interpolate } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/server';

export default async function UsersPage() {
  const t = await getDictionary();

  // There's no /admin/users endpoint yet — the referral leaderboard is the one call that
  // returns every user, so it doubles as the directory until a dedicated endpoint exists.
  let users, subscriptions;
  try {
    [users, subscriptions] = await Promise.all([api.listReferrals(), api.listSubscriptions()]);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.users.title} description={t.users.shortDescription} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const subsByUser = new Map<string, { total: number; active: number }>();
  for (const s of subscriptions) {
    const entry = subsByUser.get(s.user.id) ?? { total: 0, active: 0 };
    entry.total += 1;
    if (s.status === 'active') entry.active += 1;
    subsByUser.set(s.user.id, entry);
  }

  const subscriberCount = users.filter((u) => (subsByUser.get(u.id)?.total ?? 0) > 0).length;
  const activeSubscriberCount = users.filter((u) => (subsByUser.get(u.id)?.active ?? 0) > 0).length;
  const totalWallet = users.reduce((sum, u) => sum + Number(u.walletBalance), 0);

  const rows = [...users].sort((a, b) => {
    const diff = (subsByUser.get(b.id)?.active ?? 0) - (subsByUser.get(a.id)?.active ?? 0);
    return diff !== 0 ? diff : (a.name ?? a.mobile).localeCompare(b.name ?? b.mobile);
  });

  return (
    <>
      <PageHeader title={t.users.title} description={t.users.description} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t.users.totalUsers} value={users.length} tone="blue" />
        <StatCard label={t.users.withSubscription} value={subscriberCount} tone="slate" href="/subscriptions" />
        <StatCard
          label={t.users.currentlySubscribed}
          value={activeSubscriberCount}
          tone="green"
          href="/subscriptions?status=active"
        />
        <StatCard
          label={t.users.walletBalances}
          value={formatCurrency(String(totalWallet))}
          tone="amber"
          href="/referrals"
        />
      </div>

      <div className="mt-8">
        {rows.length === 0 ? (
          <EmptyState title={t.users.empty} description={t.users.emptyHint} />
        ) : (
          <DataTable
            columns={[
              { header: t.users.user, cell: (u) => <UserLink user={u} /> },
              {
                header: t.nav.items.subscriptions,
                cell: (u) => {
                  const counts = subsByUser.get(u.id);
                  if (!counts) return <span className="text-(--color-text-muted)">{t.common.none}</span>;
                  return (
                    <Link href="/subscriptions" className="hover:underline">
                      {interpolate(t.users.subscriptionsCount, { count: counts.total })}
                      {counts.active > 0 && (
                        <span className="ml-2 align-middle">
                          <Badge tone="green">
                            {interpolate(t.users.activeCount, { count: counts.active })}
                          </Badge>
                        </span>
                      )}
                    </Link>
                  );
                },
              },
              {
                header: t.users.referralCode,
                cell: (u) => (
                  <Link href="/referrals" className="font-mono text-xs hover:underline">
                    {u.referralCode}
                  </Link>
                ),
              },
              { header: t.users.referred, cell: (u) => u.referredCount },
              { header: t.users.walletBalance, cell: (u) => formatCurrency(u.walletBalance) },
              {
                header: '',
                align: 'right',
                cell: (u) => (
                  <Link
                    href={`/users/${u.id}`}
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
