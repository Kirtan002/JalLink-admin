'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

export interface SupportFormState {
  error?: string;
  success?: boolean;
}

export async function updateSupportContact(
  _prevState: SupportFormState,
  formData: FormData,
): Promise<SupportFormState> {
  await requireSession();

  // Sent through even when empty — '' is how the backend is told to clear a field.
  const supportMobile = String(formData.get('supportMobile') ?? '').trim();
  const supportEmail = String(formData.get('supportEmail') ?? '').trim();

  if (supportEmail !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    return { error: 'Support email must be a valid email address' };
  }

  try {
    await api.updateSettings({ supportMobile, supportEmail });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update support contact' };
  }

  revalidatePath('/settings');
  return { success: true };
}
