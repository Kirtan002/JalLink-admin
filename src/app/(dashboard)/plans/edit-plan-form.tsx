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
import { useTranslations } from '@/lib/i18n/client';
import type { Plan } from '@/lib/types';

const initialState: PlanFormState = {};

export function EditPlanForm({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const t = useTranslations();
  const boundAction = updatePlan.bind(null, plan.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) {
      onDone();
    }
  }, [state.success, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className={formRowClass}>
        <FormField label={t.plans.planName} htmlFor={`name-${plan.id}`} compact className="flex-1">
          <input
            id={`name-${plan.id}`}
            name="name"
            type="text"
            defaultValue={plan.name}
            required
            className={inputClass}
          />
        </FormField>
        <FormField label={t.plans.durationDays} htmlFor={`durationDays-${plan.id}`} compact>
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
        <FormField label={t.plans.bottleSize} htmlFor={`bottleSizeLtr-${plan.id}`} compact>
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
        <FormField label={t.plans.priceGroundPlusOne} htmlFor={`priceGroundPlusOne-${plan.id}`} compact>
          <input
            id={`priceGroundPlusOne-${plan.id}`}
            name="priceGroundPlusOne"
            type="number"
            min={0}
            step="0.01"
            defaultValue={plan.priceGroundPlusOne}
            required
            className={`w-28 ${inputClass}`}
          />
        </FormField>
        <FormField label={t.plans.priceHigherFloors} htmlFor={`priceHigherFloors-${plan.id}`} compact>
          <input
            id={`priceHigherFloors-${plan.id}`}
            name="priceHigherFloors"
            type="number"
            min={0}
            step="0.01"
            defaultValue={plan.priceHigherFloors}
            required
            className={`w-28 ${inputClass}`}
          />
        </FormField>
      </div>

      <div className={formRowClass}>
        <FormField label={t.plans.tier1Percent} htmlFor={`tier1Percent-${plan.id}`} compact>
          <input id={`tier1Percent-${plan.id}`} name="tier1Percent" type="number" min={0} max={100} step="0.01" defaultValue={plan.tier1Percent} required className={`w-24 ${inputClass}`} />
        </FormField>
        <FormField label={t.plans.tier2Percent} htmlFor={`tier2Percent-${plan.id}`} compact>
          <input id={`tier2Percent-${plan.id}`} name="tier2Percent" type="number" min={0} max={100} step="0.01" defaultValue={plan.tier2Percent} required className={`w-24 ${inputClass}`} />
        </FormField>
        <FormField label={t.plans.tier3Percent} htmlFor={`tier3Percent-${plan.id}`} compact>
          <input id={`tier3Percent-${plan.id}`} name="tier3Percent" type="number" min={0} max={100} step="0.01" defaultValue={plan.tier3Percent} required className={`w-24 ${inputClass}`} />
        </FormField>
        <FormField label={t.plans.tier4Percent} htmlFor={`tier4Percent-${plan.id}`} compact>
          <input id={`tier4Percent-${plan.id}`} name="tier4Percent" type="number" min={0} max={100} step="0.01" defaultValue={plan.tier4Percent} required className={`w-24 ${inputClass}`} />
        </FormField>

        <div className="flex flex-col gap-1.5">
          <FormLabelSpacer compact />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="brand-gradient rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? t.plans.saving : t.plans.save}
            </button>
            <button
              type="button"
              onClick={onDone}
              className="rounded-lg border border-(--color-border) px-4 py-2.5 text-sm font-medium text-(--color-text-muted) transition hover:bg-(--color-surface-muted)"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      </div>

      <FormError message={state.error} />
    </form>
  );
}
