# JalLink Admin

Internal admin panel for the JalLink backend — subscriptions, plans, payments, the wallet
ledger, referrals, and the delivery-partner KYC review queue.

Next.js 16 (App Router, Server Components + Server Actions), React 19, Tailwind v4. Every
page is server-rendered per request; there is no client-side data store.

## Setup

```bash
npm install
cp .env.example .env   # then edit it
npm run dev            # http://localhost:3000
```

| Variable         | What it does                                                                |
| ---------------- | --------------------------------------------------------------------------- |
| `API_BASE_URL`   | The JalLink backend this panel talks to.                                     |
| `ADMIN_API_KEY`  | The backend's shared secret, sent as `X-Admin-Key` on every `/admin/*` call. |
| `ADMIN_USERNAME` | Login username, and the audit-log actor label (`X-Admin-Actor`).             |
| `ADMIN_PASSWORD` | Login password.                                                              |
| `SESSION_SECRET` | Signs the admin session cookie.                                              |

`ADMIN_API_KEY` is optional against a development backend started without one; a production
backend refuses to boot without it, so leaving it unset there makes every admin request fail
with `401 ADMIN_KEY_INVALID`.

There is no user database: `ADMIN_USERNAME`/`ADMIN_PASSWORD` is a single shared credential
pair, and the session is a signed cookie (`src/lib/session.ts`) with no server-side store.
Page loads are gated in `src/proxy.ts`; Server Actions re-check with `requireSession()`,
because a forged POST can reach an action without ever rendering a page.

## Delivery-partner KYC

The one screen with a real workflow behind it. Partners sign themselves up in the mobile app
and submit Aadhaar + PAN; nothing about the partner app opens to them until an admin approves
it here.

- **`/delivery-partners`** — the queue. Partners awaiting a decision sort to the top; filter
  by KYC status, or by *suspended*, which is the `isActive` flag rather than a KYC state.
- **`/delivery-partners/[id]`** — the review packet: identity fields, every uploaded document
  (the current round and the superseded ones), and the full decision history. Document
  numbers are unmasked here, because checking them against the image *is* the review.
- **Approve** opens the partner app to them on their next request and lifts any suspension.
- **Reject requires a reason** (10–500 characters). It is shown to the partner verbatim, so
  it has to say what to fix; they then re-submit, which opens a new round and keeps the
  rejected one on file. The reason is checked in the Server Action and again by the API.
- **Suspend / reinstate** is a separate lever that blocks sign-in and leaves the KYC decision
  alone — reinstating never means re-reviewing documents.

Only partners who are approved *and* active appear in the assign-partner dropdown on a
subscription: an unapproved partner cannot see a delivery at all, so offering them there
would silently strand the subscription.

Adding a partner from this panel is **manual onboarding** — the record is created already
approved, on the basis that you checked their documents yourself. Partners who sign up in the
app appear on their own; creating them here first makes their signup fail with
`DELIVERY_PARTNER_EXISTS`.

## Language support

Three locales ship: English, Hindi (हिन्दी) and Gujarati (ગુજરાતી). The switcher is in the
sidebar footer, on the login page, and under Settings; each language is listed in its own
script, since someone looking for Gujarati is looking for "ગુજરાતી".

The locale lives in a cookie (`jallink_admin_locale`), not in the URL. The `app/[lang]/…`
segment the Next docs describe is the right pattern for a public site where a shared link has
to open in the sender's language; this panel is a single-operator internal tool behind a
login, every route is already dynamic, and the cookie keeps `/subscriptions?status=active`
meaning one thing instead of two.

```
src/lib/i18n/
  config.ts               locales, cookie name, `interpolate` for {placeholders}
  server.ts               getLocale() / getDictionary() for Server Components
  client.tsx              I18nProvider + useTranslations() for Client Components
  actions.ts              setLocale() — sets the cookie, revalidates the root layout
  dictionaries/en.ts      the source dictionary
  dictionaries/hi.ts      Hindi, typed as `typeof en`
  dictionaries/gu.ts      Gujarati, same
```

Server Components call `await getDictionary()`. Client Components read the same object from
context with `useTranslations()` — the layout resolves it once and passes it down, so only
the active locale is ever serialized to the browser.

**To add a language:** copy `dictionaries/en.ts`, translate the values, add the locale to
`LOCALES` and `LOCALE_TAGS` in `config.ts`, and register it in `dictionaries/index.ts`.
Translations are typed against the English dictionary, so a missing key is a compile error
rather than a blank string in production.

Dictionary values are plain strings (they cross the server→client boundary), so runtime
values go in `{placeholders}` and are filled by `interpolate`.

Two things deliberately do **not** follow the panel's language. A KYC rejection reason is the
reviewing admin's own words and is shown exactly as typed — it is the same text the partner
reads, and translating it would misquote them. Customer and partner names, addresses and
document numbers are data, not copy. Everything else that the API returns as English server
copy — KYC document labels, generated event notes — is re-derived panel-side from the stable
enum values, so it translates with the rest of the page.

## Responsive layout

The panel works from ~360px up.

- **`components/AppShell.tsx`** — from `lg` the sidebar is a permanent column; below it the
  sidebar becomes an off-canvas drawer opened from a sticky top bar. The drawer closes on
  navigation, on Escape, and on a backdrop tap, and locks body scroll while open. Closed, it
  is `invisible`, not merely translated off-screen, so its links stay out of the tab order.
- **`components/DataTable.tsx`** — one column definition, two layouts. A table from `md` up;
  below that each row becomes a card, because a six-column table inside a horizontal scroller
  is technically responsive and practically unreadable on a phone. The first column is the
  card heading, headerless columns become the action row.
- The root layout sets a `viewport` — without it the panel renders at desktop width and gets
  scaled down, which no amount of responsive CSS fixes.

## Project structure

```
src/
  app/(dashboard)/        every admin screen; layout.tsx provides the shell + i18n
  app/login/              the single shared-credential login
  components/             shell, table, cards, badges, form primitives
  lib/api.ts              typed client for the backend (adds X-Admin-Key / X-Admin-Actor)
  lib/types.ts            response types mirroring the backend schema
  lib/auth.ts             session cookie helpers; requireSession() for Server Actions
  lib/i18n/               locales and dictionaries (see above)
  proxy.ts                gates page loads on the session cookie
```

Screens backed by real endpoints: dashboard, users, subscriptions, delivery partners, plans,
payments, wallet, referrals, extra-bottle orders, activity log, settings. Deliveries,
commission, notifications, reports and analytics are preview UI on sample data
(`lib/mockData.ts`) and say so on the page.
