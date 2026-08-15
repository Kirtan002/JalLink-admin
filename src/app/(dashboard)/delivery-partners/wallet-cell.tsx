'use client';

import { useActionState, useEffect, useRef } from 'react';
import { withdrawDeliveryPartnerWallet, type WithdrawPartnerWalletState } from './actions';
import { formatCurrency } from '@/lib/format';
import { useTranslations } from '@/lib/i18n/client';

const initialState: WithdrawPartnerWalletState = {};

export function PartnerWalletCell({
  partnerId,
  balance,
  canWithdraw,
}: {
  partnerId: string;
  balance: string;
  /** Withdrawal is admin-only server-side (moving real money out of a partner's wallet isn't
   * delegated to managers) — a 'manager' session gets a read-only balance instead of the form. */
  canWithdraw: boolean;
}) {
  const t = useTranslations();
  const boundAction = withdrawDeliveryPartnerWallet.bind(null, partnerId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  if (!canWithdraw) {
    return <span className="font-medium text-(--color-text)">{formatCurrency(balance)}</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="font-medium text-(--color-text)">{formatCurrency(balance)}</span>
      <form ref={formRef} action={formAction} className="flex items-center gap-1.5">
        <input
          name="amount"
          type="number"
          min={0.01}
          step="0.01"
          placeholder={t.common.amount}
          className="w-20 rounded-md border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs outline-none focus:border-(--color-brand-blue)"
        />
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-medium text-(--color-brand-blue-dark) hover:underline disabled:opacity-60"
        >
          {pending ? '…' : t.deliveryPartners.withdraw}
        </button>
      </form>
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </div>
  );
}
