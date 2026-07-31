'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

export interface CreatePartnerState {
  error?: string;
  success?: boolean;
}

export async function createDeliveryPartner(
  _prevState: CreatePartnerState,
  formData: FormData,
): Promise<CreatePartnerState> {
  await requireSession();

  const name = String(formData.get('name') ?? '').trim();
  const mobile = String(formData.get('mobile') ?? '').trim();

  if (!name || !mobile) {
    return { error: 'Name and mobile are both required' };
  }

  try {
    await api.createDeliveryPartner({ name, mobile });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create delivery partner' };
  }

  revalidatePath('/delivery-partners');
  revalidatePath('/');
  return { success: true };
}
