'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { useTranslations } from '@/lib/i18n/client';
import type { ReferralPayout } from '@/lib/types';
import { reversePayout } from './actions';

const STATUS_TONE = { pending: 'amber', credited: 'green', reversed: 'slate' } as const;

export function ReferralPayoutsTable({ payouts }: { payouts: ReferralPayout[] }) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReverse(payout: ReferralPayout) {
    const reason = window.prompt(t.referrals.reverseReasonPrompt);
    if (reason === null) return;
    setError(null);
    startTransition(async () => {
      const res = await reversePayout(payout.id, reason);
      if (res.error) setError(res.error);
    });
  }

  if (payouts.length === 0) {
    return <EmptyState title={t.referrals.payoutsEmpty} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
      <DataTable
        columns={[
          {
            header: t.referrals.holder,
            cell: (p) => (
              <Link href={`/users/${p.holder.id}`} className="font-medium hover:underline">
                {p.holder.name ?? p.holder.mobile}
              </Link>
            ),
          },
          {
            header: t.referrals.owner,
            cell: (p) => (
              <Link href={`/users/${p.owner.id}`} className="hover:underline">
                {p.owner.name ?? p.owner.mobile}
              </Link>
            ),
          },
          { header: t.common.amount, cell: (p) => formatCurrency(p.rewardAmount) },
          { header: t.referrals.rewardPercent, cell: (p) => `${p.rewardPercent}%` },
          { header: t.common.status, cell: (p) => <Badge tone={STATUS_TONE[p.status]}>{t.referrals.payoutStatus[p.status]}</Badge> },
          { header: t.common.time, cell: (p) => <span className="text-(--color-text-muted)">{formatDateTime(p.createdAt)}</span> },
          {
            header: '',
            align: 'right',
            cell: (p) =>
              p.status === 'credited' ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReverse(p)}
                  className="font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
                >
                  {t.referrals.reverse}
                </button>
              ) : null,
          },
        ]}
        rows={payouts}
      />
    </div>
  );
}
