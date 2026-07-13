# Invitation Code — Frontend Guide

Invite employees with a **shareable unique code** instead of one-by-one email invites.

An owner/manager configures a code that carries a **role** and a **department (position)**. Any user with role `staff_unassigned` can claim that code and instantly joins the company with exactly that role + department.

---

## The two flows

**Company side (owner / manager)**

```
Create code  →  share it (WhatsApp, poster, QR…)  →  watch usedCount grow  →  revoke when done
```

**Employee side (unassigned staff)**

```
Receive code  →  Preview it (see company/role/department)  →  Claim  →  now a member
```

---

## Response envelope

Every successful response is wrapped:

```json
{
  "success": true,
  "code": 200,
  "message": "Invitation code created successfully",
  "data": { }
}
```

Every error uses this shape instead (note: **no `success` field on errors**):

```json
{
  "code": 422,
  "timestamp": "2026-07-13T04:12:00.000Z",
  "path": "/company/invitation-codes",
  "message": "Validation failed",
  "errors": {
    "field": [{ "positionId": "Position ID is required for staff role" }]
  }
}
```

Read `message` for the toast, and `errors.field[]` to highlight the offending inputs.

---

# Company side

All endpoints below require a **Bearer token** and role `owner_company` or `manager_company`.

## ⚠️ Permissions — read this first

There are **three** effective actor types, and they see different things. A "manager" is split by whether they have a position:

| Actor | Can create | Can see / edit / revoke |
|---|---|---|
| **Owner** (`owner_company`) | Staff **and** Manager codes, any department | **All** codes in the company |
| **General manager** (`manager_company`, **no** position) | **Staff codes only**, any department | **Staff codes only**, any department |
| **Department manager** (`manager_company`, **has** a position) | **Staff codes only**, **own department only** | **Staff codes only**, **own department only** |

Key consequences for the UI:

- **Only the owner may grant the manager role.** For any manager, hide/disable the **Manager** option in the role dropdown — the API returns `403` otherwise.
- A **department manager**'s department picker should be **locked to their own position**.
- The list endpoint is **already filtered** for you. A manager simply won't receive manager codes, and a department manager only receives codes for their own department — so **don't build client-side filtering**; just render what you get.
- Codes outside a user's scope return **`404 Not Found`**, not `403`. This is deliberate (it stops a manager probing for codes they can't see). So a department manager opening another department's code id gets the same "not found" screen as a genuinely missing code.

> **How to tell general vs department manager on the client:** a manager with `position === null` is a *general* manager; one with a `position` object is a *department* manager. (Available on the user object from `GET /users/me` / login.)

## 1. Create a code

```http
POST /company/invitation-codes
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "role": "company_staff",
  "positionId": "6650f0a1c2b4e81234567890",
  "maxUses": 10,
  "expiresInDays": 30
}
```

| Field | Required | Notes |
|---|---|---|
| `role` | ✅ | `company_staff` or `company_manager` only |
| `positionId` | **Required for `company_staff`**, optional for `company_manager` | Must be a position in your company |
| `code` | optional | Custom code (4–32 chars, `A-Z 0-9 - _`). **Omit to auto-generate.** Stored upper-cased. |
| `maxUses` | optional | Max claims. **Omit = unlimited** |
| `expiresInDays` | optional | Days until expiry. **Omit = never expires** |

**Response `201`**

```json
{
  "success": true,
  "code": 201,
  "message": "Invitation code created successfully",
  "data": {
    "_id": "6650f1b2c2b4e81234567891",
    "code": "K7XM29AB",
    "companyId": "6650efaac2b4e8123456788f",
    "role": "company_staff",
    "position": { "_id": "6650f0a1...", "name": "Teknisi", "description": "..." },
    "createdBy": { "_id": "...", "name": "Budi", "email": "budi@x.com" },
    "isActive": true,
    "maxUses": 10,
    "usedCount": 0,
    "remainingUses": 10,
    "expiresAt": "2026-08-12T04:12:00.000Z",
    "isClaimable": true,
    "claimedCount": 0,
    "createdAt": "2026-07-13T04:12:00.000Z",
    "updatedAt": "2026-07-13T04:12:00.000Z"
  }
}
```

> **`isClaimable`** is a convenience flag — it's already `isActive && !expired && !exhausted`. Use it directly for the status badge instead of recomputing.
> **`remainingUses`** is `null` when `maxUses` is `null` (unlimited).

### UI rules to enforce

The backend enforces all of these, but mirror them client-side for better UX:

- Role dropdown options depend on who's logged in:
  - **Owner** → Staff **and** Manager
  - **Any manager** → Staff **only** (hide/disable Manager → the API returns `403`)
- If role = **Staff** → the department/position field becomes **required**.
- If role = **Manager** → department is **optional** (owner only).
- If the user is a **department manager** → lock the department picker to **their own position**.

---

## 2. List codes

```http
GET /company/invitation-codes
```

Returns an array of the same object as above, newest first. Use it for the management table:

| Code | Role | Department | Uses | Expires | Status |
|---|---|---|---|---|---|
| `K7XM29AB` | Staff | Teknisi | 3 / 10 | 12 Aug 2026 | Active |

Status badge ← `isClaimable` (`true` → *Active*, `false` → *Inactive / Expired / Full*).
Uses ← `usedCount` / `maxUses` (show `∞` when `maxUses` is `null`).

