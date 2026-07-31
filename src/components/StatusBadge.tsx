import { Badge } from './Badge';
import type {
  DeliveryPartnerKycStatus,
  DeliveryStatus,
  ExtraBottleOrderStatus,
  PaymentStatus,
  SubscriptionStatus,
} from '@/lib/types';
import type { NotificationStatus, ReportStatus } from '@/lib/mockData';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const SUBSCRIPTION_STATUS_TONE: Record<SubscriptionStatus, 'green' | 'slate' | 'blue'> = {
  active: 'green',
  cancelled: 'slate',
  completed: 'blue',
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge tone={SUBSCRIPTION_STATUS_TONE[status]}>{capitalize(status)}</Badge>;
}

const DELIVERY_STATUS_TONE: Record<DeliveryStatus, 'green' | 'slate' | 'amber' | 'red'> = {
  scheduled: 'slate',
  delivered: 'green',
  skipped: 'amber',
  cancelled: 'red',
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return <Badge tone={DELIVERY_STATUS_TONE[status]}>{capitalize(status)}</Badge>;
}

const PARTNER_KYC_STATUS_TONE: Record<DeliveryPartnerKycStatus, 'green' | 'slate' | 'amber' | 'red'> = {
  pending: 'amber',
  active: 'green',
  suspended: 'red',
  rejected: 'slate',
};

export function PartnerKycStatusBadge({ status }: { status: DeliveryPartnerKycStatus }) {
  return <Badge tone={PARTNER_KYC_STATUS_TONE[status]}>{capitalize(status)}</Badge>;
}

const PAYMENT_STATUS_TONE: Record<PaymentStatus, 'green' | 'slate' | 'amber' | 'red' | 'blue'> = {
  created: 'amber',
  paid: 'green',
  failed: 'red',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_STATUS_TONE[status]}>{capitalize(status)}</Badge>;
}

const EXTRA_BOTTLE_ORDER_STATUS_TONE: Record<ExtraBottleOrderStatus, 'green' | 'slate' | 'amber' | 'red'> = {
  pending_payment: 'amber',
  paid: 'green',
  failed: 'red',
  cancelled: 'slate',
};

export function ExtraBottleOrderStatusBadge({ status }: { status: ExtraBottleOrderStatus }) {
  return <Badge tone={EXTRA_BOTTLE_ORDER_STATUS_TONE[status]}>{capitalize(status.replace('_', ' '))}</Badge>;
}

const NOTIFICATION_STATUS_TONE: Record<NotificationStatus, 'green' | 'slate' | 'blue' | 'red'> = {
  sent: 'green',
  sending: 'blue',
  scheduled: 'slate',
  failed: 'red',
};

export function NotificationStatusBadge({ status }: { status: NotificationStatus }) {
  return <Badge tone={NOTIFICATION_STATUS_TONE[status]}>{capitalize(status)}</Badge>;
}

const REPORT_STATUS_TONE: Record<ReportStatus, 'green' | 'blue' | 'red'> = {
  ready: 'green',
  processing: 'blue',
  failed: 'red',
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge tone={REPORT_STATUS_TONE[status]}>{capitalize(status)}</Badge>;
}
