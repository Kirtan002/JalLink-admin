import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PartnerKycStatusBadge } from '@/components/StatusBadge';
import { formatDate, formatDateTime } from '@/lib/format';
import { interpolate } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/server';
import type { KycDocument, KycEvent } from '@/lib/types';
import { KycReviewPanel } from './kyc-review-panel';
import { PartnerStatusPanel } from './partner-status-panel';

/** Groups the documents by submission round, newest first — a re-submission has to be
 * readable *next to* the round it replaced, not merged into one undifferentiated list. */
function groupBySubmission(documents: KycDocument[]): { number: number; docs: KycDocument[] }[] {
  const groups = new Map<number, KycDocument[]>();
  for (const doc of documents) {
    const existing = groups.get(doc.submissionNumber);
    if (existing) existing.push(doc);
    else groups.set(doc.submissionNumber, [doc]);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([number, docs]) => ({ number, docs }));
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="shrink-0 text-xs tracking-wide text-(--color-text-muted) uppercase sm:w-48">
        {label}
      </dt>
      <dd className="min-w-0 text-sm break-words text-(--color-text)">{value ?? '—'}</dd>
    </div>
  );
}

function HistoryEntry({
  event,
  submittedBy,
  decidedBy,
  submittedNote,
  resubmittedNote,
}: {
  event: KycEvent;
  submittedBy: string;
  decidedBy: string;
  submittedNote: string;
  resubmittedNote: string;
}) {
  // An admin's note is their own words and is shown exactly as written — it is the rejection
  // reason the partner also sees. A partner submission's note is generated server copy, so it
  // is re-derived from the transition instead, which is what lets it follow the panel's language.
  const note =
    event.actorType === 'admin'
      ? event.note
      : (event.submissionNumber ?? 1) > 1
        ? resubmittedNote
        : submittedNote;

  return (
    <li className="flex flex-col gap-1 border-l-2 border-(--color-border) py-2 pl-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <PartnerKycStatusBadge status={event.toStatus} />
        <span className="text-xs text-(--color-text-muted)">
          {formatDateTime(event.createdAt)} · {event.actorType === 'admin' ? decidedBy : submittedBy}
        </span>
      </div>
      {note && <p className="text-sm text-(--color-text)">{note}</p>}
    </li>
  );
}

