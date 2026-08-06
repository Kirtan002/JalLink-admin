'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { updateSettings, type SettingsFormState } from './actions';
import { useTranslations } from '@/lib/i18n/client';
import type { PlatformSettings } from '@/lib/types';

const initialState: SettingsFormState = {};

export function SettingsForm({ settings }: { settings: PlatformSettings }) {
  const t = useTranslations();
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
        label={t.plans.referralDivisor}
        htmlFor="referralDivisor"
        hint={t.plans.referralDivisorHint}
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
        label={t.plans.extraBottlePrice}
        htmlFor="extraBottlePricePerUnit"
        hint={t.plans.extraBottlePriceHint}
      >
        <input
          id="extraBottlePricePerUnit"
          name="extraBottlePricePerUnit"
          type="number"
          min={0}
          step="0.01"
          defaultValue={settings.extraBottlePricePerUnit ?? ''}
          placeholder={t.plans.notSet}
          required
          className={`w-36 ${inputClass}`}
        />
      </FormField>
      <FormSubmit pending={pending} label={t.plans.saveSettings} pendingLabel={t.plans.saving} />
      <FormError message={state.error} />
    </form>
  );
}
