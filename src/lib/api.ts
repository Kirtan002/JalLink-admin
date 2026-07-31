import type {
  AdminSubscription,
  CreatePlanInput,
  Delivery,
  DeliveryPartner,
  Plan,
  SubscriptionStatus,
  UpdatePlanInput,
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
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
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

  listSubscriptions: (status?: SubscriptionStatus) =>
    apiFetch<AdminSubscription[]>(`/admin/subscriptions${status ? `?status=${status}` : ''}`),
  getSubscription: (id: string) => apiFetch<AdminSubscription>(`/admin/subscriptions/${id}`),
  listSubscriptionDeliveries: (id: string) => apiFetch<Delivery[]>(`/admin/subscriptions/${id}/deliveries`),
  assignDeliveryPartner: (id: string, deliveryPartnerId: string) =>
    apiFetch<AdminSubscription>(`/admin/subscriptions/${id}/delivery-partner`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveryPartnerId }),
    }),
};
