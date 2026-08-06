'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { createPlan, type PlanFormState } from './actions';
import { useTranslations } from '@/lib/i18n/client';

const initialState: PlanFormState = {};

export function CreatePlanForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(createPlan, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className={formRowClass}>
      <FormField label={t.plans.planName} htmlFor="name" className="flex-1">
        <input id="name" name="name" type="text" placeholder="30 Days Plan" required className={inputClass} />
      </FormField>
      <FormField label={t.plans.durationDays} htmlFor="durationDays">
        <input
          id="durationDays"
          name="durationDays"
          type="number"
          min={1}
          placeholder="30"
          required
          className={`w-28 ${inputClass}`}
        />
      </FormField>
      <FormField label={t.plans.bottleSize} htmlFor="bottleSizeLtr">
        <input
          id="bottleSizeLtr"
          name="bottleSizeLtr"
          type="number"
          min={1}
          defaultValue={20}
          required
          className={`w-24 ${inputClass}`}
        />
      </FormField>
      <FormField
        label={t.plans.price}
        htmlFor="price"
        hint={t.plans.priceHint}
        className="max-w-xs"
      >
        <input
          id="price"
          name="price"
          type="number"
          min={1}
          step={1}
          placeholder="1503"
          required
          className={`w-28 ${inputClass}`}
        />
      </FormField>
      <FormSubmit pending={pending} label={t.plans.create} pendingLabel={t.plans.creating} />
      <FormError message={state.error} />
    </form>
  );
}
