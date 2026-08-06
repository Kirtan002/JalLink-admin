'use client';

import { Badge } from './Badge';
import { useTranslations } from '@/lib/i18n/client';
import type {
  DeliveryPartnerKycStatus,
  DeliveryStatus,
  ExtraBottleOrderStatus,
  PaymentStatus,
  SubscriptionStatus,
} from '@/lib/types';
import type { NotificationStatus, ReportStatus } from '@/lib/mockData';

const SUBSCRIPTION_STATUS_TONE: Record<SubscriptionStatus, 'green' | 'slate' | 'blue' | 'amber'> = {
  active: 'green',
  paused: 'amber',
  cancelled: 'slate',
  completed: 'blue',
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const t = useTranslations();
  return <Badge tone={SUBSCRIPTION_STATUS_TONE[status]}>{t.status.subscription[status]}</Badge>;
}

const DELIVERY_STATUS_TONE: Record<DeliveryStatus, 'green' | 'slate' | 'amber' | 'red'> = {
  scheduled: 'slate',
  delivered: 'green',
  skipped: 'amber',
  cancelled: 'red',
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const t = useTranslations();
  return <Badge tone={DELIVERY_STATUS_TONE[status]}>{t.status.delivery[status]}</Badge>;
}

const PARTNER_KYC_STATUS_TONE: Record<DeliveryPartnerKycStatus, 'green' | 'slate' | 'amber' | 'red'> = {
  not_submitted: 'slate',
  pending: 'amber',
  approved: 'green',
  rejected: 'red',
};

/**
 * A partner has two states that both matter, and collapsing them into one badge loses the
 * distinction operations actually cares about: *suspended* means "verified, but stopped by
 * us", which is a different problem from "documents rejected". So suspension wins the badge
 * when it applies, and an unresolved KYC status is shown beside it.
 */
export function PartnerKycStatusBadge({
  status,
  isActive = true,
}: {
  status: DeliveryPartnerKycStatus;
  isActive?: boolean;
}) {
  const t = useTranslations();

  if (!isActive) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <Badge tone="red">{t.status.kyc.suspended}</Badge>
        {status !== 'approved' && (
          <span className="text-xs text-(--color-text-muted)">{t.status.kyc[status]}</span>
        )}
      </span>
    );
  }

  return <Badge tone={PARTNER_KYC_STATUS_TONE[status]}>{t.status.kyc[status]}</Badge>;
}

const PAYMENT_STATUS_TONE: Record<PaymentStatus, 'green' | 'slate' | 'amber' | 'red' | 'blue'> = {
  created: 'amber',
  paid: 'green',
  failed: 'red',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const t = useTranslations();
  return <Badge tone={PAYMENT_STATUS_TONE[status]}>{t.status.payment[status]}</Badge>;
}

const EXTRA_BOTTLE_ORDER_STATUS_TONE: Record<
  ExtraBottleOrderStatus,
  'green' | 'slate' | 'amber' | 'red' | 'blue'
> = {
  pending_payment: 'amber',
  paid: 'green',
  failed: 'red',
  cancelled: 'slate',
  delivered: 'blue',
};

export function ExtraBottleOrderStatusBadge({ status }: { status: ExtraBottleOrderStatus }) {
  const t = useTranslations();
  // 'delivered' exists on the backend enum but has no extra-bottle-specific wording; it means
  // the same thing as a completed delivery, so it borrows that label rather than rendering a
  // raw enum value.
  const label =
    status === 'delivered' ? t.status.delivery.delivered : t.status.extraBottleOrder[status];
  return <Badge tone={EXTRA_BOTTLE_ORDER_STATUS_TONE[status]}>{label}</Badge>;
}

const NOTIFICATION_STATUS_TONE: Record<NotificationStatus, 'green' | 'slate' | 'blue' | 'red'> = {
  sent: 'green',
  sending: 'blue',
  scheduled: 'slate',
  failed: 'red',
};

export function NotificationStatusBadge({ status }: { status: NotificationStatus }) {
  const t = useTranslations();
  return <Badge tone={NOTIFICATION_STATUS_TONE[status]}>{t.status.notification[status]}</Badge>;
}

const REPORT_STATUS_TONE: Record<ReportStatus, 'green' | 'blue' | 'red'> = {
  ready: 'green',
  processing: 'blue',
  failed: 'red',
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const t = useTranslations();
  return <Badge tone={REPORT_STATUS_TONE[status]}>{t.status.report[status]}</Badge>;
}
