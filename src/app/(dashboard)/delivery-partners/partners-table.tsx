'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { PartnerKycStatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/format';
import { useTranslations } from '@/lib/i18n/client';
import { interpolate } from '@/lib/i18n/config';
import type { DeliveryPartner } from '@/lib/types';
import { PartnerWalletCell } from './wallet-cell';

/** 'suspended' is not a KYC status — it is the `isActive` flag — but it is what an operator
 * is looking for when they scan this list, so it gets a filter of its own. */
type Filter = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';

function matches(partner: DeliveryPartner, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'suspended') return !partner.isActive;
  return partner.isActive && partner.kycStatus === filter;
}

export function PartnersTable({
  partners,
  wallets,
}: {
  partners: DeliveryPartner[];
  wallets: Record<string, string>;
}) {
  const t = useTranslations();
  const [filter, setFilter] = useState<Filter>('all');

  const filters: { label: string; value: Filter }[] = [
    { label: t.common.all, value: 'all' },
    { label: t.deliveryPartners.awaitingReview, value: 'pending' },
    { label: t.deliveryPartners.approved, value: 'approved' },
    { label: t.deliveryPartners.rejected, value: 'rejected' },
    { label: t.deliveryPartners.suspended, value: 'suspended' },
  ];

  const rows = useMemo(
    () =>
      // Whoever is waiting on a decision comes first — this list is a work queue before it is
      // a directory.
      [...partners]
        .filter((p) => matches(p, filter))
        .sort((a, b) => {
          const aPending = a.kycStatus === 'pending' ? 0 : 1;
          const bPending = b.kycStatus === 'pending' ? 0 : 1;
          if (aPending !== bPending) return aPending - bPending;
          return (b.kycSubmittedAt ?? b.createdAt).localeCompare(a.kycSubmittedAt ?? a.createdAt);
        }),
    [partners, filter],
  );

  if (partners.length === 0) {
    return <EmptyState title={t.deliveryPartners.empty} description={t.deliveryPartners.emptyHint} />;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
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
        <EmptyState title={t.deliveryPartners.noMatch} />
      ) : (
        <DataTable
          columns={[
            {
              header: t.common.name,
              cell: (p) => (
                <Link href={`/delivery-partners/${p.id}`} className="group block">
                  <div className="font-medium text-(--color-text) group-hover:text-(--color-brand-blue-dark) group-hover:underline">
                    {p.name ?? (
                      <span className="text-(--color-text-muted) italic">
                        {t.deliveryPartners.awaitingKyc}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-(--color-text-muted)">{p.mobile}</div>
                </Link>
              ),
            },
            {
              header: t.deliveryPartners.kycStatus,
              cell: (p) => (
                <div className="flex flex-col items-end gap-1 md:items-start">
                  <PartnerKycStatusBadge status={p.kycStatus} isActive={p.isActive} />
                  {p.kycSubmissionCount > 1 && (
                    <span className="text-xs text-(--color-text-muted)">
                      {interpolate(t.deliveryPartners.resubmission, { count: p.kycSubmissionCount })}
                    </span>
                  )}
                </div>
              ),
            },
            {
              header: t.common.added,
              cell: (p) => (
                <span className="text-(--color-text-muted)">
                  {p.kycSubmittedAt
                    ? interpolate(t.deliveryPartners.submittedOn, {
                        date: formatDate(p.kycSubmittedAt),
                      })
                    : formatDate(p.createdAt)}
                </span>
              ),
            },
            {
              header: t.deliveryPartners.wallet,
              align: 'right',
              cell: (p) =>
                p.kycStatus === 'approved' ? (
                  <PartnerWalletCell partnerId={p.id} balance={wallets[p.id] ?? '0.00'} />
                ) : (
                  <span className="text-(--color-text-muted)">{t.common.dash}</span>
                ),
            },
            {
              header: '',
              align: 'right',
              cell: (p) => (
                <Link
                  href={`/delivery-partners/${p.id}`}
                  className={`font-medium hover:underline ${
                    p.kycStatus === 'pending'
                      ? 'text-(--color-brand-green-dark)'
                      : 'text-(--color-brand-blue-dark)'
                  }`}
                >
                  {p.kycStatus === 'pending' ? t.deliveryPartners.review : t.common.view}
                </Link>
              ),
            },
          ]}
          rows={rows}
        />
      )}
    </>
  );
}
