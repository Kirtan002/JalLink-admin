'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { useTranslations } from '@/lib/i18n/client';
import { createDeliveryPartner, type CreatePartnerState } from './actions';

const initialState: CreatePartnerState = {};

export function CreatePartnerForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(createDeliveryPartner, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className={formRowClass}>
      <FormField label={t.common.name} htmlFor="name" className="flex-1">
        <input id="name" name="name" type="text" required className={inputClass} />
      </FormField>
      <FormField label={t.common.mobile} htmlFor="mobile" className="flex-1">
        <input
          id="mobile"
          name="mobile"
          type="tel"
          inputMode="numeric"
          placeholder="9876543210"
          required
          className={inputClass}
        />
      </FormField>
      <FormSubmit
        pending={pending}
        label={t.deliveryPartners.addPartner}
        pendingLabel={t.deliveryPartners.adding}
      />
      <FormError message={state.error} />
    </form>
  );
}
