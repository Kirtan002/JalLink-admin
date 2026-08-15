'use client';

import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/format';
import { useTranslations } from '@/lib/i18n/client';
import type { AdminProfile } from '@/lib/types';
import { ManagerStatusToggle } from './status-toggle';

export function ManagersTable({
  admins,
  currentAdminId,
}: {
  admins: AdminProfile[];
  currentAdminId: string;
}) {
  const t = useTranslations();

  if (admins.length === 0) {
    return <EmptyState title={t.managers.empty} description={t.managers.emptyHint} />;
  }

  return (
    <DataTable
      columns={[
        {
          header: t.common.name,
          cell: (a) => (
            <div>
              <div className="font-medium text-(--color-text)">
                {a.name}{' '}
                {a.id === currentAdminId && (
                  <span className="text-xs text-(--color-text-muted)">({t.managers.you})</span>
                )}
              </div>
              <div className="text-xs text-(--color-text-muted)">{a.username}</div>
            </div>
          ),
        },
        {
          header: t.managers.role,
          cell: (a) => (
            <Badge tone={a.role === 'admin' ? 'blue' : 'amber'}>
              {a.role === 'admin' ? t.managers.roleAdmin : t.managers.roleManager}
            </Badge>
          ),
        },
        {
          header: t.managers.status,
          cell: (a) => (
            <Badge tone={a.isActive ? 'green' : 'slate'}>
              {a.isActive ? t.managers.active : t.managers.inactive}
            </Badge>
          ),
        },
        {
          header: t.common.created,
          cell: (a) => <span className="text-(--color-text-muted)">{formatDate(a.createdAt)}</span>,
        },
        {
          header: '',
          align: 'right',
          cell: (a) =>
            a.id === currentAdminId ? (
              <span className="text-(--color-text-muted)">{t.common.dash}</span>
            ) : (
              <ManagerStatusToggle id={a.id} isActive={a.isActive} />
            ),
        },
      ]}
      rows={admins}
    />
  );
}
