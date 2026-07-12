# Changelog — Auth OTP, Forgot Password & Company Search

Summary of the features and fixes delivered in this cycle on the `dev` branch.

---

## Overview

| # | Change | Type |
|---|--------|------|
| 1 | Company search by `keyword` (name **or** public service) | Feature |
| 2 | Postman collection for the whole API | Docs |
| 3 | Look up invitable staff by email | Feature |
| 4 | Email OTP verification on registration | Feature |
| 5 | Mailer: IPv6, timeouts, Resend HTTP API | Fix |
| 6 | Branded OTP email (Indonesian, `#0978FE`) | Feature |
| 7 | `data: null` on register / verify responses | Fix |
| 8 | Forgot password flow | Feature |
| 9 | Resend OTP with cooldown | Feature |
| 10 | Query optimization on aggregation-heavy endpoints | Perf |

---

## 1. Company search by keyword

**Endpoint:** `GET /public/companies?keyword=<text>`

A new **optional** `keyword` query parameter. Without it, behaviour is unchanged (all active companies).

A company is returned when **either**:

- its **name** contains the keyword, **or**
- it owns at least one **public service** whose **title** contains the keyword.

```http
GET /public/companies?keyword=Servis%20Motor
```

> Company A is returned even though its *name* doesn't match — it owns the public service "Servis Motor".

**Notes**

- Matching is case-insensitive and partial.
- Services are versioned by `serviceKey`, so only the **latest version** of each service is considered, and only if it is `accessType: 'public'` and `isActive: true`.
- Regex metacharacters in the keyword are escaped (no regex injection).

---

## 2. Postman collection

Two importable files in `docs/`:

| File | Purpose |
|------|---------|
| `workorder-portal.postman_collection.json` | **124 requests** across 23 folders — every endpoint |
| `workorder-portal.postman_environment.json` | `base_url`, `token`, and resource-id variables |

**Automation built in**

- **Auth is automatic.** `Login` (and `Verify OTP`) run a test script that extracts the JWT and stores it in `{{token}}`. The collection uses collection-level Bearer auth, so every authenticated request inherits it — no copy-pasting tokens.
- **ID chaining.** List/create requests capture `companyId`, `serviceId`, `formId`, `workOrderId`, etc. into collection variables, so a full workflow can be run end-to-end in the Collection Runner.

See `docs/postman-collection.md` for setup.

---

## 3. Look up invitable staff by email

**Endpoint:** `GET /company/invitable-users?email=<keyword>`
**Roles:** `owner_company`, `manager_company`

Lets an owner/manager find a user to invite **before** sending the invite, instead of guessing an email.

Returns only users who are genuinely **invitable** — matching exactly what the invite flow already validates:

- role is `staff_unassigned`
- not already attached to a company
- not deleted

Matching is partial + case-insensitive on the email (good for type-ahead), capped at 10 results.

---

## 4. Email OTP verification on registration

Registration is now **two-step**, using a **verify-before-create** model: **no account exists until the email is verified.**

```
POST /auth/register           →  emails a 6-digit OTP   (no user created yet)
POST /auth/register-company   →  emails a 6-digit OTP   (no user/company yet)
                ↓
POST /auth/verify-otp         →  creates the real account
```

| Endpoint | Body |
|----------|------|
| `POST /auth/register` | `{ name, email, password, role }` |
| `POST /auth/register-company` | `{ name, email, password, companyName }` |
| `POST /auth/verify-otp` | `{ email, otp }` |

**How it works**

- The submitted signup is held in a `PendingRegistration` record, **not** in `users`.
- The password is stored **encrypted** (reversibly) — never in plain text, and never pre-hashed, so the `User` model's bcrypt pre-save hook still applies on creation.
- A TTL index auto-removes abandoned registrations.

**OTP security**

| Property | Value |
|----------|-------|
| Length | 6 digits, cryptographically random |
| Storage | SHA-256 hash — the raw code is never persisted |
| Lifetime | **5 minutes** |
| Max attempts | 5, then the code is burned |
| Reuse | Single-use — deleted on success |

---

## 5. Mailer fixes

Three separate real bugs, found while getting email working on Railway.

### 5a. IPv6 `ENETUNREACH` — the "endless loading"

Registration hung, then failed with:

```
connect ENETUNREACH 2607:f8b0:4023:1c01::6c:587
```

