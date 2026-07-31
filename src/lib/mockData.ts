// Sample data for modules that aren't backed by a live API yet.
// Every page here is a UI preview — swap the array for an `api.*` call once
// the corresponding backend endpoint exists, following the pattern in `api.ts`.

import type { DeliveryStatus } from './types';

export interface MockDelivery {
  id: string;
  customerName: string;
  planName: string;
  partnerName: string | null;
  status: DeliveryStatus;
  scheduledDate: string;
}

export const MOCK_DELIVERIES: MockDelivery[] = [
  { id: 'DLV-10412', customerName: 'Rohan Mehta', planName: 'Daily Basic', partnerName: 'Suresh Kumar', status: 'delivered', scheduledDate: '2026-07-31' },
  { id: 'DLV-10413', customerName: 'Aditi Sharma', planName: 'Family Monthly', partnerName: 'Ravi Patil', status: 'delivered', scheduledDate: '2026-07-31' },
  { id: 'DLV-10414', customerName: 'Kabir Nair', planName: 'Alternate Day Saver', partnerName: null, status: 'scheduled', scheduledDate: '2026-07-31' },
  { id: 'DLV-10415', customerName: 'Sneha Iyer', planName: 'Office Bulk', partnerName: 'Anil Yadav', status: 'scheduled', scheduledDate: '2026-07-31' },
  { id: 'DLV-10396', customerName: 'Arjun Verma', planName: 'Daily Basic', partnerName: 'Suresh Kumar', status: 'skipped', scheduledDate: '2026-07-30' },
  { id: 'DLV-10381', customerName: 'Priya Desai', planName: 'Family Monthly', partnerName: 'Ravi Patil', status: 'delivered', scheduledDate: '2026-07-29' },
  { id: 'DLV-10370', customerName: 'Vikram Rao', planName: 'Alternate Day Saver', partnerName: 'Anil Yadav', status: 'cancelled', scheduledDate: '2026-07-28' },
  { id: 'DLV-10358', customerName: 'Ishita Kapoor', planName: 'Office Bulk', partnerName: 'Suresh Kumar', status: 'delivered', scheduledDate: '2026-07-27' },
];

export type WalletEntryType = 'credit' | 'debit';

export interface WalletEntry {
  id: string;
  partnerName: string;
  type: WalletEntryType;
  amount: number;
  reason: string;
  balanceAfter: number;
  occurredAt: string;
}

export const MOCK_WALLET_ENTRIES: WalletEntry[] = [
  { id: 'WAL-58831', partnerName: 'Suresh Kumar', type: 'credit', amount: 420, reason: 'Delivery payout — 21 Jul batch', balanceAfter: 3180, occurredAt: '2026-07-31T09:12:00Z' },
  { id: 'WAL-58830', partnerName: 'Ravi Patil', type: 'debit', amount: 2500, reason: 'Weekly payout transfer', balanceAfter: 640, occurredAt: '2026-07-30T18:40:00Z' },
  { id: 'WAL-58822', partnerName: 'Anil Yadav', type: 'credit', amount: 360, reason: 'Delivery payout — 20 Jul batch', balanceAfter: 3140, occurredAt: '2026-07-30T09:05:00Z' },
  { id: 'WAL-58810', partnerName: 'Suresh Kumar', type: 'credit', amount: 480, reason: 'Delivery payout — 20 Jul batch', balanceAfter: 2760, occurredAt: '2026-07-29T09:00:00Z' },
  { id: 'WAL-58799', partnerName: 'Ravi Patil', type: 'debit', amount: 150, reason: 'Adjustment — missed delivery penalty', balanceAfter: 3140, occurredAt: '2026-07-28T14:22:00Z' },
  { id: 'WAL-58784', partnerName: 'Anil Yadav', type: 'credit', amount: 400, reason: 'Delivery payout — 19 Jul batch', balanceAfter: 2780, occurredAt: '2026-07-28T09:10:00Z' },
];

export interface CommissionTier {
  id: string;
  name: string;
  ratePercent: number;
  partnerCount: number;
  isActive: boolean;
}

export const MOCK_COMMISSION_TIERS: CommissionTier[] = [
  { id: 'CMT-1', name: 'Standard', ratePercent: 8, partnerCount: 14, isActive: true },
  { id: 'CMT-2', name: 'Silver (500+ deliveries/mo)', ratePercent: 10, partnerCount: 6, isActive: true },
  { id: 'CMT-3', name: 'Gold (1000+ deliveries/mo)', ratePercent: 12, partnerCount: 2, isActive: true },
  { id: 'CMT-4', name: 'Legacy flat rate', ratePercent: 6, partnerCount: 0, isActive: false },
];

export type PaymentStatus = 'success' | 'failed' | 'pending' | 'refunded';

export interface PaymentTransaction {
  id: string;
  customerName: string;
  type: 'Subscription payment' | 'Renewal' | 'Refund';
  amount: number;
  status: PaymentStatus;
  occurredAt: string;
}

