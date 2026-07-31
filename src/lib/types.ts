export type SubscriptionStatus = 'active' | 'cancelled' | 'completed';
export type SubscriptionFrequency = 'daily' | 'alternate_days';
export type DeliveryStatus = 'scheduled' | 'delivered' | 'skipped' | 'cancelled';
export type DeliveryPartnerKycStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface Plan {
  id: string;
  name: string;
  durationDays: number;
  bottleSizeLtr: number;
  price: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanInput {
  name: string;
  durationDays: number;
  bottleSizeLtr: number;
  price: number;
  isActive?: boolean;
}

export type UpdatePlanInput = Partial<CreatePlanInput>;

export interface DeliveryPartner {
  id: string;
  name: string;
  mobile: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscription {
  id: string;
  frequency: SubscriptionFrequency;
  totalBottles: number;
  bottleSizeLtr: number;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    mobile: string;
  };
  plan: {
    id: string;
    name: string;
    durationDays: number;
    bottleSizeLtr: number;
    price: string;
  };
  address: {
    id: string;
    type: string;
    lineHouse: string;
    lineStreet: string;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryPartner: {
    id: string;
    name: string;
    mobile: string;
  } | null;
}

export interface Delivery {
  id: string;
  subscriptionId: string;
  sequenceNumber: number;
  scheduledDate: string;
  status: DeliveryStatus;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}
