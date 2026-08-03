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

export default async function UsersPage() {
  // There's no /admin/users endpoint yet — the referral leaderboard is the one call that
  // returns every user, so it doubles as the directory until a dedicated endpoint exists.
  let users, subscriptions;
  try {
    [users, subscriptions] = await Promise.all([api.listReferrals(), api.listSubscriptions()]);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Users" description="Every customer on the platform." />
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
      <PageHeader
        title="Users"
        description="Every customer on the platform. Open a user to see their subscriptions, payments, and extra-bottle orders in one place."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total users" value={users.length} tone="blue" />
        <StatCard label="With a subscription" value={subscriberCount} tone="slate" href="/subscriptions" />
        <StatCard
          label="Currently subscribed"
          value={activeSubscriberCount}
          tone="green"
          href="/subscriptions?status=active"
        />
        <StatCard label="Wallet balances" value={formatCurrency(String(totalWallet))} tone="amber" href="/referrals" />
      </div>

      <div className="mt-8">
        {rows.length === 0 ? (
          <EmptyState title="No users yet" description="Customers appear here as soon as they sign up." />
        ) : (
          <DataTable
            columns={[
              { header: 'User', cell: (u) => <UserLink user={u} /> },
              {
                header: 'Subscriptions',
                cell: (u) => {
                  const counts = subsByUser.get(u.id);
                  if (!counts) return <span className="text-(--color-text-muted)">None</span>;
                  return (
                    <Link href="/subscriptions" className="hover:underline">
                      {counts.total} total
                      {counts.active > 0 && (
                        <span className="ml-2 align-middle">
                          <Badge tone="green">{counts.active} active</Badge>
                        </span>
                      )}
                    </Link>
                  );
                },
              },
              {
                header: 'Referral code',
                cell: (u) => (
                  <Link href="/referrals" className="font-mono text-xs hover:underline">
                    {u.referralCode}
                  </Link>
                ),
              },
              { header: 'Referred', cell: (u) => u.referredCount },
              { header: 'Wallet balance', cell: (u) => formatCurrency(u.walletBalance) },
              {
                header: '',
                align: 'right',
                cell: (u) => (
                  <Link
                    href={`/users/${u.id}`}
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
