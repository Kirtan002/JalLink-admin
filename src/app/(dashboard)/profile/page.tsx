import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getDictionary } from '@/lib/i18n/server';

/**
 * The only screen a 'manager' account has (see components/Sidebar.tsx and proxy.ts) — their
 * own identity plus their own wallet (ownerType='admin', ownerId=admins.id on the backend,
 * distinct from the platform's single revenue wallet at /wallet). An 'admin' sees this too;
 * nothing here differs by role except what the sidebar links to next.
 */
export default async function ProfilePage() {
  const t = await getDictionary();

  let profile;
  let wallet;
  try {
    [profile, wallet] = await Promise.all([api.getMyAdminProfile(), api.getMyAdminWallet()]);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.profile.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t.profile.title} description={t.profile.description} />

      <Card title={t.profile.accountDetails} className="mb-8">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs tracking-wide text-(--color-text-muted) uppercase">{t.common.name}</dt>
            <dd className="mt-1 text-sm font-medium">{profile.name}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-(--color-text-muted) uppercase">{t.login.username}</dt>
            <dd className="mt-1 text-sm font-medium">{profile.username}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-(--color-text-muted) uppercase">{t.profile.role}</dt>
            <dd className="mt-1">
              <Badge tone={profile.role === 'admin' ? 'blue' : 'amber'}>
                {profile.role === 'admin' ? t.profile.roleAdmin : t.profile.roleManager}
              </Badge>
            </dd>
          </div>
        </dl>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label={t.wallet.currentBalance} value={formatCurrency(wallet.balance)} tone="blue" />
        <StatCard label={t.wallet.transactions} value={wallet.transactions.length} tone="amber" />
      </div>

      <div className="mt-8">
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
      </div>
    </>
  );
}
