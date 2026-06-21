import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, AUTH } from '../config.js';
import { SharedArray } from 'k6/data';

const csvRows = new SharedArray('users', function () {
  return open('../data/users.csv').split('\n').slice(1).filter(Boolean);
});

const BASE = BASE_URL;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

function post(url, payload, headers = {}) {
  return http.post(url, JSON.stringify(payload), {
    headers: { ...JSON_HEADERS, ...headers },
  });
}

function login(email, password) {
  const res = post(`${BASE}/auth/login`, { email, password });
  if (res.status === 200) return res.json('data.token');
  return null;
}

export const options = {
  setupTimeout: '5m',
};

export function setup() {
  console.log('[SETUP] Starting full flow data setup...');

  // ═══ 1. Register company owner (ignore if already registered) ═══
  const ownerRegRes = post(`${BASE}/auth/register-company`, AUTH.owner);
  console.log('[SETUP] Owner register status:', ownerRegRes.status, ownerRegRes.body);
  // Login as owner to get fresh token (works whether register succeeded or user already existed)
  const ownerToken = login(AUTH.owner.email, AUTH.owner.password);
  if (!ownerToken) {
    console.error('[SETUP] Owner login failed, aborting.');
    return {};
  }

  // Get company info from profile
  const profileRes = http.get(`${BASE}/auth/profile`, {
    headers: { Authorization: ownerToken },
  });
  const companyId = profileRes.json('data.company._id') || profileRes.json('data.company.id');
  console.log('[SETUP] CompanyId:', companyId);

  // ═══ 2. Create or reuse Position (needed before staff invite) ═══
  let positionId = null;
  {
    const existingPos = http.get(`${BASE}/positions`, {
      headers: { Authorization: ownerToken },
    });
    if (existingPos.status === 200) {
      const positions = existingPos.json('data') || [];
      const found = positions.find((p) => p.name === 'Teknisi Lapangan');
      if (found) positionId = found._id || found.id;
    }
    if (!positionId) {
      const posRes = post(`${BASE}/positions`, {
        name: 'Teknisi Lapangan',
        description: 'Field technician for stress testing',
        isActive: true,
      }, { Authorization: ownerToken });
      console.log('[SETUP] Position create status:', posRes.status);
      positionId = posRes.json('data._id') || posRes.json('data.id') || null;
    }
  }
  console.log('[SETUP] PositionId:', positionId);

  // ═══ 3. Owner invites manager & staff (BEFORE they register) ═══
  function tryInvite(email, role, extraFields) {
    const payload = { invites: [{ email, role, ...extraFields }] };
    const res = post(`${BASE}/company/invite`, payload, { Authorization: ownerToken });
    if (res.status === 200 || res.status === 201) {
      console.log(`[SETUP] Invite ${email} as ${role}: OK`);
    } else {
      console.log(`[SETUP] Invite ${email} as ${role}: ${res.status}`, res.body);
    }
  }

  tryInvite(AUTH.manager.email, 'manager_company', {});
  if (positionId) {
    tryInvite(AUTH.staff1.email, 'staff_company', { positionId });
    tryInvite(AUTH.staff2.email, 'staff_company', { positionId });
  } else {
    console.log('[SETUP] No positionId, skipping staff invites');
  }

  sleep(0.5);

  // ═══ 4. Register manager & staff (AFTER invite is sent) ═══
  const r1 = post(`${BASE}/auth/register`, { ...AUTH.manager, role: 'staff_unassigned' });
  console.log('[SETUP] Manager register:', r1.status);
  const r2 = post(`${BASE}/auth/register`, { ...AUTH.staff1, role: 'staff_unassigned' });
  console.log('[SETUP] Staff1 register:', r2.status);
  const r3 = post(`${BASE}/auth/register`, { ...AUTH.staff2, role: 'staff_unassigned' });
  console.log('[SETUP] Staff2 register:', r3.status);

  sleep(0.5);

  // ═══ 5. Accept invitations ═══
  function acceptPendingInvitations(email, password) {
    const token = login(email, password);
    if (!token) return token;
    const pendingRes = http.get(`${BASE}/invitations/pending`, {
      headers: { Authorization: token },
    });
    if (pendingRes.status === 200) {
      const invitations = pendingRes.json('data') || [];
      for (const inv of invitations) {
        const invId = inv.id || inv._id;
        http.put(`${BASE}/invitations/${invId}/accept`, null, {
          headers: { Authorization: token },
        });
      }
    }
    return login(email, password);
  }

  const managerToken = acceptPendingInvitations(AUTH.manager.email, AUTH.manager.password);
  const staff1Token = acceptPendingInvitations(AUTH.staff1.email, AUTH.staff1.password);
  const staff2Token = acceptPendingInvitations(AUTH.staff2.email, AUTH.staff2.password);

  console.log('[SETUP] Manager token:', !!managerToken);
  console.log('[SETUP] Staff1 token:', !!staff1Token);
  console.log('[SETUP] Staff2 token:', !!staff2Token);

  let staff1Id = null;
  let staff2Id = null;
  if (staff1Token) {
    const p = http.get(`${BASE}/auth/profile`, { headers: { Authorization: staff1Token } });
    if (p.status === 200) staff1Id = p.json('data._id') || p.json('data.id');
  }
  if (staff2Token) {
    const p = http.get(`${BASE}/auth/profile`, { headers: { Authorization: staff2Token } });
    if (p.status === 200) staff2Id = p.json('data._id') || p.json('data.id');
  }

  // ═══ 6. Register clients ═══
  const clientTokens = [];
  for (const line of csvRows) {
    const [name, email, password, role] = line.split(',');
    post(`${BASE}/auth/register`, { name, email, password, role: 'client' });
    const ct = login(email, password);
    if (ct) clientTokens.push(ct);
  }
  console.log('[SETUP] Clients registered:', clientTokens.length);

  // ═══ 7. Create or reuse Forms ═══
  let intakeFormId = null;
  let reportFormId = null;
  let woFormId = null;

  // Check existing forms first
  {
    const existingForms = http.get(`${BASE}/forms`, {
      headers: { Authorization: ownerToken },
    });
    if (existingForms.status === 200) {
      const forms = existingForms.json('data') || [];
      for (const f of forms) {
        const fId = f._id || f.id;
        if (f.formType === 'intake' && !intakeFormId) intakeFormId = fId;
        if (f.formType === 'report' && !reportFormId) reportFormId = fId;
        if (f.formType === 'work_order' && !woFormId) woFormId = fId;
      }
    }
  }

  // Create missing forms
  if (!intakeFormId) {
    const res = post(`${BASE}/forms`, {
      title: 'Stress Test Intake Form',
      description: 'Intake form for stress testing',
      formType: 'intake',
      fields: [
        { order: 1, label: 'Nama Lengkap', type: 'text', required: true, placeholder: 'Masukkan nama' },
        { order: 2, label: 'Deskripsi Masalah', type: 'textarea', required: true, placeholder: 'Jelaskan masalah Anda' },
      ],
    }, { Authorization: ownerToken });
    console.log('[SETUP] Intake form create:', res.status);
    intakeFormId = res.json('data._id') || res.json('data.id') || null;
  }
  console.log('[SETUP] IntakeFormId:', intakeFormId);

  if (!reportFormId) {
    const res = post(`${BASE}/forms`, {
      title: 'Stress Test Report Form',
      description: 'Report form for stress testing',
      formType: 'report',
      fields: [
        { order: 1, label: 'Catatan Pekerjaan', type: 'textarea', required: true, placeholder: 'Catatan' },
        {
          order: 2, label: 'Status Penyelesaian', type: 'single_select', required: true, options: [
            { key: 'done', value: 'Selesai' },
            { key: 'partial', value: 'Sebagian' },
          ]
        },
      ],
    }, { Authorization: ownerToken });
    console.log('[SETUP] Report form create:', res.status);
    reportFormId = res.json('data._id') || res.json('data.id') || null;
  }
  console.log('[SETUP] ReportFormId:', reportFormId);

  if (!woFormId) {
    const res = post(`${BASE}/forms`, {
      title: 'Stress Test WO Form',
      description: 'Work order form for stress testing',
      formType: 'work_order',
      fields: [
        { order: 1, label: 'Catatan Teknis', type: 'textarea', required: false, placeholder: 'Catatan teknis' },
      ],
    }, { Authorization: ownerToken });
    console.log('[SETUP] WO form create:', res.status);
    woFormId = res.json('data._id') || res.json('data.id') || null;
  }
  console.log('[SETUP] WoFormId:', woFormId);

  // ═══ 8. Create or reuse Service ═══
  let serviceId = null;
  let autoServiceId = null;

  // Check existing services
  {
    const existingSvc = http.get(`${BASE}/services`, {
      headers: { Authorization: ownerToken },
    });
    if (existingSvc.status === 200) {
      const svcs = existingSvc.json('data') || [];
      for (const s of svcs) {
        const sid = s._id || s.id;
        if (s.draftingWorkOrderType === 'manual' && !serviceId) serviceId = sid;
        if (s.draftingWorkOrderType === 'auto' && !autoServiceId) autoServiceId = sid;
      }
    }
  }

  if (!serviceId && intakeFormId && reportFormId && positionId) {
    const svcRes = post(`${BASE}/services`, {
      title: `Stress Test Service ${Date.now()}`,
      description: 'Service created for stress testing - full flow',
      accessType: 'public',
      isActive: true,
      draftingWorkOrderType: 'manual',
      serviceRequestConfig: {
        intakeFormId: intakeFormId,
        serviceRequestApprovalAccessType: 'manager',
        reviewNeed: false,
      },
      workOrdersConfig: [{
        positionId: positionId,
        workOrderFormId: woFormId || null,
        workReportFormId: reportFormId,
        workOrderApprovalAccessType: 'auto',
        workReportApprovalAccessType: 'auto',
        minStaff: 1,
        maxStaff: 2,
        showReportToRequester: false,
      }],
    }, { Authorization: ownerToken });
    console.log('[SETUP] Service create:', svcRes.status);
    serviceId = svcRes.json('data._id') || svcRes.json('data.id') || null;
  }
  console.log('[SETUP] ServiceId:', serviceId);

  if (!autoServiceId && intakeFormId && reportFormId && positionId) {
    const autoSvcRes = post(`${BASE}/services`, {
      title: `Stress Auto Service ${Date.now()}`,
      description: 'Auto-approve service for stress testing',
      accessType: 'public',
      isActive: true,
      draftingWorkOrderType: 'auto',
      serviceRequestConfig: {
        intakeFormId: intakeFormId,
        serviceRequestApprovalAccessType: 'auto',
        reviewNeed: false,
      },
      workOrdersConfig: [{
        positionId: positionId,
        workOrderFormId: null,
        workReportFormId: reportFormId,
        workOrderApprovalAccessType: 'auto',
        workReportApprovalAccessType: 'auto',
        minStaff: 1,
        maxStaff: 1,
        showReportToRequester: false,
      }],
    }, { Authorization: ownerToken });
    console.log('[SETUP] Auto service create:', autoSvcRes.status, autoSvcRes.body);
    autoServiceId = autoSvcRes.json('data._id') || autoSvcRes.json('data.id') || null;
  }
  console.log('[SETUP] AutoServiceId:', autoServiceId);

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
    clientTokens,
    companyId,
    serviceId,
    autoServiceId,
    positionId,
    intakeFormId,
    reportFormId,
    woFormId,
  };
}

export default function () {
  console.log('Setup script is not meant to be run as a load test.');
  console.log('Use: k6 run helpers/setup.js to provision data.');
}
