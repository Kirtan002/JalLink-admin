'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';
import { useTranslations } from '@/lib/i18n/client';

const initialState: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.login.username}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm outline-none transition focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.login.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm outline-none transition focus:border-(--color-brand-blue) focus:ring-2 focus:ring-(--color-brand-blue)/20"
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="brand-gradient mt-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t.login.submitting : t.login.submit}
      </button>
    </form>
  );
}
