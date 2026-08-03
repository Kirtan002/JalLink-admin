import type {
  AdminAuditLog,
  AdminExtraBottleOrder,
  AdminPayment,
  AdminSubscription,
  CreatePlanInput,
  Delivery,
  DeliveryPartner,
  PaymentPurpose,
  PaymentStatus,
  Plan,
  PaymentConfig,
  PlatformSettings,
  ReferralLeaderboardRow,
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

  listDeliveryPartners: () => apiFetch<DeliveryPartner[]>('/admin/delivery-partners'),
  createDeliveryPartner: (input: { name: string; mobile: string }) =>
    apiFetch<DeliveryPartner>('/admin/delivery-partners', {
      method: 'POST',
      body: JSON.stringify(input),
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

  listReferrals: () => apiFetch<ReferralLeaderboardRow[]>('/admin/referrals'),

  listExtraBottleOrders: () => apiFetch<AdminExtraBottleOrder[]>('/admin/extra-bottle-orders'),

  listAuditLogs: () => apiFetch<AdminAuditLog[]>('/admin/logs'),

  /** Public endpoint — tells us whether the API is pointed at Razorpay test or live keys. */
  getPaymentConfig: () => apiFetch<PaymentConfig>('/payments/config'),
};
