import { api } from '@/lib/api';

/**
 * Which Razorpay environment the API is talking to. Deliberately loud in test mode: the
 * costly mistake is believing a screen full of "Paid" payments is real revenue when it's
 * sandbox traffic, so test mode gets a banner rather than a subtle badge.
 *
 * When the mode can't be read it says so, rather than rendering nothing — an absent banner
 * would be indistinguishable from "everything is fine", which is the one impression this
 * component exists to prevent.
 */
export async function PaymentModeBanner() {
  let config;
  try {
    config = await api.getPaymentConfig();
  } catch {
    return (
      <div className="mb-6 rounded-xl border border-(--color-border) bg-(--color-surface-muted) px-4 py-3 text-sm text-(--color-text-muted)">
        Couldn&apos;t determine the Razorpay mode — the API didn&apos;t answer{' '}
        <code className="font-mono text-xs">GET /payments/config</code>. If the backend is an older
        deploy, this appears until it&apos;s updated; treat these payments as unverified until then.
      </div>
    );
  }

  if (config.mode === 'live') {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm">
        <span className="inline-flex items-center rounded-full bg-(--color-brand-green-light) px-2.5 py-1 text-xs font-semibold text-(--color-brand-green-dark)">
          LIVE
        </span>
        <span className="text-(--color-text)">Razorpay is in live mode — these are real payments.</span>
        <code className="font-mono text-xs text-(--color-text-muted)">{config.keyId}</code>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950">
      <span className="inline-flex items-center rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
        TEST MODE
      </span>
      <span className="text-amber-900 dark:text-amber-200">
        Razorpay is using sandbox keys — payments below are <strong>not real money</strong>.
      </span>
      <code className="font-mono text-xs text-amber-800 dark:text-amber-300">{config.keyId}</code>
    </div>
  );
}
