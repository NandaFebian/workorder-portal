# Membership Module API Documentation

This document describes the endpoints available in the Membership module.

## Base URL
`/memberships`

## Authentication
All endpoints require a valid Bearer Token.

---

## Error Responses
Error responses follow a standard format:
```json
{
  "message": "Error message description",
  "errors": {
    "field_name": [
      { "field_name": "Specific validation error message" }
    ]
  },
  "code": "ERROR_CODE_STRING"
}
```

---

## 1. List All Memberships
Retrieve a list of all membership codes and their status.

- **URL:** `/memberships`
- **Method:** `GET`
- **Auth Required:** Yes
- **Roles Required:** `company_owner`, `company_manager`, `admin_app`

### Response
Returns an array of membership objects.
```json
[
  {
    "_id": "67512345...",
    "code": "MEM-AB12CD",
    "isClaimed": true,
    "claimedBy": {
        "_id": "user_id...",
        "name": "User Name",
        "email": "user@example.com"
    },
    "claimedAt": "2023-12-05T10:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  },
  {
    "_id": "67512346...",
    "code": "MEM-XY98ZZ",
    "isClaimed": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

## 2. Generate Membership Codes
Generate a batch of new membership codes.

- **URL:** `/memberships/generate`
- **Method:** `POST`
- **Auth Required:** Yes
- **Roles Required:** `company_owner`, `company_manager`, `admin_app`

### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | number | Yes | Number of codes to generate (1-100). |
| `prefix` | string | No | Optional prefix for the codes. Default: "MEM" |

**Example Request:**
```json
{
  "amount": 10,
  "prefix": "PROMO"
}
```

### Response
Returns the list of generated codes.
```json
[
  {
    "code": "PROMO-1A2B3C",
    "isClaimed": false,
    "_id": "...",
    "__v": 0
  },
  ...
]
```

---

## 3. Claim Membership Code
Claim a membership code for the currently authenticated user.

- **URL:** `/memberships/claim`
- **Method:** `POST`
- **Auth Required:** Yes
- **Roles Required:** Any authenticated user.

### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `code` | string | Yes | The membership code to claim. |

**Example Request:**
```json
{
  "code": "PROMO-1A2B3C"
}
```

### Response
Returns the updated membership object.

**Success (201 Created):**
```json
{
  "_id": "...",
  "code": "PROMO-1A2B3C",
  "isClaimed": true,
  "claimedBy": "user_id_here",
  "claimedAt": "2023-12-05T10:05:00.000Z",
  ...
}
```

**Errors:**
- `404 Not Found`: If the code does not exist.
  ```json
  {
      "message": "Membership code not found",
      "code": "MEMBERSHIP_NOT_FOUND"
  }
  ```
- `409 Conflict`: If the code has already been claimed.
  ```json
  {
      "message": "Membership code already claimed",
      "code": "MEMBERSHIP_ALREADY_CLAIMED"
  }
  ```
