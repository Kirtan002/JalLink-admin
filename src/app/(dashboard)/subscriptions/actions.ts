'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

export interface AssignPartnerState {
  error?: string;
  success?: boolean;
}

export async function assignDeliveryPartner(
  subscriptionId: string,
  _prevState: AssignPartnerState,
  formData: FormData,
): Promise<AssignPartnerState> {
  await requireSession();

  const deliveryPartnerId = String(formData.get('deliveryPartnerId') ?? '');
  if (!deliveryPartnerId) {
    return { error: 'Choose a delivery partner' };
  }

  try {
    await api.assignDeliveryPartner(subscriptionId, deliveryPartnerId);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to assign delivery partner' };
  }

  revalidatePath(`/subscriptions/${subscriptionId}`);
  revalidatePath('/subscriptions');
  revalidatePath('/');
  return { success: true };
}
