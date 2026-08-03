'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { createPlan, type PlanFormState } from './actions';

const initialState: PlanFormState = {};

export function CreatePlanForm() {
  const [state, formAction, pending] = useActionState(createPlan, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className={formRowClass}>
      <FormField label="Name" htmlFor="name" className="flex-1">
        <input id="name" name="name" type="text" placeholder="30 Days Plan" required className={inputClass} />
      </FormField>
      <FormField label="Duration (bottles)" htmlFor="durationDays">
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
      <FormField label="Bottle size (L)" htmlFor="bottleSizeLtr">
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
        label="Price (₹)"
        htmlFor="price"
        hint="Whole rupees, evenly divisible by the referral divisor above."
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
      <FormSubmit pending={pending} label="Create plan" pendingLabel="Creating…" />
      <FormError message={state.error} />
    </form>
  );
}
