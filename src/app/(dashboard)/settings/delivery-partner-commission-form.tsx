'use client';

import { useActionState } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { updateDeliveryPartnerCommissionSettings, type DeliveryPartnerCommissionFormState } from './actions';
import { useTranslations } from '@/lib/i18n/client';
import type { PlatformSettings } from '@/lib/types';

const initialState: DeliveryPartnerCommissionFormState = {};

export function DeliveryPartnerCommissionForm({ settings }: { settings: PlatformSettings }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(updateDeliveryPartnerCommissionSettings, initialState);

  return (
    <form action={formAction} className={formRowClass}>
      <FormField
        label={t.settings.deliveryPartnerAmount}
        htmlFor="deliveryPartnerReferralPartnerAmount"
        hint={t.settings.deliveryPartnerAmountHint}
      >
        <input
          id="deliveryPartnerReferralPartnerAmount"
          name="deliveryPartnerReferralPartnerAmount"
          type="number"
          min={0}
          step="0.01"
          defaultValue={settings.deliveryPartnerReferralPartnerAmount}
          required
          className={`w-32 ${inputClass}`}
        />
      </FormField>
      <FormField
        label={t.settings.managerAmount}
        htmlFor="deliveryPartnerReferralManagerAmount"
        hint={t.settings.managerAmountHint}
      >
        <input
          id="deliveryPartnerReferralManagerAmount"
          name="deliveryPartnerReferralManagerAmount"
          type="number"
          min={0}
          step="0.01"
          defaultValue={settings.deliveryPartnerReferralManagerAmount}
          required
          className={`w-32 ${inputClass}`}
        />
      </FormField>
      <FormSubmit pending={pending} label={t.settings.save} pendingLabel={t.settings.saving} />
      {state.success && !state.error && (
        <p className="text-sm text-(--color-brand-green-dark) sm:basis-full">{t.settings.deliveryPartnerCommissionSaved}</p>
      )}
      <FormError message={state.error} />
    </form>
  );
}
