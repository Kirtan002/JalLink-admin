import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { PaymentModeBanner } from '@/components/PaymentModeBanner';
import { SupportForm } from './support-form';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getDictionary } from '@/lib/i18n/server';

export default async function SettingsPage() {
  const t = await getDictionary();

  let settings;
  try {
    settings = await api.getSettings();
  } catch (err) {
    const message = err instanceof ApiError ? err.message : t.common.apiUnreachable;
    return (
      <>
        <PageHeader title={t.settings.title} description={t.settings.shortDescription} />
        <ErrorBanner message={message} />
      </>
    );
  }

  const configured = Boolean(settings.supportMobile || settings.supportEmail);

  return (
    <>
      <PageHeader
        title={t.settings.title}
        description={t.settings.description}
        action={
          configured ? (
            <Badge tone="green">{t.settings.supportLive}</Badge>
          ) : (
            <Badge tone="amber">{t.settings.supportNotSet}</Badge>
          )
        }
      />

      <PaymentModeBanner />

      <Card title={t.settings.supportContact} className="mb-8">
        <p className="mb-5 text-sm text-(--color-text-muted)">
          {t.settings.supportHintBefore}
          <code className="rounded bg-(--color-surface-muted) px-1.5 py-0.5 font-mono text-xs">GET /support</code>
          {t.settings.supportHintAfter}
        </p>
        <SupportForm settings={settings} />
      </Card>

      <Card title={t.settings.languageTitle} className="mb-8">
        <p className="mb-4 text-sm text-(--color-text-muted)">{t.settings.languageHint}</p>
        <LanguageSwitcher className="max-w-xs" />
      </Card>

      <Card title={t.settings.referralPricing}>
        <p className="text-sm text-(--color-text-muted)">{t.settings.referralPricingHint}</p>
        <Link
          href="/plans"
          className="mt-3 inline-block text-sm font-medium text-(--color-brand-blue-dark) hover:underline"
        >
          {t.settings.editUnderPlans}
        </Link>
      </Card>
    </>
  );
}