export const MOCK_PAYMENTS: PaymentTransaction[] = [
  { id: 'TXN-88231', customerName: 'Rohan Mehta', type: 'Subscription payment', amount: 899, status: 'success', occurredAt: '2026-07-31T08:05:00Z' },
  { id: 'TXN-88229', customerName: 'Sneha Iyer', type: 'Renewal', amount: 1499, status: 'success', occurredAt: '2026-07-31T07:40:00Z' },
  { id: 'TXN-88214', customerName: 'Kabir Nair', type: 'Subscription payment', amount: 649, status: 'pending', occurredAt: '2026-07-30T19:02:00Z' },
  { id: 'TXN-88190', customerName: 'Priya Desai', type: 'Subscription payment', amount: 1499, status: 'failed', occurredAt: '2026-07-30T11:18:00Z' },
  { id: 'TXN-88177', customerName: 'Vikram Rao', type: 'Refund', amount: 649, status: 'refunded', occurredAt: '2026-07-29T15:47:00Z' },
  { id: 'TXN-88150', customerName: 'Ishita Kapoor', type: 'Renewal', amount: 899, status: 'success', occurredAt: '2026-07-29T09:33:00Z' },
];

export type ReferralStatus = 'pending' | 'rewarded' | 'expired';

export interface Referral {
  id: string;
  referrerName: string;
  code: string;
  referredName: string;
  reward: string;
  status: ReferralStatus;
}

export const MOCK_REFERRALS: Referral[] = [
  { id: 'REF-4021', referrerName: 'Rohan Mehta', code: 'ROHAN200', referredName: 'Manish Gupta', reward: '₹200 credit', status: 'rewarded' },
  { id: 'REF-4020', referrerName: 'Aditi Sharma', code: 'ADITI200', referredName: 'Neha Joshi', reward: '₹200 credit', status: 'pending' },
  { id: 'REF-4014', referrerName: 'Arjun Verma', code: 'ARJUN200', referredName: 'Divya Menon', reward: '₹200 credit', status: 'rewarded' },
  { id: 'REF-3998', referrerName: 'Priya Desai', code: 'PRIYA200', referredName: 'Karan Malhotra', reward: '₹200 credit', status: 'expired' },
];

export type NotificationStatus = 'sent' | 'sending' | 'scheduled' | 'failed';

export interface NotificationCampaign {
  id: string;
  campaign: string;
  audience: string;
  sent: number;
  delivered: number;
  status: NotificationStatus;
}

export const MOCK_NOTIFICATIONS: NotificationCampaign[] = [
  { id: 'CMP-1183', campaign: "Today's delivery reminder", audience: 'Active subscribers', sent: 214, delivered: 208, status: 'sent' },
  { id: 'CMP-1182', campaign: 'Renewal due in 3 days', audience: 'Expiring this week', sent: 38, delivered: 35, status: 'sent' },
  { id: 'CMP-1181', campaign: 'Monsoon delivery delay notice', audience: 'All active subscribers', sent: 0, delivered: 0, status: 'scheduled' },
  { id: 'CMP-1177', campaign: 'Missed delivery follow-up', audience: 'Skipped deliveries — 30 Jul', sent: 12, delivered: 9, status: 'sent' },
  { id: 'CMP-1174', campaign: 'Referral reward credited', audience: 'Referrers with converted signups', sent: 6, delivered: 4, status: 'failed' },
];

export type ReportStatus = 'ready' | 'processing' | 'failed';

export interface ScheduledReport {
  id: string;
  name: string;
  period: string;
  format: 'CSV' | 'XLSX' | 'PDF';
  status: ReportStatus;
  generatedAt: string;
}

export const MOCK_REPORTS: ScheduledReport[] = [
  { id: 'RPT-902', name: 'Subscriptions summary', period: 'Jul 2026', format: 'XLSX', status: 'ready', generatedAt: '2026-07-31T06:00:00Z' },
  { id: 'RPT-901', name: 'Delivery partner payouts', period: 'Week 30, 2026', format: 'CSV', status: 'ready', generatedAt: '2026-07-30T06:00:00Z' },
  { id: 'RPT-900', name: 'Delivery completion report', period: 'Jul 2026', format: 'PDF', status: 'processing', generatedAt: '2026-07-31T05:58:00Z' },
  { id: 'RPT-894', name: 'Payment reconciliation', period: 'Week 29, 2026', format: 'XLSX', status: 'failed', generatedAt: '2026-07-24T06:00:00Z' },
];

export interface AnalyticsMetricRow {
  id: string;
  metric: string;
  thisWeek: string;
  lastWeek: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
}

export const MOCK_ANALYTICS_ROWS: AnalyticsMetricRow[] = [
  { id: 'AN-1', metric: 'Active subscribers', thisWeek: '412', lastWeek: '389', change: '+5.9%', trend: 'up' },
  { id: 'AN-2', metric: 'New signups', thisWeek: '34', lastWeek: '41', change: '-17.1%', trend: 'down' },
  { id: 'AN-3', metric: 'Deliveries completed', thisWeek: '1,842', lastWeek: '1,790', change: '+2.9%', trend: 'up' },
  { id: 'AN-4', metric: 'Skipped delivery rate', thisWeek: '3.1%', lastWeek: '2.8%', change: '+0.3pp', trend: 'down' },
  { id: 'AN-5', metric: 'Avg. delivery time', thisWeek: '18 min', lastWeek: '19 min', change: '-5.3%', trend: 'up' },
  { id: 'AN-6', metric: 'Churn (30d)', thisWeek: '4.2%', lastWeek: '4.6%', change: '-0.4pp', trend: 'up' },
];
