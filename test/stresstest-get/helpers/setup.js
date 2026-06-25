import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, AUTH } from '../config.js';
import { SharedArray } from 'k6/data';

// ─────────────────────────────────────────────────────────────────────────────
// Seeder for the Work Order Portal GET stress tests.
//
// This script provisions a realistic dataset by driving the SAME public API
// flow the real application uses, in the correct order:
//
//   1. Register company owner (POST /auth/register-company) + activate company
//   2. Create a Position (POST /positions)
//   3. Register manager + staff as `staff_unassigned` (POST /auth/register)
//   4. Owner invites them (POST /company/invite)   ← user MUST exist first
//   5. They accept the invitation (PUT /invitations/:id/accept)
//   6. Create Intake + Report forms (POST /forms)
//   7. Create a MANUAL service (manager approval) and an AUTO service
//      (auto approval + auto work-order drafting) (POST /services)
//   8. Register clients (POST /auth/register)
//   9. Clients submit intakes (POST /service-requests/service/:serviceId):
//        - AUTO service  → auto-approved + work order created + staff assigned
//                          + drafted work report created
//        - MANUAL service → stays pending in the company inbox
//
// The result populates every GET endpoint exercised by the scenarios:
// public companies/services, service requests (sent/inbox/detail/report),
// work orders + reports, company/employees/positions, forms, dashboard, etc.
//
// Run once before the scenarios:  k6 run helpers/setup.js
// ─────────────────────────────────────────────────────────────────────────────

const csvRows = new SharedArray('users', function () {
  return open('../data/users.csv')
    .split('\n')
    .slice(1)
    .map((line) => line.trim()) // strip trailing \r from CRLF line endings
    .filter(Boolean);
});

const BASE = BASE_URL;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// How many clients to log in and how many intakes to seed. Kept modest so the
// setup finishes well within setupTimeout while still creating enough data.
const SEED_CLIENTS = 10;
const AUTO_SUBMITS_PER_CLIENT = 1;
const MANUAL_SUBMITS_PER_CLIENT = 1;

function post(url, payload, token) {
  const headers = { ...JSON_HEADERS };
  if (token) headers.Authorization = token;
  return http.post(url, JSON.stringify(payload), { headers });
}

function get(url, token) {
  const headers = {};
  if (token) headers.Authorization = token;
  return http.get(url, { headers });
}

function idOf(res, path) {
  return res.json(`${path}._id`) || res.json(`${path}.id`) || null;
}

// login returns the full "Bearer <jwt>" string (the API already prefixes it).
function login(email, password) {
  const res = post(`${BASE}/auth/login`, { email, password });
  if (res.status === 200) return res.json('data.token');
  console.error(`[SETUP] login failed for ${email}: ${res.status} ${res.body}`);
  return null;
}

export const options = {
  setupTimeout: '10m',
};