**Cause.** Nodemailer resolved Gmail's **IPv6** address first. Railway has no IPv6 route, so the connection stalled and died.

**Fix.** Prefer IPv4 process-wide in `main.ts`:

```ts
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');
```

Measured: SMTP connect went from **~12s (or failure) → 1.4s**.

> A `family: 4` option on the transporter was tried first and **does not work** — nodemailer still resolves and probes IPv6. The DNS-level fix is the effective one.

### 5b. No SMTP timeouts

A dead SMTP connection hung the HTTP request indefinitely. Added `connectionTimeout` / `greetingTimeout` / `socketTimeout` (10–15s) so it fails fast with a clear error instead of hanging.

### 5c. Railway blocks outbound SMTP → moved to Resend

With IPv6 fixed, the connection then hit `Connection timeout` on port 587: **Railway blocks outbound SMTP ports** (25/465/587).

**Fix.** `MailService` now sends over an **HTTP API** (port 443, never blocked). Transport is selected from env, in priority order:

| Priority | Condition | Transport |
|----------|-----------|-----------|
| 1 | `RESEND_API_KEY` set | **Resend HTTP API** — use this on Railway |
| 2 | `SMTP_HOST` set | Nodemailer SMTP — fine locally |
| 3 | neither | **Console** — the OTP is logged, so the flow works with no provider at all |

```bash
RESEND_API_KEY=re_xxxxxxxx
MAIL_FROM=onboarding@resend.dev
MAIL_FROM_NAME=Work Order
```

> ⚠️ **Resend free tier:** without a **verified domain** you may only send **from** `onboarding@resend.dev` and **to** your own Resend account email. To email real users, verify a domain and set `MAIL_FROM=no-reply@yourdomain.com`.

---

## 6. Branded OTP email

