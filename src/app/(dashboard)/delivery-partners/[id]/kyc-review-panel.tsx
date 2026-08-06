'use client';

import { useActionState, useState } from 'react';
import { inputClass, labelClass } from '@/components/FormField';
import { useTranslations } from '@/lib/i18n/client';
import type { DeliveryPartnerKycStatus } from '@/lib/types';
import { approvePartnerKyc, rejectPartnerKyc, type KycReviewState } from '../actions';

const initialState: KycReviewState = {};

/**
 * The approve / reject control.
 *
 * Approving is one click; rejecting deliberately is not. The reject button opens the reason
 * field rather than submitting, because the reason is the entire product of a rejection — the
 * partner reads it verbatim and has nothing else to go on. The same 10-character minimum is
 * enforced in the server action and again in the API.
 */
export function KycReviewPanel({
  partnerId,
  kycStatus,
}: {
  partnerId: string;
  kycStatus: DeliveryPartnerKycStatus;
}) {
  const t = useTranslations();
  const [approveState, approveAction, approving] = useActionState(
    approvePartnerKyc.bind(null, partnerId),
    initialState,
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    rejectPartnerKyc.bind(null, partnerId),
    initialState,
  );
  const [rejectOpen, setRejectOpen] = useState(false);

  if (kycStatus !== 'pending') {
    return (
      <p className="text-sm text-(--color-text-muted)">
        {kycStatus === 'not_submitted'
          ? t.deliveryPartners.detail.notSubmitted
          : t.deliveryPartners.detail.alreadyDecided}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-(--color-text-muted)">{t.deliveryPartners.detail.decisionHint}</p>

      <form action={approveAction} className="flex flex-col gap-3">
        <label htmlFor="note" className={labelClass}>
          {t.deliveryPartners.approvalNoteLabel}
        </label>
        <input
          id="note"
          name="note"
          type="text"
          placeholder={t.deliveryPartners.approvalNotePlaceholder}
          className={inputClass}
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={approving || rejecting}
            className="brand-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {approving ? t.deliveryPartners.approving : t.deliveryPartners.approve}
          </button>
          {!rejectOpen && (
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              disabled={approving}
              className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              {t.deliveryPartners.reject}
            </button>
          )}
        </div>
        {approveState.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{approveState.error}</p>
        )}
      </form>

      {rejectOpen && (
        <form
          action={rejectAction}
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/30"
        >
          <label htmlFor="reason" className={labelClass}>
            {t.deliveryPartners.rejectionReasonLabel}
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            minLength={10}
            maxLength={500}
            required
            placeholder={t.deliveryPartners.rejectionReasonPlaceholder}
            className={`${inputClass} resize-y`}
          />
          <p className="text-xs text-(--color-text-muted)">
            {t.deliveryPartners.rejectionReasonHint}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={rejecting}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
            >
              {rejecting ? t.deliveryPartners.rejecting : t.deliveryPartners.reject}
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              disabled={rejecting}
              className="rounded-lg border border-(--color-border) px-5 py-2.5 text-sm font-medium text-(--color-text-muted) transition hover:bg-(--color-surface-muted) disabled:opacity-60"
            >
              {t.common.cancel}
            </button>
          </div>
          {rejectState.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{rejectState.error}</p>
          )}
        </form>
      )}
    </div>
  );
}
