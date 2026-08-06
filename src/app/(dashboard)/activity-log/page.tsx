import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { DataTable } from '@/components/DataTable';
import { formatDateTime } from '@/lib/format';
import { getDictionary } from '@/lib/i18n/server';

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
      return targetId ? `/delivery-partners/${targetId}` : '/delivery-partners';
    default:
      return null;
  }
}

export default async function ActivityLogPage() {
  const t = await getDictionary();

  let logs;
  try {
    logs = await api.listAuditLogs();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.activityLog.title} />
        <ErrorBanner message={message} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t.activityLog.title} description={t.activityLog.description} />

      {logs.length === 0 ? (
        <EmptyState title={t.activityLog.empty} description={t.activityLog.emptyHint} />
      ) : (
        <DataTable
          columns={[
            {
              header: t.common.time,
              cell: (l) => <span className="whitespace-nowrap text-(--color-text-muted)">{formatDateTime(l.createdAt)}</span>,
            },
            { header: t.activityLog.actor, cell: (l) => <span className="font-medium text-(--color-text)">{l.actor}</span> },
            { header: t.activityLog.action, cell: (l) => formatAction(l.action) },
            {
              header: t.activityLog.target,
              cell: (l) => {
                if (!l.targetType) return <span className="text-(--color-text-muted)">{t.common.dash}</span>;
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
              header: t.activityLog.details,
              cell: (l) =>
                l.details ? (
                  <code className="text-xs break-all text-(--color-text-muted)">{JSON.stringify(l.details)}</code>
                ) : (
                  <span className="text-(--color-text-muted)">{t.common.dash}</span>
                ),
            },
          ]}
          rows={logs}
        />
      )}
    </>
  );
}
