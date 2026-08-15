'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminRole } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { getDictionary } from '@/lib/i18n/server';
import type { AdminRole } from '@/lib/types';

export interface CreateManagerState {
  error?: string;
  success?: boolean;
}

function isAdminRole(value: string): value is AdminRole {
  return value === 'admin' || value === 'manager';
}

export async function createManager(
  _prevState: CreateManagerState,
  formData: FormData,
): Promise<CreateManagerState> {
  // Only an 'admin' may reach this — proxy.ts already keeps a manager off /managers
  // entirely, this is what stops a forged POST straight at the action.
  await requireAdminRole();
  const t = await getDictionary();

  const name = String(formData.get('name') ?? '').trim();
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const rawRole = String(formData.get('role') ?? 'manager');
  const role = isAdminRole(rawRole) ? rawRole : 'manager';

  if (!name || !username || !password) {
    return { error: t.managers.fieldsRequired };
  }

  try {
    await api.createAdminStaff({ name, username, password, role });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : t.managers.createFailed };
  }

  revalidatePath('/managers');
  return { success: true };
}

export interface UpdateManagerStatusState {
  error?: string;
  success?: boolean;
}

export async function updateManagerStatus(
  id: string,
  isActive: boolean,
  _prevState: UpdateManagerStatusState,
  _formData: FormData,
): Promise<UpdateManagerStatusState> {
  await requireAdminRole();
  const t = await getDictionary();

  try {
    await api.updateAdminStaff(id, { isActive });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : t.managers.actionFailed };
  }

  revalidatePath('/managers');
  return { success: true };
}