export default async function DeliveryPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDictionary();
  const session = await getSession();
  const isAdmin = (session?.role ?? 'admin') === 'admin';

  let partner;
  try {
    partner = await api.getDeliveryPartner(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    return (
      <>
        <PageHeader title={t.deliveryPartners.detail.notFound} />
        <ErrorBanner message={err instanceof ApiError ? err.message : t.common.apiUnreachable} />
      </>
    );
  }

  const submissions = groupBySubmission(partner.documents);

  return (
    <>
      <Link
        href="/delivery-partners"
        className="mb-4 inline-block text-sm font-medium text-(--color-brand-blue-dark) hover:underline"
      >
        {t.deliveryPartners.detail.backToList}
      </Link>

      <PageHeader
        title={partner.name ?? partner.mobile}
        description={
          <>
            {partner.mobile} ·{' '}
            {interpolate(t.deliveryPartners.detail.partnerSince, {
              date: formatDate(partner.createdAt),
            })}
            {partner.kycReviewedBy && partner.kycReviewedAt && (
              <>
                {' · '}
                {interpolate(t.deliveryPartners.detail.reviewedBy, {
                  actor: partner.kycReviewedBy,
                  date: formatDate(partner.kycReviewedAt),
                })}
              </>
            )}
          </>
        }
        action={<PartnerKycStatusBadge status={partner.kycStatus} isActive={partner.isActive} />}
      />

      {partner.kycStatus === 'rejected' && partner.kycRejectionReason && partner.kycReviewedAt && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {interpolate(t.deliveryPartners.detail.rejectedNotice, {
            date: formatDate(partner.kycReviewedAt),
            reason: partner.kycRejectionReason,
          })}
        </div>
      )}

      <Card title={t.deliveryPartners.detail.decision} className="mb-8">
        {isAdmin ? (
          <KycReviewPanel partnerId={partner.id} kycStatus={partner.kycStatus} />
        ) : (
          <p className="text-sm text-(--color-text-muted)">{t.deliveryPartners.detail.kycAdminOnly}</p>
        )}
      </Card>

      <Card title={t.deliveryPartners.detail.identity} className="mb-8">
        <dl className="divide-y divide-(--color-border)">
          <DetailRow label={t.deliveryPartners.referralCode} value={partner.referralCode} />
          <DetailRow
            label={t.deliveryPartners.addedBy}
            value={partner.managerId ? t.deliveryPartners.addedByManager : t.deliveryPartners.addedByAdminOrSelf}
          />
          <DetailRow label={t.deliveryPartners.detail.fullName} value={partner.fullName} />
          <DetailRow
            label={t.deliveryPartners.detail.dob}
            value={partner.dob ? formatDate(partner.dob) : null}
          />
          <DetailRow label={t.deliveryPartners.detail.address} value={partner.address} />
          <DetailRow label={t.deliveryPartners.detail.aadhaarNumber} value={partner.aadhaarNumber} />
          <DetailRow label={t.deliveryPartners.detail.panNumber} value={partner.panNumber} />
        </dl>
      </Card>

      <Card title={t.deliveryPartners.detail.documents} className="mb-8">
        {submissions.length === 0 ? (
          <EmptyState
            title={t.deliveryPartners.detail.noDocuments}
            description={t.deliveryPartners.detail.noDocumentsHint}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {submissions.map((group) => (
              <div key={group.number}>
                <p className="mb-3 text-xs font-semibold tracking-wide text-(--color-text-muted) uppercase">
                  {group.docs[0]?.isCurrentSubmission
                    ? t.deliveryPartners.detail.currentSubmission
                    : interpolate(t.deliveryPartners.detail.earlierSubmission, {
                        number: group.number,
                      })}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.docs.map((doc) => (
                    <div
                      key={doc.id}
                      className={`rounded-xl border border-(--color-border) p-4 ${
                        doc.isCurrentSubmission ? '' : 'opacity-60'
                      }`}
                    >
                      <p className="text-sm font-medium text-(--color-text)">
                        {t.deliveryPartners.detail.documentLabels[doc.type]}
                      </p>
                      {doc.documentNumber && (
                        <p className="mt-0.5 font-mono text-xs text-(--color-text-muted)">
                          {doc.documentNumber}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-(--color-text-muted)">
                        {formatDateTime(doc.uploadedAt)}
                      </p>
                      {/* The file lives in the app's object storage, not here — the panel only
                          ever holds a link to it. */}
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-(--color-brand-blue-dark) hover:underline"
                      >
                        {t.deliveryPartners.detail.openDocument}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={t.deliveryPartners.detail.accountStatus} className="mb-8">
        <p className="mb-5 text-sm text-(--color-text-muted)">
          {t.deliveryPartners.detail.accountStatusHint}
        </p>
        <PartnerStatusPanel partnerId={partner.id} isActive={partner.isActive} />
      </Card>

      <Card title={t.deliveryPartners.detail.history}>
        {partner.history.length === 0 ? (
          <p className="text-sm text-(--color-text-muted)">{t.deliveryPartners.detail.historyEmpty}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {[...partner.history].reverse().map((event, i) => (
              <HistoryEntry
                key={`${event.createdAt}-${i}`}
                event={event}
                submittedBy={t.deliveryPartners.detail.submittedBy}
                decidedBy={interpolate(t.deliveryPartners.detail.decidedBy, {
                  actor: partner.kycReviewedBy ?? 'admin',
                })}
                submittedNote={t.deliveryPartners.detail.submittedNote}
                resubmittedNote={t.deliveryPartners.detail.resubmittedNote}
              />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
