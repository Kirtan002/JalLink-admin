'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

export interface ReferralSettingsFormState {
  error?: string;
  success?: boolean;
}

export async function updateReferralSettings(
  _prevState: ReferralSettingsFormState,
  formData: FormData,
): Promise<ReferralSettingsFormState> {
  await requireSession();

  const referralRewardPercent = Number(formData.get('referralRewardPercent'));
  const referralMaxGivers = Number(formData.get('referralMaxGivers'));
  const referralMaxEntries = Number(formData.get('referralMaxEntries'));

  if (!Number.isFinite(referralRewardPercent) || referralRewardPercent < 0 || referralRewardPercent > 100) {
    return { error: 'Referral reward percent must be between 0 and 100' };
  }
  if (!Number.isInteger(referralMaxGivers) || referralMaxGivers <= 0) {
    return { error: 'Max holders per code must be a positive whole number' };
  }
  if (!Number.isInteger(referralMaxEntries) || referralMaxEntries <= 0) {
    return { error: 'Max codes per holder must be a positive whole number' };
  }

  // Only these three fields — support contact and the extra-bottle price are edited
  // elsewhere, and PATCH /admin/settings is partial, so no form clobbers another's values.
  try {
    await api.updateSettings({ referralRewardPercent, referralMaxGivers, referralMaxEntries });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update settings' };
  }

  revalidatePath('/referrals');
  return { success: true };
}

export interface ReversePayoutState {
  error?: string;
  success?: boolean;
}

export async function reversePayout(id: string, reason: string): Promise<ReversePayoutState> {
  await requireSession();

  if (!reason.trim()) {
    return { error: 'A reason is required' };
  }

  try {
    await api.reverseReferralPayout(id, reason);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to reverse payout' };
  }

  revalidatePath('/referrals');
  return { success: true };
}
