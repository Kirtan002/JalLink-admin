'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import type { CreatePlanInput } from '@/lib/types';

export interface PlanFormState {
  error?: string;
  success?: boolean;
}

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

function parsePlanForm(formData: FormData): CreatePlanInput | { error: string } {
  const name = String(formData.get('name') ?? '').trim();
  const durationDays = Number(formData.get('durationDays'));
  const bottleSizeLtr = Number(formData.get('bottleSizeLtr'));
  const priceGroundPlusOne = Number(formData.get('priceGroundPlusOne'));
  const priceHigherFloors = Number(formData.get('priceHigherFloors'));
  const tier1Percent = Number(formData.get('tier1Percent'));
  const tier2Percent = Number(formData.get('tier2Percent'));
  const tier3Percent = Number(formData.get('tier3Percent'));
  const tier4Percent = Number(formData.get('tier4Percent'));

  if (!name) return { error: 'Name is required' };
  if (!Number.isInteger(durationDays) || durationDays <= 0) {
    return { error: 'Duration must be a positive whole number' };
  }
  if (!Number.isInteger(bottleSizeLtr) || bottleSizeLtr <= 0) {
    return { error: 'Bottle size must be a positive whole number' };
  }
  if (!Number.isFinite(priceGroundPlusOne) || priceGroundPlusOne <= 0) {
    return { error: 'Ground + 1 price must be greater than 0' };
  }
  if (!Number.isFinite(priceHigherFloors) || priceHigherFloors <= 0) {
    return { error: 'Higher floors price must be greater than 0' };
  }
  for (const [label, value] of [
    ['Tier 1', tier1Percent],
    ['Tier 2', tier2Percent],
    ['Tier 3', tier3Percent],
    ['Tier 4', tier4Percent],
  ] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      return { error: `${label} discount must be between 0 and 100` };
    }
  }

  return {
    name,
    durationDays,
    bottleSizeLtr,
    priceGroundPlusOne,
    priceHigherFloors,
    tier1Percent,
    tier2Percent,
    tier3Percent,
    tier4Percent,
  };
}

export async function createPlan(_prevState: PlanFormState, formData: FormData): Promise<PlanFormState> {
  await requireSession();

  const parsed = parsePlanForm(formData);
  if ('error' in parsed) return { error: parsed.error };

  try {
    await api.createPlan(parsed);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create plan' };
  }

  revalidatePath('/plans');
  return { success: true };
}

export async function updatePlan(
  id: string,
  _prevState: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  await requireSession();

  const parsed = parsePlanForm(formData);
  if ('error' in parsed) return { error: parsed.error };

  try {
    await api.updatePlan(id, parsed);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update plan' };
  }

  revalidatePath('/plans');
  return { success: true };
}

export async function setPlanActive(id: string, isActive: boolean): Promise<PlanFormState> {
  await requireSession();

  try {
    await api.updatePlan(id, { isActive });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update plan' };
  }

  revalidatePath('/plans');
  return { success: true };
}

export async function deletePlan(id: string): Promise<PlanFormState> {
  await requireSession();

  try {
    await api.deletePlan(id);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to delete plan' };
  }

  revalidatePath('/plans');
  return { success: true };
}

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireSession();

  const extraBottlePricePerUnit = Number(formData.get('extraBottlePricePerUnit'));

  if (!Number.isFinite(extraBottlePricePerUnit) || extraBottlePricePerUnit <= 0) {
    return { error: 'Extra bottle price must be a positive number' };
  }

  // Only this field — support contact is edited on /settings and referral settings on
  // /referrals, each by their own action, and PATCH /admin/settings is partial, so none of
  // these forms clobber each other's values.
  try {
    await api.updateSettings({ extraBottlePricePerUnit });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update settings' };
  }

  revalidatePath('/plans');
  return { success: true };
}
