# Fix & Refine k6 Stress Test Scripts + 100 Dummy Users CSV

## Problem

Current stress test scripts have several issues:
1. **Shared token bottleneck** — Scenarios 03–08 use a single owner/staff token across 100 VUs, causing authentication failures under load
2. **Missing CSV-based multi-user simulation** — No mechanism for 100 concurrent users with unique sessions
3. **Flow logic bugs** — Several scenarios skip critical validation checks or don't handle state transitions correctly
4. **Setup data coupling** — Each scenario re-logins in its own `setup()`, duplicating work and risking token expiry

## Proposed Changes

### 1. CSV Dummy Users

#### [NEW] [users.csv](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/data/users.csv)
- 100 rows: `name,email,password,role`
- Mix of roles: 70 clients, 15 staff_unassigned, 10 manager_company, 5 owner
- All with password `StressTest123!`

#### [NEW] [generate-users.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/data/generate-users.js)
- Node.js script to generate/regenerate the CSV

---

### 2. Setup Script Fix

#### [MODIFY] [setup.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/helpers/setup.js)
- Add bulk registration of all 100 CSV users (register + login, store tokens)
- Return `userTokens[]` array for scenarios to pick from using `__VU`

---

### 3. Scenario Script Fixes

#### [MODIFY] [01-auth.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/scenarios/01-auth.js)
- Use `SharedArray` + CSV to load user data
- Each VU picks a unique user via `__VU % users.length`
- Flow: register (unique email per iteration) → login → profile → logout
- **No changes needed to flow** — already correct

#### [MODIFY] [02-public-client.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/scenarios/02-public-client.js)
- Load CSV users via SharedArray for authenticated requests
- Login per-VU user in setup
- Fix: add `check()` for customer-pairing GET

#### [MODIFY] [03-service-request.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/scenarios/03-service-request.js)
- Use per-VU client tokens from CSV
- Fix: manager (not owner) approves SR when `serviceRequestApprovalAccessType === 'manager'`
- Fix: wrap SR report GET in proper check

#### [MODIFY] [04-work-order.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/scenarios/04-work-order.js)
- Use per-VU owner/manager token
- Fix: staff should start WO (not owner) — staff gets the `start` action
- Fix: WO lifecycle should be: create → assign → sent → approve → start(staff) → complete(staff)
- Login staff in setup for `start`/`complete` actions

#### [MODIFY] [05-work-report.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/scenarios/05-work-report.js)
- Fix: staff submits and sends report, owner/manager approves
- Fix: add `check()` to sent/approve calls
- Fix: handle scenario where no work orders exist gracefully

#### [MODIFY] [06-dashboard.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/scenarios/06-dashboard.js)
- No major flow issue — minor: add check for all 3 dashboard endpoints

#### [MODIFY] [07-company-admin.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/scenarios/07-company-admin.js)
- Fix: `GET /company/employees/:id` does a redundant employee list call every iteration — cache employee ID from setup
- Fix: add check() for PUT /company, GET /company/integration-config, invite

#### [MODIFY] [08-services-config.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/scenarios/08-services-config.js)
- Fix: `POST /services` payload missing `workOrderFormId: null` for manual service (already seen causing 400)
- Fix: add proper checks to all CRUD operations
- Fix: template generate `POST` not tested — add it

---

### 4. Config Update

#### [MODIFY] [config.js](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/stresstest/config.js)
- Add `CSV_PATH` export pointing to `./data/users.csv`

---

## Verification Plan

### Manual Verification
- Run `npm run setup` → verify no 4xx/5xx in logs
- Run individual scenario: `k6 run scenarios/01-auth.js` → verify checks pass
- Run `.\run-all.ps1` → verify summary.html generates correctly
