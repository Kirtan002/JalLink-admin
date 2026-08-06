'use client';

import { useActionState } from 'react';
import { inputClass, labelClass } from '@/components/FormField';
import { useTranslations } from '@/lib/i18n/client';
import { updatePartnerStatus, type KycReviewState } from '../actions';

const initialState: KycReviewState = {};

/** Suspend / reinstate. The note is optional but goes to the partner as an account
 * notification when suspending, which is the only warning they get. */
export function PartnerStatusPanel({
  partnerId,
  isActive,
}: {
  partnerId: string;
  isActive: boolean;
}) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(
    updatePartnerStatus.bind(null, partnerId, !isActive),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {isActive && (
        <>
          <label htmlFor="status-note" className={labelClass}>
            {t.deliveryPartners.suspendNoteLabel}
          </label>
          <input id="status-note" name="note" type="text" className={inputClass} />
          <p className="text-xs text-(--color-text-muted)">{t.deliveryPartners.suspendNoteHint}</p>
        </>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className={
            isActive
              ? 'rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950'
              : 'brand-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60'
          }
        >
          {isActive ? t.deliveryPartners.suspend : t.deliveryPartners.reinstate}
        </button>
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
