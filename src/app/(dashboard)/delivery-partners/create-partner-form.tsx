'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createDeliveryPartner, type CreatePartnerState } from './actions';

const initialState: CreatePartnerState = {};

export function CreatePartnerForm() {
  const [state, formAction, pending] = useActionState(createDeliveryPartner, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm outline-none focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="mobile" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Mobile
        </label>
        <input
          id="mobile"
          name="mobile"
          type="text"
          placeholder="9876543210"
          required
          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm outline-none focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="brand-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Adding…' : 'Add partner'}
      </button>
      {state.error && <p className="text-sm text-red-600 sm:basis-full dark:text-red-400">{state.error}</p>}
    </form>
  );
}
