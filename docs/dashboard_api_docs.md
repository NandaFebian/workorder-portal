# Dashboard API Documentation

This document defines the API contract for the Dashboard module. The Dashboard provides a unified endpoint that returns different summary metrics depending on the user's role (Client, Staff, Manager, Owner).

## Endpoint

```http
GET /dashboard
```

**Description:** Retrieves key metrics and summary data tailored to the authenticated user's Point of View (POV).
**Authentication:** Required (Bearer Token).

### Request Headers

| Header | Value | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `Bearer <token>` | Yes | The JWT token for authentication. |

### Path Variables & Query Parameters

*None.* The server determines the appropriate data to return based on the JWT payload (`req.user.role`).

---

## Responses by Role

The response structure varies depending on the `role` returned in the payload. Frontends should use the `role` property in the response to cast to the correct Typescript interface.

### 1. Client POV (`client`)

**Condition:** User has the role `client`.

**Response Status:** `200 OK`

```json
{
  "role": "client",
  "metrics": {
    "serviceRequests": {
      "total": 12,
      "active": 3,
      "completed": 8,
      "issues": 1
    },
    "unreadNotifications": 5
  }
}
```

**Typescript Interface:**
```typescript
interface ClientDashboardResponse {
  role: 'client';
  metrics: {
    serviceRequests: {
      total: number;
      active: number; // Sum of RECEIVED, ON_PROGRESS, PARTIAL_COMPLETED, APPROVED
      completed: number; // Sum of COMPLETED, CLOSED
      issues: number; // Sum of REJECTED, UNPROCESSABLE, FAILED, CANCELLED
    };
    unreadNotifications: number;
  };
}
```

---

### 2. Staff POV (`staff_company` / `staff_unassigned`)

**Condition:** User has the role `staff_company` atau `staff_unassigned`.

**Response Status:** `200 OK`

```json
{
  "role": "staff_company",
  "metrics": {
    "workOrders": {
      "total": 5,
      "ongoing": 2,
      "pendingAction": 1,
      "completed": 2
    },
    "workReports": {
      "pendingAction": 1
    },
    "unreadNotifications": 2
  }
}
```

**Typescript Interface:**
```typescript
interface StaffDashboardResponse {
  role: 'staff_company' | 'staff_unassigned';
  metrics: {
    workOrders: {
      total: number;
      ongoing: number; // ON_PROGRESS
      pendingAction: number; // DRAFTED, SENT
      completed: number; // COMPLETED
    };
    workReports: {
      pendingAction: number; // Reports needing attention (DRAFTED, REJECTED)
    };
    unreadNotifications: number;
  };
}
```

---

### 3. Manager Company POV (`manager_company`)

**Condition:** User has the role `manager_company`.

**Response Status:** `200 OK`

```json
{
  "role": "manager_company",
  "metrics": {
    "incomingServiceRequests": 4,
    "workOrders": {
      "total": 45,
      "onProgress": 15,
      "completed": 28,
      "failed": 2
    },
    "pendingApprovals": 6
  }
}
```

**Typescript Interface:**
```typescript
interface ManagerDashboardResponse {
  role: 'manager_company';
  metrics: {
    incomingServiceRequests: number; // Unprocessed requests (RECEIVED)
    workOrders: {
      total: number;
      onProgress: number; // ON_PROGRESS
      completed: number; // COMPLETED
      failed: number; // FAILED
    };
    pendingApprovals: number; // Reports waiting for manager approval (SUBMITTED)
  };
}
```

---

### 4. Owner Company POV (`owner_company`)

**Condition:** User has the role `owner_company`.

**Response Status:** `200 OK`

```json
{
  "role": "owner_company",
  "metrics": {
    "volume": {
      "totalServiceRequests": 120,
      "totalWorkOrders": 115,
      "totalWorkReports": 110
    },
    "staffing": {
      "total": 25,
      "managers": 3,
      "staff": 22
    },
    "completionRate": 85.5
  }
}
```

**Typescript Interface:**
```typescript
interface OwnerDashboardResponse {
  role: 'owner_company';
  metrics: {
    volume: {
      totalServiceRequests: number;
      totalWorkOrders: number;
      totalWorkReports: number;
    };
    staffing: {
      total: number; // All active members
      managers: number; // Total manager_company roles
      staff: number; // Total staff_company & staff_unassigned roles
    };
    completionRate: number; // Percentage float (e.g., 85.5) representing Completed WOs / Total WOs
  };
}
```

---

## Error Handling

| Status Code | Description | Solution |
| :--- | :--- | :--- |
| `401 Unauthorized` | Invalid or missing JWT token. | Provide a valid Bearer token in the `Authorization` header. |
| `403 Forbidden` | User role is invalid or does not have a designated dashboard, or the manager/owner is not assigned to a company. | Ensure the user has an appropriate role and is properly attached to a company (if applicable). |
