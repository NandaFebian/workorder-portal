# Service Request (SR) API Documentation

This document outlines the active endpoints, their access rules, Request structures, and Response structures based on the current implementation.

## Roles
- **Requester**: Client or Internal Staff who initializes the service request.
- **Provider**: Company Owner, Company Manager, or Company Staff of the respective company handling the service.

---

## 1. Response Models

The API utilizes specialized response payloads to hide or show information depending on the user's role.

### Provider Side SR Response
Contains internal configs (`serviceRequestApprovalAccessType`, `reviewNeed`).
```json
{
  "_id": "ObjectID",
  "serviceRequestStatus": "received | cancelled | rejected | approved | workOrderCreated | completed | closed",
  "serviceRequestApprovalAccessType": "auto | manager",
  "reviewNeed": true,
  "service": {
    "_id": "ObjectID",
    "title": "string",
    "description": "string",
    "accessType": "public | member_only | internal",
    "isActive": true
  },
  "requestedBy": {
    "_id": "ObjectID",
    "name": "string",
    "email": "string",
    "role": "string"
  },
  "approvedBy": { /* same as requestedBy */ },
  "intakeForm": { /* Form Template Object */ },
  "reviewForm": { /* Form Template Object */ },
  "intakeSubmission": { /* Form Submission Object */ },
  "reviewSubmission": { /* Form Submission Object */ },
  "receivedAt": "Date",
  "approvedAt": "Date",
  "rejectedAt": "Date",
  "cancelledAt": "Date",
  "workOrderCreatedAt": "Date",
  "completedAt": "Date",
  "closedAt": "Date"
}
```

### Requester Side SR Response
Shows the `company` handling the request but hides internal configs.
```json
{
  "_id": "ObjectID",
  "serviceRequestStatus": "received | cancelled | rejected | approved | workOrderCreated | completed | closed",
  "company": {
    "_id": "ObjectID",
    "name": "string",
    "address": "string",
    "description": "string",
    "isActive": true
  },
  "service": { /* Service Summary Object */ },
  "requestedBy": { /* User Object */ },
  "approvedBy": { /* User Object */ },
  "intakeForm": { /* Form Template Object */ },
  "reviewForm": { /* Form Template Object */ },
  "intakeSubmission": { /* Form Submission Object */ },
  "reviewSubmission": { /* Form Submission Object */ },
  "receivedAt": "Date",
  "approvedAt": "Date",
  "rejectedAt": "Date",
  "cancelledAt": "Date",
  "workOrderCreatedAt": "Date",
  "completedAt": "Date",
  "closedAt": "Date"
}
```

---

## 2. Endpoints: Retrieve Service Requests

### Get All SR — Sent (Requester)
- **Endpoint**: `GET /service-requests/sent`
- **Access**: All authenticated users (Client & Staff). Scoped to `user._id`.
- **Response**: Array of `Requester Side SR Response`.

### Get All SR — Inbox (Provider)
- **Endpoint**: `GET /service-requests/inbox`
- **Access**: CompanyOwner, CompanyManager, CompanyStaff. Scoped to `user.companyId`.
- **Response**: Array of `Provider Side SR Response`.

### Get SR Detail (Unified)
- **Endpoint**: `GET /service-requests/:id`
- **Access**: Authenticated user.
  - If the user is the **requester** → returns `Requester Side SR Response`.
  - If the user is the **provider** (part of the handling company) → returns `Provider Side SR Response`.
  - Others → **403 Forbidden**.

---

## 3. Endpoints: Intake Form

### Get Intake Form (Public / Member Only Service)
- **Endpoint**: `GET /service-request/services/:serviceId/intake-form`
- **Access**: All authenticated users. Validated based on service `accessType`:
  - `public` → any authenticated user
  - `member_only` → registered member of the company only
  - `internal` → **403 Forbidden** (use internal endpoint instead)
- **Response**: Form Template Object, or `null` if no intake form is configured.

### Get Intake Form (Internal Service — Provider Staff)
- **Endpoint**: `GET /service-request/services/:serviceId/intake-form`
- **Access**: CompanyOwner, CompanyManager, CompanyStaff belonging to the provider company.
- **Note**: This uses the same path but is handled differently based on role. Staff of the correct company can access internal service forms; others receive **403 Forbidden**.
- **Response**: Form Template Object, or `null` if no intake form is configured.

---

## 4. Endpoints: Forms & Submissions

### Submit Intake (Create SR)
- **Endpoint**: `POST /service-request/service/:serviceId`
- **Access**: All authenticated users. Validated based on service `accessType`:
  - `public` → anyone
  - `member_only` → registered member of the company
  - `internal` → staff of the provider company only
- **Request Body**:
```json
{
  "submission": {
    "formId": "ObjectID",
    "fieldsData": [
      { "order": 1, "value": "string | number | boolean | string[]" }
    ]
  }
}
```
- **Notes**:
  - `submission` is optional if the service has no intake form, or if the form has no required fields.
  - `formId` must exactly match the `intakeFormId` configured on the service. Otherwise → **400 Bad Request**.
  - For `single_select` fields, `value` must be the option's `key` (not its label).
  - For `multi_select` fields, `value` must be an array of option `key`s.
- **Response**: `Requester Side SR Response`

### Submit Review
- **Endpoint**: `POST /service-request/:id/review`
- **Access**: Only the specific Requester who created the SR.
- **Validation**:
  - SR Status MUST be `completed` → otherwise **422 Unprocessable Entity**.
  - `formId` must exactly match the `reviewFormId` on the SR → otherwise **400 Bad Request**.
  - Required fields must be present → otherwise **422 Unprocessable Entity**.
- **Request Body**:
```json
{
  "submission": {
    "formId": "ObjectID",
    "fieldsData": [
      { "order": 1, "value": "string | number | boolean | string[]" }
    ]
  }
}
```
- **Business Rule**: Submitting review changes status to `closed` (when `reviewNeed` is `true`).
- **Response**: `Requester Side SR Response`

---

## 4. Endpoints: Status Transitions

### Cancel Service Request
- **Endpoint**: `PATCH /service-requests/:id/cancel`
- **Access**: Requester only (the user who made the SR).
- **Rules**: Only allowed when status is `received`.
- **Result Status**: `cancelled`

### Approve Service Request
- **Endpoint**: `PATCH /service-requests/:id/approve`
- **Access**: CompanyOwner, CompanyManager (Provider side).
- **Rules**: Only allowed when status is `received`.
- **Result Status**: `approved` → automatically transitions to `workOrderCreated`
- **Effect**: Triggers automatic Work Order creation (and possibly Work Report).

### Reject Service Request
- **Endpoint**: `PATCH /service-requests/:id/reject`
- **Access**: CompanyOwner, CompanyManager (Provider side).
- **Rules**: Only allowed when status is `received`.
- **Result Status**: `rejected`

### Delete Service Request
- **Endpoint**: `DELETE /service-requests/:id`
- **Access**: CompanyOwner, CompanyManager (Provider side).
- **Rules**: Soft-delete. Returns the deleted SR detail with `deletedAt` timestamp.
- **Response**: Deleted `Provider Side SR Response` with `deletedAt` field.
