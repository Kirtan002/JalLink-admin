export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'completed';
export type SubscriptionFrequency = 'daily' | 'alternate_days';
export type DeliveryStatus = 'scheduled' | 'delivered' | 'skipped' | 'cancelled';
/** Mirrors the backend enum exactly. `approved` is about the *documents*; whether the
 * partner is currently allowed to work is `isActive`, which is a separate lever. */
export type DeliveryPartnerKycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export type KycDocumentType =
  | 'aadhaar_front'
  | 'aadhaar_back'
  | 'pan'
  | 'driving_licence'
  | 'vehicle_rc'
  | 'selfie';

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
  /** Null between self-signup and the first KYC submission, which is what sets it. */
  name: string | null;
  mobile: string;
  isActive: boolean;
  kycStatus: DeliveryPartnerKycStatus;
  kycSubmittedAt: string | null;
  kycReviewedAt: string | null;
  kycReviewedBy: string | null;
  kycRejectionReason: string | null;
  /** >1 means the partner was rejected at least once and submitted again. */
  kycSubmissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KycDocument {
  id: string;
  type: KycDocumentType;
  label: string;
  documentNumber: string | null;
  fileUrl: string;
  submissionNumber: number;
  /** False for files belonging to an earlier, already-rejected round. */
  isCurrentSubmission: boolean;
  uploadedAt: string;
}

export interface KycEvent {
  fromStatus: DeliveryPartnerKycStatus | null;
  toStatus: DeliveryPartnerKycStatus;
  actorType: 'delivery_partner' | 'admin';
  note: string | null;
  submissionNumber: number | null;
  createdAt: string;
}

/** The review packet from GET /admin/delivery-partners/:id — identity numbers unmasked,
 * every submission round's documents, and the decision history. */
export interface DeliveryPartnerDetail extends DeliveryPartner {
  fullName: string | null;
  dob: string | null;
  address: string | null;
  aadhaarNumber: string | null;
  panNumber: string | null;
  documents: KycDocument[];
  history: KycEvent[];
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
  pausedAt: string | null;
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
export type WalletTxnReason =
  | 'referral_bonus'
  | 'platform_share'
  | 'wallet_redemption'
  | 'withdrawal'
  | 'referral_reversal'
  | 'delivery_commission';

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

export type RazorpayMode = 'test' | 'live';

/** From the public GET /payments/config — derived server-side from the Razorpay key prefix. */
export interface PaymentConfig {
  mode: RazorpayMode;
  keyId: string;
}

export interface PlatformSettings {
  id: number;
  referralDivisor: number;
  extraBottlePricePerUnit: string | null;
  supportMobile: string | null;
  supportEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSettingsInput = Partial<{
  referralDivisor: number;
  extraBottlePricePerUnit: number;
  /** '' clears the stored value. */
  supportMobile: string;
  supportEmail: string;
}>;

export interface ReferralLeaderboardRow {
  id: string;
  name: string | null;
  mobile: string;
  referralCode: string;
  referredCount: number;
  walletBalance: string;
  totalBonusEarned: string;
}

export type ExtraBottleOrderStatus = 'pending_payment' | 'paid' | 'failed' | 'cancelled' | 'delivered';

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
