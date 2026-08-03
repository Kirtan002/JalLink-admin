import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { DataTable } from '@/components/DataTable';
import { formatDateTime } from '@/lib/format';

function formatAction(action: string): string {
  return action
    .split(/[._]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Where an audit-log target points, for the target types that have a screen. */
function targetHref(targetType: string, targetId: string | null): string | null {
  switch (targetType.toLowerCase()) {
    case 'subscription':
      return targetId ? `/subscriptions/${targetId}` : '/subscriptions';
    case 'user':
      return targetId ? `/users/${targetId}` : '/users';
    case 'plan':
      return '/plans';
    case 'settings':
    case 'platform_settings':
      return '/plans';
    case 'wallet':
      return '/wallet';
    case 'delivery_partner':
    case 'deliverypartner':
      return '/delivery-partners';
    default:
      return null;
  }
}

export default async function ActivityLogPage() {
  let logs;
  try {
    logs = await api.listAuditLogs();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Activity Log" />
        <ErrorBanner message={message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Activity Log"
        description="History of admin-panel mutations — plan/settings/wallet changes and who made them. The 'actor' is this panel's single shared login, not per-admin auth, so it names the account, not necessarily the individual."
      />

      {logs.length === 0 ? (
        <EmptyState title="No activity yet" description="Admin actions will show up here as they happen." />
      ) : (
        <DataTable
          columns={[
            {
              header: 'Time',
              cell: (l) => <span className="whitespace-nowrap text-(--color-text-muted)">{formatDateTime(l.createdAt)}</span>,
            },
            { header: 'Actor', cell: (l) => <span className="font-medium text-(--color-text)">{l.actor}</span> },
            { header: 'Action', cell: (l) => formatAction(l.action) },
            {
              header: 'Target',
              cell: (l) => {
                if (!l.targetType) return <span className="text-(--color-text-muted)">—</span>;
                const label = `${l.targetType}${l.targetId ? ` · ${l.targetId.slice(0, 8)}` : ''}`;
                const href = targetHref(l.targetType, l.targetId);
                return href ? (
                  <Link href={href} className="text-(--color-brand-blue-dark) hover:underline">
                    {label}
                  </Link>
                ) : (
                  <span className="text-(--color-text-muted)">{label}</span>
                );
              },
            },
            {
              header: 'Details',
              cell: (l) =>
                l.details ? (
                  <code className="text-xs break-all text-(--color-text-muted)">{JSON.stringify(l.details)}</code>
                ) : (
                  <span className="text-(--color-text-muted)">—</span>
                ),
            },
          ]}
          rows={logs}
        />
      )}
    </>
  );
}
