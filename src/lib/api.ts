import type {
  AdminAuditLog,
  AdminExtraBottleOrder,
  AdminPayment,
  AdminSubscription,
  CreatePlanInput,
  Delivery,
  DeliveryPartner,
  DeliveryPartnerDetail,
  DeliveryPartnerKycStatus,
  PaymentPurpose,
  PaymentStatus,
  Plan,
  PaymentConfig,
  PlatformSettings,
  ReferralLeaderboardRow,
  ReferralLink,
  ReferralLinkLeaderboardRow,
  ReferralPayout,
  SubscriptionStatus,
  UpdatePlanInput,
  UpdateSettingsInput,
  WalletSummary,
} from './types';

const API_BASE_URL = process.env.API_BASE_URL ?? 'https://jallink-backend.onrender.com';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? 'GET';
  const url = `${API_BASE_URL}${path}`;
  // Runs server-side (Server Components/Actions) — shows up in your `next dev`/`next start`
  // terminal, not the browser console. Exactly what backend URL each admin call is hitting.
  console.log(`[api] ${method} ${url}`);

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      // Attributes /admin/* writes to a name in the backend's audit log — not auth, just
      // the one shared ADMIN_USERNAME this panel logs in with (see lib/session.ts).
      'X-Admin-Actor': process.env.ADMIN_USERNAME ?? 'unknown',
      // The actual gate on /admin/*. Optional here because a development backend started
      // without ADMIN_API_KEY leaves those routes open; a production backend refuses to boot
      // without one, so an unset value there turns every admin call into a 401.
      ...(process.env.ADMIN_API_KEY ? { 'X-Admin-Key': process.env.ADMIN_API_KEY } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    let code = 'UNKNOWN_ERROR';
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? message;
      }
    } catch {
      // response body wasn't JSON — fall back to the generic message above
    }
    console.error(`[api] ${method} ${url} -> ${res.status} ${code}: ${message}`);
    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  listPlans: () => apiFetch<Plan[]>('/plans'),

  listAdminPlans: () => apiFetch<Plan[]>('/admin/plans'),
  createPlan: (input: CreatePlanInput) =>
    apiFetch<Plan>('/admin/plans', { method: 'POST', body: JSON.stringify(input) }),
  updatePlan: (id: string, input: UpdatePlanInput) =>
    apiFetch<Plan>(`/admin/plans/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deletePlan: (id: string) => apiFetch<void>(`/admin/plans/${id}`, { method: 'DELETE' }),

  listDeliveryPartners: (kycStatus?: DeliveryPartnerKycStatus) =>
    apiFetch<DeliveryPartner[]>(
      `/admin/delivery-partners${kycStatus ? `?kycStatus=${kycStatus}` : ''}`,
    ),
  getDeliveryPartner: (id: string) =>
    apiFetch<DeliveryPartnerDetail>(`/admin/delivery-partners/${id}`),
  createDeliveryPartner: (input: { name: string; mobile: string }) =>
    apiFetch<DeliveryPartner>('/admin/delivery-partners', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  /** KYC review. `reason` is required on rejection — the backend rejects anything shorter
   * than 10 characters, because the partner is shown it verbatim and has to act on it. */
  approvePartnerKyc: (id: string, note?: string) =>
    apiFetch<DeliveryPartnerDetail>(`/admin/delivery-partners/${id}/kyc/approve`, {
      method: 'POST',
      body: JSON.stringify(note ? { note } : {}),
    }),
  rejectPartnerKyc: (id: string, reason: string) =>
    apiFetch<DeliveryPartnerDetail>(`/admin/delivery-partners/${id}/kyc/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  /** Suspend / reinstate — independent of the KYC decision. */
  updatePartnerStatus: (id: string, isActive: boolean, note?: string) =>
    apiFetch<DeliveryPartnerDetail>(`/admin/delivery-partners/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive, ...(note ? { note } : {}) }),
    }),
  getDeliveryPartnerWallet: (id: string) =>
    apiFetch<WalletSummary>(`/admin/delivery-partners/${id}/wallet`),
  withdrawDeliveryPartnerWallet: (id: string, input: { amount: number; note?: string }) =>
    apiFetch<{ balance: string }>(`/admin/delivery-partners/${id}/wallet/withdraw`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  listSubscriptions: (status?: SubscriptionStatus) =>
    apiFetch<AdminSubscription[]>(`/admin/subscriptions${status ? `?status=${status}` : ''}`),
  getSubscription: (id: string) => apiFetch<AdminSubscription>(`/admin/subscriptions/${id}`),
  listSubscriptionDeliveries: (id: string) => apiFetch<Delivery[]>(`/admin/subscriptions/${id}/deliveries`),
  assignDeliveryPartner: (id: string, deliveryPartnerId: string) =>
    apiFetch<AdminSubscription>(`/admin/subscriptions/${id}/delivery-partner`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveryPartnerId }),
    }),

  getSettings: () => apiFetch<PlatformSettings>('/admin/settings'),
  updateSettings: (input: UpdateSettingsInput) =>
    apiFetch<PlatformSettings>('/admin/settings', { method: 'PATCH', body: JSON.stringify(input) }),

  listPayments: (params?: { status?: PaymentStatus; purpose?: PaymentPurpose }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.purpose) query.set('purpose', params.purpose);
    const qs = query.toString();
    return apiFetch<AdminPayment[]>(`/admin/payments${qs ? `?${qs}` : ''}`);
  },

  getAdminWallet: () => apiFetch<WalletSummary>('/admin/wallet'),
  withdrawAdminWallet: (input: { amount: number; note?: string }) =>
    apiFetch<{ balance: string }>('/admin/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // LEGACY single-referrer program — frozen, historical data only.
  listReferrals: () => apiFetch<ReferralLeaderboardRow[]>('/admin/referrals'),

  // Current referral-links program.
  listReferralLinks: (params?: { ownerUserId?: string; holderUserId?: string }) => {
    const query = new URLSearchParams();
    if (params?.ownerUserId) query.set('ownerUserId', params.ownerUserId);
    if (params?.holderUserId) query.set('holderUserId', params.holderUserId);
    const qs = query.toString();
    return apiFetch<ReferralLink[]>(`/admin/referrals/links${qs ? `?${qs}` : ''}`);
  },
  listReferralLinkLeaderboard: () =>
    apiFetch<ReferralLinkLeaderboardRow[]>('/admin/referrals/links-leaderboard'),
  listReferralPayouts: () => apiFetch<ReferralPayout[]>('/admin/referrals/payouts'),
  reverseReferralPayout: (id: string, reason: string) =>
    apiFetch<ReferralPayout>(`/admin/referrals/payouts/${id}/reverse`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  listExtraBottleOrders: () => apiFetch<AdminExtraBottleOrder[]>('/admin/extra-bottle-orders'),

  listAuditLogs: () => apiFetch<AdminAuditLog[]>('/admin/logs'),

  /** Public endpoint — tells us whether the API is pointed at Razorpay test or live keys. */
  getPaymentConfig: () => apiFetch<PaymentConfig>('/payments/config'),
};
