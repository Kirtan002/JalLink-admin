'use client';

import { useActionState, useEffect, useRef } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { createPlan, type PlanFormState } from './actions';
import { useTranslations } from '@/lib/i18n/client';

const initialState: PlanFormState = {};

export function CreatePlanForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(createPlan, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <div className={formRowClass}>
        <FormField label={t.plans.planName} htmlFor="name" className="flex-1">
          <input id="name" name="name" type="text" placeholder="30 Days Plan" required className={inputClass} />
        </FormField>
        <FormField label={t.plans.durationDays} htmlFor="durationDays">
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
        <FormField label={t.plans.bottleSize} htmlFor="bottleSizeLtr">
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
        <FormField label={t.plans.price} htmlFor="price" hint={t.plans.priceHint} className="max-w-xs">
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            placeholder="1500"
            required
            className={`w-28 ${inputClass}`}
          />
        </FormField>
        <FormField label={t.plans.floorCategory} htmlFor="floorCategory">
          <select id="floorCategory" name="floorCategory" required defaultValue="ground_plus_one" className={inputClass}>
            <option value="ground_plus_one">{t.plans.floorGroundPlusOne}</option>
            <option value="higher_floors">{t.plans.floorHigherFloors}</option>
          </select>
        </FormField>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.plans.discountTiers}</p>
        <p className="text-xs text-(--color-text-muted)">{t.plans.discountTiersHint}</p>
        <div className={formRowClass}>
          <FormField label={t.plans.tier1Percent} htmlFor="tier1Percent">
            <input id="tier1Percent" name="tier1Percent" type="number" min={0} max={100} step="0.01" defaultValue={0} required className={`w-24 ${inputClass}`} />
          </FormField>
          <FormField label={t.plans.tier2Percent} htmlFor="tier2Percent">
            <input id="tier2Percent" name="tier2Percent" type="number" min={0} max={100} step="0.01" defaultValue={0} required className={`w-24 ${inputClass}`} />
          </FormField>
          <FormField label={t.plans.tier3Percent} htmlFor="tier3Percent">
            <input id="tier3Percent" name="tier3Percent" type="number" min={0} max={100} step="0.01" defaultValue={0} required className={`w-24 ${inputClass}`} />
          </FormField>
          <FormField label={t.plans.tier4Percent} htmlFor="tier4Percent" hint={t.plans.tier4PercentHint}>
            <input id="tier4Percent" name="tier4Percent" type="number" min={0} max={100} step="0.01" defaultValue={0} required className={`w-24 ${inputClass}`} />
          </FormField>
          <FormSubmit pending={pending} label={t.plans.create} pendingLabel={t.plans.creating} />
        </div>
      </div>

      <FormError message={state.error} />
    </form>
  );
}
