# Service Request (SR) API Documentation

This document outlines the mega refactor changes for the Service Request module. It details the active endpoints, their access rules, Request structures, and Response structures.

## Roles
- **Requester**: Client or Internal Staff who initializes the service request.
- **Provider**: Company Owner or Company Manager of the respective company handling the service.

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
  ... (other dates)
}
```

---

## 2. Endpoints: Retrieve Service Requests

### Get All SR Inbox (Provider)
- **Endpoint**: `GET /service-request/inbox`
- **Access Rule**: Provider (Owner/Manager). Scoped to `user.companyId`.
- **Response**: Array of `Provider Side SR Response`.

### Get All SR Sent (Requester)
- **Endpoint**: `GET /public/service-request/sent`
- **Access Rule**: All Users (Client & Staff). Scoped to `user._id`.
- **Response**: Array of `Requester Side SR Response`.

### Get SR Detail
- **Provider Endpoint**: `GET /service-request/{SRid}`
- **Requester Endpoint**: `GET /public/service-request/{SRid}`
- **Access Rule**: 
  - Requester can only access their own SR.
  - Provider can only access SR assigned to their company.
  - Others receive **403 Forbidden**.
- **Response**: `Provider Side SR Response` OR `Requester Side SR Response` depending on the route.

---

## 3. Endpoints: Forms & Submissions

### Get Intake Form (Public / Member Only)
- **Endpoint**: `GET /public/service-request/services/{ServiceId}/intake-form`
- **Access Rule**: 
  - Public Service → Any Client
  - Member Only Service → Registered Member Client
  - Internal Only Service → **403 Access Denied**
- **Response**: Form Template Object

### Get Intake Form (Internal Only)
- **Endpoint**: `GET /service-request/services/{ServiceId}/intake-form`
- **Access Rule**: Internal Service → Staff part of that company. Others → **403 Access Denied**.
- **Response**: Form Template Object

### Submit Intake (Create SR)
- **Endpoint**: `POST /public/service-request/service/{ServiceId}`
- **Access Rule**: Rules follow the Intake Form's strict rules (Public, Member Only, Internal Only validations). External Clients cannot access Internal Only.
- **Request Body**:
```json
{
  "submissions": [
    {
      "formId": "ObjectID",
      "fieldsData": [
        { "fieldId": "string", "value": "string/number/boolean" }
      ]
    }
  ]
}
```
- **Validation**:
  - `serviceId` must exist and be active.
  - Required fields must exist (Missing = **422 Unprocessable Entity**).
- **Business Rule**: Initial state set to `received`.
- **Response**: `Requester Side SR Response`

### Submit Review
- **Endpoint**: `POST /public/service-request/{SRId}/review`
- **Access Rule**: Only the specific Requester who made the SR.
- **Validation**:
  - SR Status MUST be `completed`.
  - Strict payload validation against Review Form Schema.
- **Business Rule**: Submitting review changes the status to `closed` (if `reviewNeed` is true).
- **Response**: `Requester Side SR Response`

---

## 4. Endpoints: Status Transitions

### Cancel Service Request
- **Endpoint**: `PATCH /public/service-request/{SRid}/cancel`
- **Access Rule**: Requestor only.
- **Rules**: Allows execution only if status is `received`.
- **Result Status**: `cancelled`

### Approve Service Request
- **Endpoint**: `PATCH /service-request/{SRid}/approve`
- **Access Rule**: Provider only.
- **Rules**: Allows execution only if status is `received`.
- **Result Status**: `approved` 
- **Effect**: Triggers automatic Work Order (and possibly Work Report) creation. Status eventually turns into `workOrderCreated`.

### Reject Service Request
- **Endpoint**: `PATCH /service-request/{SRid}/reject`
- **Access Rule**: Provider only.
- **Rules**: Allows execution only if status is `received`.
- **Result Status**: `rejected`
