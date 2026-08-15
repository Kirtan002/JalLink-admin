'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminRole, requireSession } from '@/lib/auth';
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

export interface DeliveryPartnerCommissionFormState {
  error?: string;
  success?: boolean;
}

export async function updateDeliveryPartnerCommissionSettings(
  _prevState: DeliveryPartnerCommissionFormState,
  formData: FormData,
): Promise<DeliveryPartnerCommissionFormState> {
  // This page isn't reachable by a manager at all (see proxy.ts), but the commission amounts
  // that fund a manager's own earnings shouldn't be editable by one even via a forged POST.
  await requireAdminRole();

  const partnerAmount = Number(formData.get('deliveryPartnerReferralPartnerAmount'));
  const managerAmount = Number(formData.get('deliveryPartnerReferralManagerAmount'));
  if (!Number.isFinite(partnerAmount) || partnerAmount < 0 || !Number.isFinite(managerAmount) || managerAmount < 0) {
    return { error: 'Both amounts must be zero or a positive number' };
  }

  try {
    await api.updateSettings({
      deliveryPartnerReferralPartnerAmount: partnerAmount,
      deliveryPartnerReferralManagerAmount: managerAmount,
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to update commission settings' };
  }

  revalidatePath('/settings');
  return { success: true };
}
