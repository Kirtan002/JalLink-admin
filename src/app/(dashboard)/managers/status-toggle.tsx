'use client';

import { useActionState } from 'react';
import { useTranslations } from '@/lib/i18n/client';
import { updateManagerStatus, type UpdateManagerStatusState } from './actions';

const initialState: UpdateManagerStatusState = {};

export function ManagerStatusToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(
    updateManagerStatus.bind(null, id, !isActive),
    initialState,
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className={
          isActive
            ? 'font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400'
            : 'font-medium text-(--color-brand-blue-dark) hover:underline disabled:opacity-60'
        }
      >
        {isActive ? t.managers.deactivate : t.managers.reactivate}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