A clean, responsive email template — **table-based with fully inlined styles**, the only layout that renders reliably in Gmail and Outlook (they strip `<style>` blocks and don't support flexbox/grid).

**Palette**, led by the app's `lightPrimary`:

| Token | Value | Used for |
|-------|-------|----------|
| Primary | `#0978FE` | Top accent bar, brand label, the OTP digits |
| Tint | `#EEF5FF` | Code block background |
| Tint border | `#CFE2FF` | Code block border |
| Text / Muted | `#101828` / `#667085` | Headline / body copy |
| Background / Border | `#F4F6F8` / `#E5E9F0` | Page backdrop / card edge |

All copy is **Indonesian** (subject, HTML, and the plain-text fallback):

| | Verification | Password reset |
|---|---|---|
| **Subject** | `284630 adalah kode verifikasi Anda` | `654321 adalah kode reset password Anda` |
| **Heading** | Verifikasi email Anda | Reset password Anda |
| **Expiry** | Kode ini berlaku selama **5 menit** | Kode ini berlaku selama **5 menit** |

Both emails share **one** template with only the wording differing, so the design cannot drift between them. Putting the code in the **subject line** lets users read it straight from the notification.

---

## 7. `data: null` on register / verify

`register`, `register-company`, and `verify-otp` now return no payload — the message alone carries the outcome:

```json
{
  "success": true,
  "code": 200,
  "message": "Verification code sent to your email...",
  "data": null
}
```

> **Breaking:** `verify-otp` previously returned `{ user, token }` for company signups. It no longer returns a token — clients must call `POST /auth/login` after verifying.

---

## 8. Forgot password

```
POST /auth/forgot-password   { email }                      → emails a reset code
POST /auth/reset-password    { email, otp, newPassword }    → sets the new password
```

Uses the same hardened OTP model as registration: hashed, 5-minute expiry, 5-attempt limit, single-use, TTL-cleaned.

**No account enumeration.** `forgot-password` returns the **same** response whether or not the email exists:

> *"If the email is registered, a password reset code has been sent to it."*

Unknown emails are a silent no-op, so the endpoint can't be used to discover which addresses are registered.

No current password is required — the emailed OTP **is** the authorization.

---

## 9. Resend OTP

**Endpoint:** `POST /auth/resend-otp` — body `{ email }`

Re-issues the registration OTP for an unverified signup from **just the email**, so the client doesn't resubmit the whole form. It:

- generates a **fresh code** (invalidating the previous one),
- **resets the attempt counter** (so a user who burned tries on a stale code isn't locked out),
- **restarts the 5-minute expiry**.

**Cooldown — 60 seconds.** A resend button is an open invite to flood someone's inbox, so a `lastOtpSentAt` timestamp enforces a minimum gap between sends.

| Case | Response |
|------|----------|
| Success | `200` — `data: null` |
| No pending registration | `400` — "Please register again." |
| Within cooldown | `429` — includes `retryAfterSeconds` for a countdown UI |

`forgot-password` **already acts as its own resend** (calling it again issues a new code), so it has no separate endpoint. It applies the same cooldown but **skips silently** instead of returning `429` — erroring would reveal that a reset is pending and undo the non-enumeration property above.

---

## 10. Query optimization on aggregation-heavy endpoints

Read-heavy endpoints were issuing a query **per row** (N+1). Batched into a fixed number of round-trips. **No response shape changed** — these are pure performance fixes.

| Endpoint | Before | After |
|----------|--------|-------|
| `GET /service-requests/inbox` | ~4 queries **per request** (2 form templates + 2 submissions) | **2** queries total |
| `GET /service-requests/sent` | ~4 queries **per request** | **2** queries total |
| `GET /services` (with forms) | 2 queries per form + 1 per position, **per service** — `O(N×M)` | **3** queries total |
| `GET /dashboard/company` | 4 aggregations run **sequentially** | 4 run **concurrently** |
| Inbox (department manager) | 1 service lookup **per request** | **1** query via `$in` |

**How**

- **Service requests** — `_enrichAndFormatMany()` collects every referenced form id and request id up front, then resolves all templates and all submissions in two queries and joins them in memory. The single-document path now delegates to the batch one, so the two cannot drift apart.
- **Services** — `getServicesWithAggregation()` gathers every form/position referenced across *all* services, then resolves them in 3 queries. The "a service may point at an old form version, so show the latest live version of that `formKey`" rule is preserved, and is covered by a new test.
- **Dashboard** — the four independent per-collection aggregations now run under a single `Promise.all`.

Effect grows with data size: an inbox of 50 requests drops from ~200 queries to 2.

---

## Configuration

New environment variables (see `.env.example`):

```bash
# Email — transport is picked in order: RESEND_API_KEY → SMTP_HOST → console
RESEND_API_KEY=
MAIL_FROM=onboarding@resend.dev
MAIL_FROM_NAME=Work Order

# SMTP fallback (used only when RESEND_API_KEY is empty)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

> With **none** of these set, OTP codes are printed to the server console — the whole auth flow is testable locally with no email provider.

---

## Auth endpoint reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/auth/register` | — | Step 1: email an OTP (no account yet) |
| `POST` | `/auth/register-company` | — | Step 1: email an OTP (no account yet) |
| `POST` | `/auth/verify-otp` | — | Step 2: verify the OTP, create the account |
| `POST` | `/auth/resend-otp` | — | Re-issue the registration OTP (60s cooldown) |
| `POST` | `/auth/forgot-password` | — | Email a password reset code |
| `POST` | `/auth/reset-password` | — | Verify the code, set the new password |
| `POST` | `/auth/login` | — | Returns the JWT |
| `POST` | `/auth/logout` | ✔ | |
| `GET` | `/auth/profile` | ✔ | |

---

## Testing

- **23/23** auth unit tests pass (`src/auth/auth.service.spec.ts`) — covering OTP dispatch, verification, expiry, attempt limits, resend, cooldown, and password reset.
- `src/users/users.service.spec.ts` and `src/company/companies.client.service.spec.ts` added/repaired.
- `tsc --noEmit` and `nest build` are clean.

> **Pre-existing failures, unrelated to this work:** the `form`, `dashboard`, `membership`, `services`, `invitations`, `companies.internal`, and `users.controller` suites already failed on a clean checkout (verified by stashing). The `auth` and `users.service` suites were **also** broken before (missing DI providers) and are now fixed.

---

## Known follow-ups

- **Resend domain verification** is required before OTPs can be delivered to real users.
- API error messages (`"Invalid OTP."`, `"OTP has expired..."`) are still in **English** while the emails are in Indonesian.
- Password minimum length is **6** on reset/register but **8** in `UpdateProfileDto` — worth aligning.
- `.env.example` still contains real-looking `ENCRYPTION_KEY` / `JWT_SECRET` values; these should be rotated and replaced with placeholders.
