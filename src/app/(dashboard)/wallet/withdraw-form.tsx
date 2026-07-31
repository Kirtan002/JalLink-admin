'use client';

import { useActionState, useEffect, useRef } from 'react';
import { withdrawAdminWallet, type WithdrawFormState } from './actions';

const initialState: WithdrawFormState = {};

const inputClass =
  'rounded-lg border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm outline-none focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20';
const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-300';

export function WithdrawForm() {
  const [state, formAction, pending] = useActionState(withdrawAdminWallet, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className={labelClass}>
          Amount (₹)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min={0.01}
          step="0.01"
          placeholder="100"
          required
          className={`w-32 ${inputClass}`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="note" className={labelClass}>
          Note (optional)
        </label>
        <input id="note" name="note" type="text" placeholder="Transferred to company bank account" className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Withdrawing…' : 'Withdraw'}
      </button>
      {state.error && <p className="text-sm text-red-600 sm:basis-full dark:text-red-400">{state.error}</p>}
    </form>
  );
}
