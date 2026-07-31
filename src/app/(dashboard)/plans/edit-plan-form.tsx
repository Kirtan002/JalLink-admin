'use client';

import { useActionState, useEffect } from 'react';
import { updatePlan, type PlanFormState } from './actions';
import type { Plan } from '@/lib/types';

const initialState: PlanFormState = {};

const inputClass =
  'rounded-lg border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm outline-none focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20';
const labelClass = 'text-xs font-medium text-(--color-text-muted)';

export function EditPlanForm({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const boundAction = updatePlan.bind(null, plan.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) {
      onDone();
    }
  }, [state.success, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor={`name-${plan.id}`} className={labelClass}>
          Name
        </label>
        <input
          id={`name-${plan.id}`}
          name="name"
          type="text"
          defaultValue={plan.name}
          required
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`durationDays-${plan.id}`} className={labelClass}>
          Duration (bottles)
        </label>
        <input
          id={`durationDays-${plan.id}`}
          name="durationDays"
          type="number"
          min={1}
          defaultValue={plan.durationDays}
          required
          className={`w-28 ${inputClass}`}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`bottleSizeLtr-${plan.id}`} className={labelClass}>
          Bottle size (L)
        </label>
        <input
          id={`bottleSizeLtr-${plan.id}`}
          name="bottleSizeLtr"
          type="number"
          min={1}
          defaultValue={plan.bottleSizeLtr}
          required
          className={`w-24 ${inputClass}`}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`price-${plan.id}`} className={labelClass}>
          Price (₹)
        </label>
        <input
          id={`price-${plan.id}`}
          name="price"
          type="number"
          min={0}
          step="0.01"
          defaultValue={plan.price}
          required
          className={`w-28 ${inputClass}`}
        />
      </div>
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
      {state.error && <p className="text-sm text-red-600 sm:basis-full dark:text-red-400">{state.error}</p>}
    </form>
  );
}
