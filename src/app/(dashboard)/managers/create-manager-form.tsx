'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { useTranslations } from '@/lib/i18n/client';
import { createManager, type CreateManagerState } from './actions';

const initialState: CreateManagerState = {};

export function CreateManagerForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(createManager, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className={formRowClass}>
      <FormField label={t.common.name} htmlFor="manager-name" className="flex-1">
        <input id="manager-name" name="name" type="text" required className={inputClass} />
      </FormField>
      <FormField
        label={t.managers.username}
        htmlFor="manager-username"
        hint={t.managers.usernameHint}
        className="flex-1"
      >
        <input id="manager-username" name="username" type="text" autoComplete="off" required className={inputClass} />
      </FormField>
      <FormField
        label={t.managers.password}
        htmlFor="manager-password"
        hint={t.managers.passwordHint}
        className="flex-1"
      >
        <input
          id="manager-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </FormField>
      <FormField label={t.managers.role} htmlFor="manager-role" className="w-full sm:w-40">
        <select id="manager-role" name="role" defaultValue="manager" className={inputClass}>
          <option value="manager">{t.managers.roleManager}</option>
          <option value="admin">{t.managers.roleAdmin}</option>
        </select>
      </FormField>
      <FormSubmit pending={pending} label={t.managers.create} pendingLabel={t.managers.creating} />
      <FormError message={state.error} />
    </form>
  );
}