export function setup() {
  console.log('[SETUP] Starting full-flow data provisioning...');
  console.log('[SETUP] Target:', BASE);

  // ═══ 1. Company owner ═════════════════════════════════════════════════════
  const ownerReg = post(`${BASE}/auth/register-company`, {
    name: AUTH.owner.name,
    email: AUTH.owner.email,
    password: AUTH.owner.password,
    companyName: AUTH.owner.companyName,
  });
  console.log('[SETUP] Owner register:', ownerReg.status);

  const ownerToken = login(AUTH.owner.email, AUTH.owner.password);
  if (!ownerToken) {
    console.error('[SETUP] Owner login failed — aborting.');
    return {};
  }

  // Activate the company so it appears in the public listings (default isActive=false).
  // PUT /company (UpdateCompanyDto) — activate + add a description.
  const putActivate = http.put(
    `${BASE}/company`,
    JSON.stringify({ isActive: true, description: 'Stress Test Company (seeded)' }),
    { headers: { ...JSON_HEADERS, Authorization: ownerToken } },
  );
  console.log('[SETUP] Company activate:', putActivate.status);

  const profileRes = get(`${BASE}/auth/profile`, ownerToken);
  const companyId =
    profileRes.json('data.company._id') || profileRes.json('data.company.id');
  console.log('[SETUP] CompanyId:', companyId);

  // ═══ 2. Position ══════════════════════════════════════════════════════════
  let positionId = null;
  {
    const existing = get(`${BASE}/positions`, ownerToken);
    if (existing.status === 200) {
      const found = (existing.json('data') || []).find(
        (p) => p.name === 'Teknisi Lapangan',
      );
      if (found) positionId = found._id || found.id;
    }
    if (!positionId) {
      const res = post(
        `${BASE}/positions`,
        {
          name: 'Teknisi Lapangan',
          description: 'Field technician for stress testing',
          isActive: true,
        },
        ownerToken,
      );
      console.log('[SETUP] Position create:', res.status);
      positionId = idOf(res, 'data');
    }
  }
  console.log('[SETUP] PositionId:', positionId);

  // ═══ 3. Register manager + staff as staff_unassigned (BEFORE inviting) ═════
  // The invite endpoint requires the invited user to already exist as an
  // unassigned staff member, so registration MUST happen first.
  const internals = [
    { acc: AUTH.manager, role: 'manager_company', positionId: undefined },
    { acc: AUTH.staff1, role: 'staff_company', positionId },
    { acc: AUTH.staff2, role: 'staff_company', positionId },
  ];

  for (const m of internals) {
    const res = post(`${BASE}/auth/register`, {
      name: m.acc.name,
      email: m.acc.email,
      password: m.acc.password,
      role: 'staff_unassigned',
    });
    console.log(`[SETUP] Register ${m.acc.email} (staff_unassigned):`, res.status);
  }

  // ═══ 4. Owner invites manager + staff ═════════════════════════════════════
  for (const m of internals) {
    const invite = { email: m.acc.email, role: m.role };
    if (m.positionId) invite.positionId = m.positionId;
    const res = post(`${BASE}/company/invite`, { invites: [invite] }, ownerToken);
    if (res.status === 200 || res.status === 201) {
      console.log(`[SETUP] Invite ${m.acc.email} as ${m.role}: OK`);
    } else {
      console.error(`[SETUP] Invite ${m.acc.email} as ${m.role}: ${res.status} ${res.body}`);
    }
  }

  sleep(0.5);

  // ═══ 5. Accept invitations ════════════════════════════════════════════════
  function acceptInvitations(acc) {
    let token = login(acc.email, acc.password);
    if (!token) return null;
    const pending = get(`${BASE}/invitations/pending`, token);
    if (pending.status === 200) {
      for (const inv of pending.json('data') || []) {
        const invId = inv.id || inv._id;
        const accRes = http.put(`${BASE}/invitations/${invId}/accept`, null, {
          headers: { Authorization: token },
        });
        console.log(`[SETUP] Accept invite ${invId} for ${acc.email}:`, accRes.status);
      }
    } else {
      console.error(`[SETUP] pending invites for ${acc.email}: ${pending.status} ${pending.body}`);
    }
    // Re-login to obtain a token that now carries companyId + role.
    return login(acc.email, acc.password);
  }

  const managerToken = acceptInvitations(AUTH.manager);
  const staff1Token = acceptInvitations(AUTH.staff1);
  const staff2Token = acceptInvitations(AUTH.staff2);

  console.log('[SETUP] manager/staff1/staff2 tokens:', !!managerToken, !!staff1Token, !!staff2Token);

  let staff1Id = null;
  let staff2Id = null;
  if (staff1Token) staff1Id = idOf(get(`${BASE}/auth/profile`, staff1Token), 'data');
  if (staff2Token) staff2Id = idOf(get(`${BASE}/auth/profile`, staff2Token), 'data');

  // ═══ 6. Forms (intake + report) ═══════════════════════════════════════════
  let intakeFormId = null;
  let reportFormId = null;
  {
    const existing = get(`${BASE}/forms`, ownerToken);
    if (existing.status === 200) {
      for (const f of existing.json('data') || []) {
        const fId = f._id || f.id;
        if (f.formType === 'intake' && !intakeFormId) intakeFormId = fId;
        if (f.formType === 'report' && !reportFormId) reportFormId = fId;
      }
    }
  }

  if (!intakeFormId) {
    const res = post(
      `${BASE}/forms`,
      {
        title: 'Stress Test Intake Form',
        description: 'Intake form for stress testing',
        formType: 'intake',
        fields: [
          { order: 1, label: 'Nama Lengkap', type: 'text', required: true, placeholder: 'Masukkan nama' },
          { order: 2, label: 'Deskripsi Masalah', type: 'textarea', required: true, placeholder: 'Jelaskan masalah Anda' },
        ],
      },
      ownerToken,
    );
    console.log('[SETUP] Intake form create:', res.status, res.status >= 400 ? res.body : '');
    intakeFormId = idOf(res, 'data');
  }
  console.log('[SETUP] IntakeFormId:', intakeFormId);

  if (!reportFormId) {
    const res = post(
      `${BASE}/forms`,
      {
        title: 'Stress Test Report Form',
        description: 'Report form for stress testing',
        formType: 'report',
        fields: [
          { order: 1, label: 'Catatan Pekerjaan', type: 'textarea', required: true, placeholder: 'Catatan' },
          {
            order: 2,
            label: 'Status Penyelesaian',
            type: 'single_select',
            required: true,
            options: [
              { key: 'done', value: 'Selesai' },
              { key: 'partial', value: 'Sebagian' },
            ],
          },
        ],
      },
      ownerToken,
    );
    console.log('[SETUP] Report form create:', res.status, res.status >= 400 ? res.body : '');
    reportFormId = idOf(res, 'data');
  }
  console.log('[SETUP] ReportFormId:', reportFormId);

  // ═══ 7. Services (manual + auto) ══════════════════════════════════════════
  let serviceId = null; // manual
  let autoServiceId = null;
  {
    const existing = get(`${BASE}/services`, ownerToken);
    if (existing.status === 200) {
      for (const s of existing.json('data') || []) {
        const sid = s._id || s.id;
        if (s.draftingWorkOrderType === 'manual' && !serviceId) serviceId = sid;
        if (s.draftingWorkOrderType === 'auto' && !autoServiceId) autoServiceId = sid;
      }
    }
  }

  const canBuildService = intakeFormId && reportFormId && positionId;

  if (!serviceId && canBuildService) {
    const res = post(
      `${BASE}/services`,
      {
        title: `Stress Manual Service ${Date.now()}`,
        description: 'Manual-approval service for stress testing',
        accessType: 'public',
        isActive: true,
        draftingWorkOrderType: 'manual',
        serviceRequestConfig: {
          intakeFormId,
          serviceRequestApprovalAccessType: 'manager',
          reviewNeed: false,
        },
        workOrdersConfig: [
          {
            positionId,
            workReportFormId: reportFormId,
            workOrderApprovalAccessType: 'auto',
            workReportApprovalAccessType: 'auto',
            minStaff: 1,
            maxStaff: 2,
            showReportToRequester: false,
          },
        ],
      },
      ownerToken,
    );
    console.log('[SETUP] Manual service create:', res.status, res.status >= 400 ? res.body : '');
    serviceId = idOf(res, 'data');
  }
  console.log('[SETUP] Manual ServiceId:', serviceId);

  if (!autoServiceId && canBuildService) {
    const res = post(
      `${BASE}/services`,
      {
        title: `Stress Auto Service ${Date.now()}`,
        description: 'Auto-approve + auto-draft service for stress testing',
        accessType: 'public',
        isActive: true,
        draftingWorkOrderType: 'auto',
        serviceRequestConfig: {
          intakeFormId,
          serviceRequestApprovalAccessType: 'auto',
          reviewNeed: false,
        },
        workOrdersConfig: [
          {
            positionId,
            workReportFormId: reportFormId,
            workOrderApprovalAccessType: 'auto',
            workReportApprovalAccessType: 'auto',
            minStaff: 1,
            maxStaff: 2,
            showReportToRequester: true,
          },
        ],
      },
      ownerToken,
    );
    console.log('[SETUP] Auto service create:', res.status, res.status >= 400 ? res.body : '');
    autoServiceId = idOf(res, 'data');
  }
  console.log('[SETUP] Auto ServiceId:', autoServiceId);

  // ═══ 8. Clients ═══════════════════════════════════════════════════════════
  const clientTokens = [];
  for (const line of csvRows) {
    const [name, email, password] = line.split(',');
    post(`${BASE}/auth/register`, { name, email, password, role: 'client' });
    if (clientTokens.length < SEED_CLIENTS) {
      const ct = login(email, password);
      if (ct) clientTokens.push({ token: ct, name, email });
    }
  }
  console.log('[SETUP] Clients logged in for seeding:', clientTokens.length);

  // ═══ 9. Seed service requests + work orders ═══════════════════════════════
  // Resolve each service's ACTUAL intake form straight from the API. The submit
  // endpoint rejects any formId whose formKey differs from the form the service
  // is configured with, so we must use the service's own intake form (forms are
  // versioned by formKey and a reused/old form would not match).
  function resolveIntakeForm(svcId) {
    if (!svcId) return null;
    const res = get(`${BASE}/services/${svcId}/intake-form`, ownerToken);
    if (res.status !== 200) {
      console.error(`[SETUP] get intake-form for ${svcId}: ${res.status} ${res.body}`);
      return null;
    }
    const data = res.json('data');
    if (!data) {
      console.error(`[SETUP] service ${svcId} returned no intake form`);
      return null;
    }
    return { formId: data._id || data.id, fields: data.fields || [] };
  }

  // Generate a valid value for each field based on its type + constraints.
  function buildFieldsData(fields) {
    return (fields || []).map((f) => {
      let value;
      switch (f.type) {
        case 'number':
          value = typeof f.min === 'number' ? f.min : typeof f.max === 'number' ? f.max : 1;
          break;
        case 'single_select':
          value = f.options && f.options[0] ? f.options[0].key : '';
          break;
        case 'multi_select':
          value = f.options && f.options[0] ? [f.options[0].key] : [];
          break;
        case 'checkbox':
          value = true;
          break;
        case 'date':
          value = new Date().toISOString();
          break;
        case 'email':
          value = 'stress-intake@test.com';
          break;
        case 'file':
        case 'image':
          value = 'https://example.com/stress-test.png';
          break;
        default: // text, textarea, ...
          value = `Stress test - ${f.label || 'value'}`;
          break;
      }
      return { order: f.order, value };
    });
  }

  const autoIntake = resolveIntakeForm(autoServiceId);
  const manualIntake = resolveIntakeForm(serviceId);
  console.log('[SETUP] Auto intake form:', autoIntake && autoIntake.formId);
  console.log('[SETUP] Manual intake form:', manualIntake && manualIntake.formId);

  function submitIntake(svcId, intake, client) {
    if (!svcId || !intake) return null;
    const body = { formId: intake.formId, fieldsData: buildFieldsData(intake.fields) };
    const res = post(`${BASE}/service-requests/service/${svcId}`, body, client.token);
    if (res.status !== 200 && res.status !== 201) {
      console.error(`[SETUP] submitIntake ${svcId} (${client.email}): ${res.status} ${res.body}`);
    }
    return res;
  }

  let autoCount = 0;
  let manualCount = 0;
  for (const client of clientTokens) {
    for (let i = 0; i < AUTO_SUBMITS_PER_CLIENT; i++) {
      const r = submitIntake(autoServiceId, autoIntake, client);
      if (r && (r.status === 200 || r.status === 201)) autoCount++;
    }
    for (let i = 0; i < MANUAL_SUBMITS_PER_CLIENT; i++) {
      const r = submitIntake(serviceId, manualIntake, client);
      if (r && (r.status === 200 || r.status === 201)) manualCount++;
    }
  }
  console.log(`[SETUP] Auto service requests created: ${autoCount}`);
  console.log(`[SETUP] Manual service requests created: ${manualCount}`);

  // Sanity check: confirm work orders exist (auto flow should have created them).
  const woCheck = get(`${BASE}/workorders`, managerToken || ownerToken);
  const woCount = woCheck.status === 200 ? (woCheck.json('data') || []).length : -1;
  console.log('[SETUP] Work orders visible to company:', woCount);

  console.log('[SETUP] Complete.');

  return {
    ownerToken,
    managerToken,
    staff1Token,
    staff2Token,
    staff1Id,
    staff2Id,
    staff1Email: AUTH.staff1.email,
    staff2Email: AUTH.staff2.email,
    companyId,
    serviceId,
    autoServiceId,
    positionId,
    intakeFormId,
    reportFormId,
  };
}

export default function () {
  console.log('Setup script is not meant to be run as a load test.');
  console.log('Use: k6 run helpers/setup.js to provision data.');
}
