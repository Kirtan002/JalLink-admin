'use client';

import { useActionState, useEffect } from 'react';
import {
  FormError,
  FormField,
  FormLabelSpacer,
  formRowClass,
  inputClass,
} from '@/components/FormField';
import { updatePlan, type PlanFormState } from './actions';
import type { Plan } from '@/lib/types';

const initialState: PlanFormState = {};

export function EditPlanForm({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const boundAction = updatePlan.bind(null, plan.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) {
      onDone();
    }
  }, [state.success, onDone]);

  return (
    <form action={formAction} className={formRowClass}>
      <FormField label="Name" htmlFor={`name-${plan.id}`} compact className="flex-1">
        <input
          id={`name-${plan.id}`}
          name="name"
          type="text"
          defaultValue={plan.name}
          required
          className={inputClass}
        />
      </FormField>
      <FormField label="Duration (bottles)" htmlFor={`durationDays-${plan.id}`} compact>
        <input
          id={`durationDays-${plan.id}`}
          name="durationDays"
          type="number"
          min={1}
          defaultValue={plan.durationDays}
          required
          className={`w-28 ${inputClass}`}
        />
      </FormField>
      <FormField label="Bottle size (L)" htmlFor={`bottleSizeLtr-${plan.id}`} compact>
        <input
          id={`bottleSizeLtr-${plan.id}`}
          name="bottleSizeLtr"
          type="number"
          min={1}
          defaultValue={plan.bottleSizeLtr}
          required
          className={`w-24 ${inputClass}`}
        />
      </FormField>
      <FormField label="Price (₹)" htmlFor={`price-${plan.id}`} compact>
        <input
          id={`price-${plan.id}`}
          name="price"
          type="number"
          min={1}
          step={1}
          defaultValue={plan.price}
          required
          className={`w-28 ${inputClass}`}
        />
      </FormField>
      <div className="flex flex-col gap-1.5">
        <FormLabelSpacer compact />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="brand-gradient rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-(--color-border) px-4 py-2.5 text-sm font-medium text-(--color-text-muted) transition hover:bg-(--color-surface-muted)"
          >
            Cancel
          </button>
        </div>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
