'use client';

import { useActionState } from 'react';
import { assignDeliveryPartner, type AssignPartnerState } from '../actions';
import type { DeliveryPartner } from '@/lib/types';
import { useTranslations } from '@/lib/i18n/client';

const initialState: AssignPartnerState = {};

export function AssignPartnerForm({
  subscriptionId,
  partners,
  currentPartnerId,
}: {
  subscriptionId: string;
  partners: DeliveryPartner[];
  currentPartnerId: string | null;
}) {
  const t = useTranslations();
  const assignAction = assignDeliveryPartner.bind(null, subscriptionId);
  const [state, formAction, pending] = useActionState(assignAction, initialState);
  // Assignability is not just "not suspended": an unapproved partner cannot see a delivery
  // at all, so offering them here would silently strand the subscription.
  const assignablePartners = partners.filter((p) => p.isActive && p.kycStatus === 'approved');

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <select
        name="deliveryPartnerId"
        defaultValue={currentPartnerId ?? ''}
        required
        className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm outline-none focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20"
      >
        <option value="" disabled>
          {t.subscriptionDetail.choosePartner}
        </option>
        {assignablePartners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.mobile}
          </option>
        ))}
      </select>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-(--color-brand-green-dark)">{t.subscriptionDetail.partnerUpdated}</p>
      )}

      <button
        type="submit"
        disabled={pending || assignablePartners.length === 0}
        className="brand-gradient self-start rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {pending
          ? t.subscriptionDetail.assigning
          : currentPartnerId
            ? t.subscriptionDetail.reassign
            : t.subscriptionDetail.assign}
      </button>

      {assignablePartners.length === 0 && (
        <p className="text-xs text-(--color-text-muted)">{t.subscriptionDetail.noApprovedPartners}</p>
      )}
    </form>
  );
}
