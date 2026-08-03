'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { updateSettings, type SettingsFormState } from './actions';
import type { PlatformSettings } from '@/lib/types';

const initialState: SettingsFormState = {};

export function SettingsForm({ settings }: { settings: PlatformSettings }) {
  const [state, formAction, pending] = useActionState(updateSettings, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className={formRowClass}>
      <FormField
        label="Referral divisor"
        htmlFor="referralDivisor"
        hint="Every plan price must divide evenly by this. Also caps how many people a user can refer."
        className="max-w-md"
      >
        <input
          id="referralDivisor"
          name="referralDivisor"
          type="number"
          min={1}
          defaultValue={settings.referralDivisor}
          required
          className={`w-32 ${inputClass}`}
        />
      </FormField>
      <FormField
        label="Extra bottle price (₹)"
        htmlFor="extraBottlePricePerUnit"
        hint="Flat rate per one-off extra bottle order."
      >
        <input
          id="extraBottlePricePerUnit"
          name="extraBottlePricePerUnit"
          type="number"
          min={0}
          step="0.01"
          defaultValue={settings.extraBottlePricePerUnit ?? ''}
          placeholder="Not set"
          required
          className={`w-36 ${inputClass}`}
        />
      </FormField>
      <FormSubmit pending={pending} label="Save settings" pendingLabel="Saving…" />
      <FormError message={state.error} />
    </form>
  );
}
