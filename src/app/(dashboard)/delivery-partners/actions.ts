'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { getDictionary } from '@/lib/i18n/server';

export interface CreatePartnerState {
  error?: string;
  success?: boolean;
}

export interface WithdrawPartnerWalletState {
  error?: string;
  success?: boolean;
}

export interface KycReviewState {
  error?: string;
  success?: boolean;
}

/** Both partner screens read the same data, and the dashboard counts pending KYC, so every
 * decision has to invalidate all three. */
function revalidatePartnerViews(partnerId?: string): void {
  revalidatePath('/delivery-partners');
  if (partnerId) {
    revalidatePath(`/delivery-partners/${partnerId}`);
  }
  revalidatePath('/');
}

export async function createDeliveryPartner(
  _prevState: CreatePartnerState,
  formData: FormData,
): Promise<CreatePartnerState> {
  await requireSession();
  const t = await getDictionary();

  const name = String(formData.get('name') ?? '').trim();
  const mobile = String(formData.get('mobile') ?? '').trim();

  if (!name || !mobile) {
    return { error: t.deliveryPartners.nameAndMobileRequired };
  }

  try {
    await api.createDeliveryPartner({ name, mobile });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : t.deliveryPartners.createFailed };
  }

  revalidatePartnerViews();
  return { success: true };
}

export async function withdrawDeliveryPartnerWallet(
  partnerId: string,
  _prevState: WithdrawPartnerWalletState,
  formData: FormData,
): Promise<WithdrawPartnerWalletState> {
  await requireSession();
  const t = await getDictionary();

  const amount = Number(formData.get('amount'));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: t.deliveryPartners.amountPositive };
  }

  try {
    await api.withdrawDeliveryPartnerWallet(partnerId, { amount });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : t.deliveryPartners.withdrawFailed };
  }

  revalidatePartnerViews(partnerId);
  return { success: true };
}

export async function approvePartnerKyc(
  partnerId: string,
  _prevState: KycReviewState,
  formData: FormData,
): Promise<KycReviewState> {
  await requireSession();
  const t = await getDictionary();

  const note = String(formData.get('note') ?? '').trim();

  try {
    await api.approvePartnerKyc(partnerId, note || undefined);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : t.deliveryPartners.actionFailed };
  }

  revalidatePartnerViews(partnerId);
  return { success: true };
}

/**
 * The reason is checked here as well as on the server. Not because a second check adds
 * safety — it doesn't — but because a rejection is the one action whose text reaches a real
 * person, and catching "no" before the round-trip is the moment the admin still has the
 * context to write something the partner can act on.
 */
export async function rejectPartnerKyc(
  partnerId: string,
  _prevState: KycReviewState,
  formData: FormData,
): Promise<KycReviewState> {
  await requireSession();
  const t = await getDictionary();

  const reason = String(formData.get('reason') ?? '').trim();
  if (reason.length < 10) {
    return { error: t.deliveryPartners.rejectionReasonRequired };
  }

  try {
    await api.rejectPartnerKyc(partnerId, reason);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : t.deliveryPartners.actionFailed };
  }

  revalidatePartnerViews(partnerId);
  return { success: true };
}

export async function updatePartnerStatus(
  partnerId: string,
  isActive: boolean,
  _prevState: KycReviewState,
  formData: FormData,
): Promise<KycReviewState> {
  await requireSession();
  const t = await getDictionary();

  const note = String(formData.get('note') ?? '').trim();

  try {
    await api.updatePartnerStatus(partnerId, isActive, note || undefined);
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : t.deliveryPartners.actionFailed };
  }

  revalidatePartnerViews(partnerId);
  return { success: true };
}
