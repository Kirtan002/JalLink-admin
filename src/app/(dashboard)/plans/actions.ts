'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

export interface PlanFormState {
  error?: string;
  success?: boolean;
}

function parsePlanForm(
  formData: FormData,
): { name: string; durationDays: number; bottleSizeLtr: number; price: number } | { error: string } {
  const name = String(formData.get('name') ?? '').trim();
  const durationDays = Number(formData.get('durationDays'));
  const bottleSizeLtr = Number(formData.get('bottleSizeLtr'));
  const price = Number(formData.get('price'));

  if (!name) return { error: 'Name is required' };
  if (!Number.isInteger(durationDays) || durationDays <= 0) {
    return { error: 'Duration must be a positive whole number' };
  }
  if (!Number.isInteger(bottleSizeLtr) || bottleSizeLtr <= 0) {
    return { error: 'Bottle size must be a positive whole number' };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { error: 'Price must be a positive number' };
  }

  return { name, durationDays, bottleSizeLtr, price };
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
