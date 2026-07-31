'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createPlan, type PlanFormState } from './actions';

const initialState: PlanFormState = {};

const inputClass =
  'rounded-lg border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm outline-none focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20';
const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-300';

export function CreatePlanForm() {
  const [state, formAction, pending] = useActionState(createPlan, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" type="text" placeholder="30 Days Plan" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="durationDays" className={labelClass}>
          Duration (bottles)
        </label>
        <input
          id="durationDays"
          name="durationDays"
          type="number"
          min={1}
          placeholder="30"
          required
          className={`w-28 ${inputClass}`}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bottleSizeLtr" className={labelClass}>
          Bottle size (L)
        </label>
        <input
          id="bottleSizeLtr"
          name="bottleSizeLtr"
          type="number"
          min={1}
          defaultValue={20}
          required
          className={`w-24 ${inputClass}`}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="price" className={labelClass}>
          Price (₹)
        </label>
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
        <p className="text-xs text-(--color-text-muted)">Whole rupees, evenly divisible by the referral divisor above.</p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Creating…' : 'Create plan'}
      </button>
      {state.error && <p className="text-sm text-red-600 sm:basis-full dark:text-red-400">{state.error}</p>}
    </form>
  );
}
