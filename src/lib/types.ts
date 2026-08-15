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

/** A customer's one-time, permanent choice between the two earning models. Null until set. */
export type ProgramSelection = 'discount' | 'referral';

/** Ground floor + 1st floor vs everything above — admin maintains a fully separate plan
 * catalog per category (Plan.floorCategory), and every address records which one it needs
 * (Address.floorType). */
export type FloorCategory = 'ground_plus_one' | 'higher_floors';

export interface Plan {
  id: string;
  name: string;
  durationDays: number;
  bottleSizeLtr: number;
  price: string;
  floorCategory: FloorCategory;
  /** Discount-program tier percent this plan gives on a buyer's Nth-ever subscription
   * purchase — tier4Percent is the permanent steady-state rate from the 4th purchase on. */
  tier1Percent: string;
  tier2Percent: string;
  tier3Percent: string;
  tier4Percent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanInput {
  name: string;
  durationDays: number;
  bottleSizeLtr: number;
  price: number;
  floorCategory: FloorCategory;
  tier1Percent: number;
  tier2Percent: number;
  tier3Percent: number;
  tier4Percent: number;
  isActive?: boolean;
}

export type UpdatePlanInput = Partial<CreatePlanInput>;

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  lineHouse: string;
  lineStreet: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  /** 1-50, as entered in the app; 1 is the combined "Ground + 1" option. Source of truth
   * for floorType — the customer never picks the category directly. */
  floor: number;
  /** Always server-derived from `floor` (floor <= 1 -> ground_plus_one, else higher_floors). */
  floorType: FloorCategory;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPartner {
  id: string;
  /** Null between self-signup and the first KYC submission, which is what sets it. */
  name: string | null;
  mobile: string;
  /** This partner's own code — a customer enters it at checkout to attribute a purchase to
   * them (and, if managerId is set, to their manager). Independent of the user-to-user
   * referral-links program. */
  referralCode: string;
  /** Set only when this partner was created from a manager's own portal — null for
   * self-signups and admin-created partners. */
  managerId: string | null;
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
  /** Pricing snapshot, frozen at purchase time — see modules/subscriptions in the backend. */
  basePrice: string;
  discountTier: number | null;
  discountPercent: string;
  discountAmount: string;
  finalPrice: string;
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
    programSelection: ProgramSelection | null;
  };
  plan: {
    id: string;
    name: string;
    durationDays: number;
    bottleSizeLtr: number;
    price: string;
    floorCategory: FloorCategory;
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
    floor: number;
    floorType: FloorCategory;
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
  | 'delivery_commission'
  | 'referral_payout';

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
  /** Percent of a code owner's purchase price paid to EACH of their holders (not split). */
  referralRewardPercent: string;
  /** Max distinct holders a single code owner can have. */
  referralMaxGivers: number;
  /** Max distinct owners' codes a single holder can enter. */
  referralMaxEntries: number;
  extraBottlePricePerUnit: string | null;
  /** Flat ₹ paid to a delivery partner when a buyer enters that partner's own referralCode at
   * checkout — always paid. Independent of referralRewardPercent above (a different program). */
  deliveryPartnerReferralPartnerAmount: string;
  /** Flat ₹ paid to that partner's manager on the same event — only when the partner has one. */
  deliveryPartnerReferralManagerAmount: string;
  supportMobile: string | null;
  supportEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSettingsInput = Partial<{
  referralRewardPercent: number;
  referralMaxGivers: number;
  referralMaxEntries: number;
  extraBottlePricePerUnit: number;
  deliveryPartnerReferralPartnerAmount: number;
  deliveryPartnerReferralManagerAmount: number;
  /** '' clears the stored value. */
  supportMobile: string;
  supportEmail: string;
}>;

/** One payment that redeemed a delivery partner's own referralCode — see
 * DeliveryPartner.referralCode. A manager only sees payouts attributed to them; admin sees all. */
export interface DeliveryPartnerReferralPayout {
  id: string;
  referralCode: string;
  partnerAmount: string;
  managerAmount: string;
  paymentId: string;
  subscriptionId: string | null;
  createdAt: string;
  deliveryPartner: { id: string; name: string | null; mobile: string };
  manager: { id: string; name: string; username: string } | null;
  buyer: { id: string; name: string | null; mobile: string };
}

/** LEGACY (single-referrer program, frozen) — see ReferralLinkLeaderboardRow for the current program. */
export interface ReferralLeaderboardRow {
  id: string;
  name: string | null;
  mobile: string;
  referralCode: string;
  referredCount: number;
  walletBalance: string;
  totalBonusEarned: string;
}

export interface ReferralPeer {
  id: string;
  name: string | null;
  mobile: string;
}

/** A holder/owner edge in the current referral-links program — the holder earns a share
 * whenever the owner buys a plan (reversed from the old referrer/referred relationship). */
export interface ReferralLink {
  id: string;
  referralCode: string;
  createdAt: string;
  owner: ReferralPeer;
  holder: ReferralPeer;
}

export type ReferralPayoutStatus = 'pending' | 'credited' | 'reversed';

/** One row per (payment, link) a purchase actually paid out — a single purchase can fund up
 * to referralMaxGivers payouts at once (one per holder of the buyer's code). */
export interface ReferralPayout {
  id: string;
  status: ReferralPayoutStatus;
  rewardAmount: string;
  rewardPercent: string;
  creditedAt: string | null;
  reversedAt: string | null;
  reversalReason: string | null;
  paymentId: string;
  subscriptionId: string | null;
  createdAt: string;
  owner: ReferralPeer;
  holder: ReferralPeer;
}

export interface ReferralLinkLeaderboardRow {
  id: string;
  name: string | null;
  mobile: string;
  referralCode: string;
  holdersCount: number;
  totalPayoutsTriggered: string;
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

/** 'admin' is full access; 'manager' is the same account shape with intentionally limited
 * access — see jallink-auth-service's db/schema.ts adminRoleEnum. */
export type AdminRole = 'admin' | 'manager';

export interface AdminProfile {
  id: string;
  name: string;
  username: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginResult {
  admin: AdminProfile;
  accessToken: string;
}

export interface CreateAdminStaffInput {
  name: string;
  username: string;
  password: string;
  role: AdminRole;
}

export type UpdateAdminStaffInput = Partial<{
  name: string;
  password: string;
  role: AdminRole;
  isActive: boolean;
}>;
