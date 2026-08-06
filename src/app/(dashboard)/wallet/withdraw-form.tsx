'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { withdrawAdminWallet, type WithdrawFormState } from './actions';
import { useTranslations } from '@/lib/i18n/client';

const initialState: WithdrawFormState = {};

export function WithdrawForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(withdrawAdminWallet, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className={formRowClass}>
      <FormField label={t.wallet.amountLabel} htmlFor="amount">
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
      <FormField label={t.wallet.noteLabel} htmlFor="note" className="flex-1">
        <input
          id="note"
          name="note"
          type="text"
          placeholder={t.wallet.notePlaceholder}
          className={inputClass}
        />
      </FormField>
      <FormSubmit pending={pending} label={t.wallet.withdraw} pendingLabel={t.wallet.withdrawing} />
      <FormError message={state.error} />
    </form>
  );
}
