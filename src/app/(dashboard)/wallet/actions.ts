'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

export interface WithdrawFormState {
  error?: string;
  success?: boolean;
}

export async function withdrawAdminWallet(
  _prevState: WithdrawFormState,
  formData: FormData,
): Promise<WithdrawFormState> {
  await requireSession();

  const amount = Number(formData.get('amount'));
  const note = String(formData.get('note') ?? '').trim() || undefined;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Amount must be a positive number' };
  }

  try {
    await api.withdrawAdminWallet({ amount, note });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to withdraw' };
  }

  revalidatePath('/wallet');
  return { success: true };
}
