'use client';

import { useMemo, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { DemoDataNotice } from '@/components/DemoDataNotice';
import { EmptyState } from '@/components/EmptyState';
import { PartnerKycStatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/format';
import type { DeliveryPartner, DeliveryPartnerKycStatus } from '@/lib/types';

const FILTERS: { label: string; value: DeliveryPartnerKycStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' },
];

export function PartnersTable({ partners }: { partners: DeliveryPartner[] }) {
  const [statusById, setStatusById] = useState<Record<string, DeliveryPartnerKycStatus>>(() =>
    Object.fromEntries(partners.map((p) => [p.id, p.isActive ? 'active' : 'suspended'])),
  );
  const [filter, setFilter] = useState<DeliveryPartnerKycStatus | 'all'>('all');

  const rows = useMemo(
    () => partners.filter((p) => filter === 'all' || statusById[p.id] === filter),
    [partners, statusById, filter],
  );

  function setStatus(id: string, status: DeliveryPartnerKycStatus) {
    setStatusById((prev) => ({ ...prev, [id]: status }));
  }

  if (partners.length === 0) {
    return <EmptyState title="No delivery partners yet" description="Add one above to start assigning subscriptions." />;
  }

  return (
    <>
      <DemoDataNotice message="KYC status and the approve / reject / suspend actions below are a UI preview — they update this screen only, until the backend adds a status field." />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? 'brand-gradient text-white shadow-sm'
                : 'border border-(--color-border) text-(--color-text-muted) hover:bg-(--color-surface-muted)'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No partners match this filter" />
      ) : (
        <DataTable
          columns={[
            {
              header: 'Name',
              cell: (p) => <span className="font-medium text-(--color-text)">{p.name}</span>,
            },
            { header: 'Mobile', cell: (p) => p.mobile },
            {
              header: 'KYC status',
              cell: (p) => <PartnerKycStatusBadge status={statusById[p.id]} />,
            },
            {
              header: 'Added',
              cell: (p) => <span className="text-(--color-text-muted)">{formatDate(p.createdAt)}</span>,
            },
            {
              header: '',
              align: 'right',
              cell: (p) => {
                const status = statusById[p.id];
                if (status === 'pending') {
                  return (
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setStatus(p.id, 'active')}
                        className="font-medium text-(--color-brand-green-dark) hover:underline"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(p.id, 'rejected')}
                        className="font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  );
                }
                if (status === 'active') {
                  return (
                    <button
                      type="button"
                      onClick={() => setStatus(p.id, 'suspended')}
                      className="font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Suspend
                    </button>
                  );
                }
                return (
                  <button
                    type="button"
                    onClick={() => setStatus(p.id, 'active')}
                    className="font-medium text-(--color-brand-blue-dark) hover:underline"
                  >
                    Reinstate
                  </button>
                );
              },
            },
          ]}
          rows={rows}
        />
      )}
    </>
  );
}
