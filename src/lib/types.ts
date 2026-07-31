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

export type PaymentStatus = 'created' | 'paid' | 'failed';
export type PaymentPurpose = 'subscription' | 'extra_bottles';
export type PaymentProvider = 'razorpay' | 'wallet';

export interface AdminPayment {
  id: string;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  provider: PaymentProvider;
  totalAmount: string;
  walletAmount: string;
  gatewayAmount: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    mobile: string;
  };
}

export type WalletTxnType = 'credit' | 'debit';
export type WalletTxnReason = 'referral_bonus' | 'platform_share' | 'wallet_redemption' | 'withdrawal';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTxnType;
  reason: WalletTxnReason;
  amount: string;
  balanceAfter: string;
  paymentId: string | null;
  note: string | null;
  createdAt: string;
}

export interface WalletSummary {
  balance: string;
  transactions: WalletTransaction[];
}

export interface PlatformSettings {
  id: number;
  referralDivisor: number;
  extraBottlePricePerUnit: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSettingsInput = Partial<{ referralDivisor: number; extraBottlePricePerUnit: number }>;

export interface ReferralLeaderboardRow {
  id: string;
  name: string | null;
  mobile: string;
  referralCode: string;
  referredCount: number;
  walletBalance: string;
  totalBonusEarned: string;
}

export type ExtraBottleOrderStatus = 'pending_payment' | 'paid' | 'failed' | 'cancelled';

export interface AdminExtraBottleOrder {
  id: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  status: ExtraBottleOrderStatus;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    mobile: string;
  };
}

export interface AdminAuditLog {
  id: string;
  actor: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: unknown;
  createdAt: string;
}
