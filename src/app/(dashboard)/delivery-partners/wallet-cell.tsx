'use client';

import { useActionState, useEffect, useRef } from 'react';
import { withdrawDeliveryPartnerWallet, type WithdrawPartnerWalletState } from './actions';
import { formatCurrency } from '@/lib/format';

const initialState: WithdrawPartnerWalletState = {};

export function PartnerWalletCell({ partnerId, balance }: { partnerId: string; balance: string }) {
  const boundAction = withdrawDeliveryPartnerWallet.bind(null, partnerId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="font-medium text-(--color-text)">{formatCurrency(balance)}</span>
      <form ref={formRef} action={formAction} className="flex items-center gap-1.5">
        <input
          name="amount"
          type="number"
          min={0.01}
          step="0.01"
          placeholder="Amount"
          className="w-20 rounded-md border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs outline-none focus:border-(--color-brand-blue)"
        />
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-medium text-(--color-brand-blue-dark) hover:underline disabled:opacity-60"
        >
          {pending ? '…' : 'Withdraw'}
        </button>
      </form>
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </div>
  );
}
