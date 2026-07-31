'use client';

import { useActionState, useEffect, useRef } from 'react';
import { updateSettings, type SettingsFormState } from './actions';
import type { PlatformSettings } from '@/lib/types';

const initialState: SettingsFormState = {};

const inputClass =
  'rounded-lg border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm outline-none focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20';
const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-300';

export function SettingsForm({ settings }: { settings: PlatformSettings }) {
  const [state, formAction, pending] = useActionState(updateSettings, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="referralDivisor" className={labelClass}>
          Referral divisor
        </label>
        <input
          id="referralDivisor"
          name="referralDivisor"
          type="number"
          min={1}
          defaultValue={settings.referralDivisor}
          required
          className={`w-32 ${inputClass}`}
        />
        <p className="text-xs text-(--color-text-muted)">
          Every plan price must divide evenly by this. Also caps how many people a user can refer.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="extraBottlePricePerUnit" className={labelClass}>
          Extra bottle price (₹)
        </label>
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
        <p className="text-xs text-(--color-text-muted)">Flat rate per one-off extra bottle order.</p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save settings'}
      </button>
      {state.error && <p className="text-sm text-red-600 sm:basis-full dark:text-red-400">{state.error}</p>}
    </form>
  );
}
