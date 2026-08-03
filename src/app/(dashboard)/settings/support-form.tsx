'use client';

import { useActionState } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { updateSupportContact, type SupportFormState } from './actions';
import type { PlatformSettings } from '@/lib/types';

const initialState: SupportFormState = {};

export function SupportForm({ settings }: { settings: PlatformSettings }) {
  const [state, formAction, pending] = useActionState(updateSupportContact, initialState);

  return (
    <form action={formAction} className={formRowClass}>
      <FormField
        label="Support mobile number"
        htmlFor="supportMobile"
        hint="Indian mobile, with or without +91. Leave blank to hide it in the app."
      >
        <input
          id="supportMobile"
          name="supportMobile"
          type="tel"
          inputMode="tel"
          defaultValue={settings.supportMobile ?? ''}
          placeholder="+91 98765 43210"
          className={`w-56 ${inputClass}`}
        />
      </FormField>
      <FormField label="Support email" htmlFor="supportEmail" hint="Leave blank to hide it in the app.">
        <input
          id="supportEmail"
          name="supportEmail"
          type="email"
          defaultValue={settings.supportEmail ?? ''}
          placeholder="support@jallink.in"
          className={`w-64 ${inputClass}`}
        />
      </FormField>
      <FormSubmit pending={pending} label="Save support contact" pendingLabel="Saving…" />
      <FormError message={state.error} />
      {state.success && !state.error && (
        <p className="text-sm text-(--color-brand-green-dark) sm:basis-full">Support contact saved.</p>
      )}
    </form>
  );
}
