'use client';

import { useActionState } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { updateSupportContact, type SupportFormState } from './actions';
import { useTranslations } from '@/lib/i18n/client';
import type { PlatformSettings } from '@/lib/types';

const initialState: SupportFormState = {};

export function SupportForm({ settings }: { settings: PlatformSettings }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(updateSupportContact, initialState);

  return (
    <form action={formAction} className={formRowClass}>
      <FormField
        label={t.settings.supportMobile}
        htmlFor="supportMobile"
        hint={t.settings.supportMobileHint}
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
      <FormField label={t.settings.supportEmail} htmlFor="supportEmail" hint={t.settings.supportEmailHint}>
        <input
          id="supportEmail"
          name="supportEmail"
          type="email"
          defaultValue={settings.supportEmail ?? ''}
          placeholder="support@jallink.in"
          className={`w-64 ${inputClass}`}
        />
      </FormField>
      <FormSubmit pending={pending} label={t.settings.saveSupport} pendingLabel={t.settings.saving} />
      <FormError message={state.error} />
      {state.success && !state.error && (
        <p className="text-sm text-(--color-brand-green-dark) sm:basis-full">{t.settings.supportSaved}</p>
      )}
    </form>
  );
}
