'use client';

import { useActionState } from 'react';
import { assignDeliveryPartner, type AssignPartnerState } from '../actions';
import type { DeliveryPartner } from '@/lib/types';

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
  const assignAction = assignDeliveryPartner.bind(null, subscriptionId);
  const [state, formAction, pending] = useActionState(assignAction, initialState);
  const activePartners = partners.filter((p) => p.isActive);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <select
        name="deliveryPartnerId"
        defaultValue={currentPartnerId ?? ''}
        required
        className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm outline-none focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20"
      >
        <option value="" disabled>
          Choose a delivery partner…
        </option>
        {activePartners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.mobile}
          </option>
        ))}
      </select>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-(--color-brand-green-dark)">Delivery partner updated.</p>}

      <button
        type="submit"
        disabled={pending || activePartners.length === 0}
        className="brand-gradient self-start rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Saving…' : currentPartnerId ? 'Reassign' : 'Assign'}
      </button>

      {activePartners.length === 0 && (
        <p className="text-xs text-(--color-text-muted)">No active delivery partners yet — add one first.</p>
      )}
    </form>
  );
}