## 3. Get one code

```http
GET /company/invitation-codes/:id
```

## 4. Update / reconfigure

```http
PATCH /company/invitation-codes/:id
```

All fields optional — send only what changed:

```json
{ "isActive": false, "maxUses": 20, "role": "company_staff", "positionId": "...", "expiresInDays": 7 }
```

Use this for the **Activate / Deactivate toggle** (`{ "isActive": false }`).

> ⚠️ Role and position are **re-validated together**. You cannot switch a code to `company_staff` while leaving its position empty — you must send `positionId` in the same request.
> `maxUses` cannot be set below the number of claims already made (`422`).
> The **same permission rules as create** apply: a manager cannot promote a code to `company_manager` (`403`), and a department manager cannot move a code to another department (`422`). A code outside the caller's scope returns `404`.

## 5. Revoke

```http
DELETE /company/invitation-codes/:id
```

Soft-deletes the code — it immediately stops being claimable.

```json
{ "success": true, "code": 200, "message": "Invitation code revoked successfully", "data": { "_id": "..." } }
```

---

# Employee side (claiming)

Requires a **Bearer token**. The user must be `staff_unassigned` **with no company**.

## 6. Preview a code (before claiming)

Show the user *what they're about to join* — do this before the confirm button.

```http
GET /invitation-codes/:code
```

`:code` is case-insensitive — `join2026` and `JOIN2026` both work.

**Response `200`**

```json
{
  "success": true,
  "code": 200,
  "message": "Invitation code retrieved successfully",
  "data": {
    "code": "JOIN2026",
    "company": { "_id": "...", "name": "PT Maju Jaya", "address": "...", "description": "..." },
    "role": "company_staff",
    "position": { "_id": "...", "name": "Teknisi", "description": "..." },
    "expiresAt": "2026-08-12T04:12:00.000Z"
  }
}
```

> Suggested UI: *"You're about to join **PT Maju Jaya** as **Staff** in **Teknisi**."* → [Confirm]

## 7. Claim the code

```http
POST /invitation-codes/claim
Content-Type: application/json
```

```json
{ "code": "JOIN2026" }
```

**Response `200`** — `data` is the **updated user**, already carrying their new role, company and position:

```json
{
  "success": true,
  "code": 200,
  "message": "Invitation code claimed successfully. You have joined the company.",
  "data": {
    "_id": "...",
    "name": "Siti",
    "email": "siti@x.com",
    "role": "company_staff",
    "companyId": { "_id": "...", "name": "PT Maju Jaya", "address": "...", "description": "..." },
    "positionId": { "_id": "...", "name": "Teknisi", "description": "..." }
  }
}
```

### No re-login needed ✅

The **existing token keeps working** and immediately reflects the new role, company and position — the API re-reads the user from the database on every request rather than trusting the token's payload.

So right after a successful claim you can navigate straight into the company area. You only need to **refresh your local user/profile state** (e.g. re-run `GET /users/me`, or just use the `data` returned by the claim, which is already the updated user).

---

## Error cases to handle

### Creating (company side)

| Status | `message` | Cause |
|---|---|---|
| `422` | `Validation failed` → `errors.field[].role` | Role isn't staff/manager |
| `422` | `Validation failed` → `errors.field[].positionId` | Staff role with no position, bad id, position not found, or a department manager picking another department |
| **`403`** | **`Only the company owner can configure manager invitation codes.`** | **A manager tried to create/update a code with role `company_manager`** |
| `409` | `Invitation code "X" is already taken.` | Custom `code` collides — ask for another |
| `403` | `You are not associated with any company.` | Caller has no company |
| **`404`** | **`Invitation code with ID X not found`** | Either it genuinely doesn't exist, **or it's outside the caller's scope** (e.g. a department manager touching another department's code). Treat both as "not found". |

### Claiming (employee side)

| Status | `message` | UI |
|---|---|---|
| `404` | `Invalid invitation code.` | "Code not found — check it and try again" |
| `422` | `This invitation code is no longer active.` | Revoked/deactivated |
| `422` | `This invitation code has expired.` | Expired |
| `422` | `This invitation code has already been fully claimed.` | Quota exhausted |
| `422` | `You already belong to a company.` | User is already in a company |
| `403` | `Only unassigned staff can claim an invitation code.` | Wrong role (e.g. a `client`) |
| `422` | `This invitation code is no longer claimable.` | Rare race — someone took the last slot mid-request. Ask them to refresh. |

---

## Quick reference

| Method | Endpoint | Who | Scope |
|---|---|---|---|
| `POST` | `/company/invitation-codes` | Owner / Manager | Owner: any role. Manager: staff only (dept manager: own department only) |
| `GET` | `/company/invitation-codes` | Owner / Manager | Pre-filtered to the caller's scope |
| `GET` | `/company/invitation-codes/:id` | Owner / Manager | `404` if outside scope |
| `PATCH` | `/company/invitation-codes/:id` | Owner / Manager | `404` if outside scope |
| `DELETE` | `/company/invitation-codes/:id` | Owner / Manager | `404` if outside scope |
| `GET` | `/invitation-codes/:code` | Any logged-in user | — |
| `POST` | `/invitation-codes/claim` | Unassigned staff only | — |

A ready-to-run **Invitation Codes** folder is included in `docs/workorder-portal.postman_collection.json`.
