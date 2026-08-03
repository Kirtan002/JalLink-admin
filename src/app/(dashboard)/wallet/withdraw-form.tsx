'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { withdrawAdminWallet, type WithdrawFormState } from './actions';

const initialState: WithdrawFormState = {};

export function WithdrawForm() {
  const [state, formAction, pending] = useActionState(withdrawAdminWallet, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className={formRowClass}>
      <FormField label="Amount (₹)" htmlFor="amount">
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
      </FormField>
      <FormField label="Note (optional)" htmlFor="note" className="flex-1">
        <input id="note" name="note" type="text" placeholder="Transferred to company bank account" className={inputClass} />
      </FormField>
      <FormSubmit pending={pending} label="Withdraw" pendingLabel="Withdrawing…" />
      <FormError message={state.error} />
    </form>
  );
}
