'use client';

import { useActionState } from 'react';
import { FormError, FormField, FormSubmit, formRowClass, inputClass } from '@/components/FormField';
import { updateReferralSettings, type ReferralSettingsFormState } from './actions';
import { useTranslations } from '@/lib/i18n/client';
import type { PlatformSettings } from '@/lib/types';

const initialState: ReferralSettingsFormState = {};

export function ReferralSettingsForm({ settings }: { settings: PlatformSettings }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(updateReferralSettings, initialState);

  return (
    <form action={formAction} className={formRowClass}>
      <FormField
        label={t.referrals.rewardPercent}
        htmlFor="referralRewardPercent"
        hint={t.referrals.rewardPercentHint}
      >
        <input
          id="referralRewardPercent"
          name="referralRewardPercent"
          type="number"
          min={0}
          max={100}
          step="0.01"
          defaultValue={settings.referralRewardPercent}
          required
          className={`w-28 ${inputClass}`}
        />
      </FormField>
      <FormField
        label={t.referrals.maxGivers}
        htmlFor="referralMaxGivers"
        hint={t.referrals.maxGiversHint}
      >
        <input
          id="referralMaxGivers"
          name="referralMaxGivers"
          type="number"
          min={1}
          defaultValue={settings.referralMaxGivers}
          required
          className={`w-24 ${inputClass}`}
        />
      </FormField>
      <FormField
        label={t.referrals.maxEntries}
        htmlFor="referralMaxEntries"
        hint={t.referrals.maxEntriesHint}
      >
        <input
          id="referralMaxEntries"
          name="referralMaxEntries"
          type="number"
          min={1}
          defaultValue={settings.referralMaxEntries}
          required
          className={`w-24 ${inputClass}`}
        />
      </FormField>
      <FormSubmit pending={pending} label={t.referrals.saveSettings} pendingLabel={t.plans.saving} />
      {state.success && !state.error && (
        <p className="text-sm text-green-600 sm:basis-full dark:text-green-400">{t.referrals.settingsSaved}</p>
      )}
      <FormError message={state.error} />
    </form>
  );
}
