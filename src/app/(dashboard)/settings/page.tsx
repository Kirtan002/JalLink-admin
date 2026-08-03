import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { PaymentModeBanner } from '@/components/PaymentModeBanner';
import { SupportForm } from './support-form';

export default async function SettingsPage() {
  let settings;
  try {
    settings = await api.getSettings();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Could not reach the JalLink API.';
    return (
      <>
        <PageHeader title="Settings" description="Platform-wide configuration." />
        <ErrorBanner message={message} />
      </>
    );
  }

  const configured = Boolean(settings.supportMobile || settings.supportEmail);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Platform-wide configuration. Referral and pricing settings live under Plans."
        action={
          configured ? <Badge tone="green">Support live</Badge> : <Badge tone="amber">Support not set</Badge>
        }
      />

      <PaymentModeBanner />

      <Card title="Customer support contact" className="mb-8">
        <p className="mb-5 text-sm text-(--color-text-muted)">
          What the mobile app shows customers on its help screens. The app reads these from the public{' '}
          <code className="rounded bg-(--color-surface-muted) px-1.5 py-0.5 font-mono text-xs">GET /support</code>{' '}
          endpoint, which needs no login — so these also show on the OTP screen, when a customer can&apos;t sign
          in. Clearing a field hides it in the app.
        </p>
        <SupportForm settings={settings} />
      </Card>

      <Card title="Referral & pricing">
        <p className="text-sm text-(--color-text-muted)">
          The referral divisor and the flat extra-bottle price are edited alongside the plans they apply to.
        </p>
        <Link
          href="/plans"
          className="mt-3 inline-block text-sm font-medium text-(--color-brand-blue-dark) hover:underline"
        >
          Edit under Plans →
        </Link>
      </Card>
    </>
  );
}
