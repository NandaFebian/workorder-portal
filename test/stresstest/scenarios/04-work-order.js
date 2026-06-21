import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH } from '../config.js';

const woDuration = new Trend('wo_duration');
const woStatusDuration = new Trend('wo_status_duration');
const errorRate = new Rate('wo_errors');

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const BASE = BASE_URL;

export const options = {
  scenarios: {
    stress: {
      executor: 'per-vu-iterations',
      vus: 100,
      iterations: 20,
      maxDuration: '15m',
    },
  },
  thresholds: {
    wo_duration: ['p(95)<5000'],
    wo_status_duration: ['p(95)<3000'],
    wo_errors: ['rate<0.1'],
    http_req_failed: ['rate<0.1'],
  },
};

export function setup() {
  const managerRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: AUTH.manager.email, password: AUTH.manager.password,
  }), { headers: JSON_HEADERS });
  const managerCred = managerRes.status === 200 ? { token: managerRes.json('data.token') } : null;

  const staffRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: AUTH.staff1.email, password: AUTH.staff1.password,
  }), { headers: JSON_HEADERS });
  const staffCred = staffRes.status === 200 ? { token: staffRes.json('data.token') } : null;

  if (!managerCred) return { managerCred: null, staffCred: null, serviceId: null, staffEmails: [] };

  const svcRes = http.get(`${BASE}/services`, {
    headers: { Authorization: managerCred.token },
  });
  let serviceId = null;
  if (svcRes.status === 200) {
    const svcs = svcRes.json('data') || [];
    const manualSvc = svcs.find((s) => s.draftingWorkOrderType === 'manual');
    if (manualSvc) serviceId = manualSvc.id || manualSvc._id;
  }

  const empRes = http.get(`${BASE}/company/employees`, {
    headers: { Authorization: managerCred.token },
  });
  let staffEmails = [];
  if (empRes.status === 200) {
    const employees = empRes.json('data') || [];
    staffEmails = employees
      .filter((e) => e.role === 'staff_company')
      .map((e) => e.email)
      .filter(Boolean);
  }

  console.log('[WO Setup] serviceId:', serviceId, 'staffEmails:', staffEmails.length);
  return { managerCred, staffCred, serviceId, staffEmails };
}

export default function (data) {
  const { serviceId, staffEmails, managerCred, staffCred } = data;

  if (!managerCred || !staffCred) {
    sleep(1);
    return;
  }

  const managerHeaders = { Authorization: managerCred.token, ...JSON_HEADERS };
  const staffHeaders = { Authorization: staffCred.token, ...JSON_HEADERS };

  // GET /workorders (Manager)
  {
    const res = http.get(`${BASE}/workorders`, { headers: managerHeaders });
    const ok = check(res, { 'wo list 200': (r) => r.status === 200 });
    woDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // POST /services/:id/create-work-order (Manager)
  let woId = null;
  if (serviceId) {
    const res = http.post(
      `${BASE}/services/${serviceId}/create-work-order`,
      JSON.stringify({}),
      { headers: managerHeaders },
    );
    const ok = check(res, {
      'create wo 200/201': (r) => r.status === 200 || r.status === 201,
    });
    woDuration.add(res.timings.duration);
    errorRate.add(!ok);
    if (ok) {
      woId = res.json('data._id') || res.json('data.id');
    }
  }

  sleep(0.3);

  // PUT /workorders/:id/assign-staffs (Manager)
  if (woId && staffEmails.length > 0) {
    const res = http.put(
      `${BASE}/workorders/${woId}/assign-staffs`,
      JSON.stringify({
        staff_pic: staffEmails[0],
        assign_staffs: staffEmails.slice(0, 2),
      }),
      { headers: managerHeaders },
    );
    const ok = check(res, {
      'assign staff 200/400': (r) => r.status === 200 || r.status === 400,
    });
    woStatusDuration.add(res.timings.duration);
    errorRate.add(res.status >= 500);
  }

  sleep(0.3);

  // PATCH /workorders/:id/sent (Manager sends it)
  if (woId) {
    const res = http.patch(`${BASE}/workorders/${woId}/sent`, null, { headers: managerHeaders });
    woStatusDuration.add(res.timings.duration);
    errorRate.add(res.status >= 500);
  }

  sleep(0.3);

  // PATCH /workorders/:id/approve (Manager approves it)
  if (woId) {
    const res = http.patch(`${BASE}/workorders/${woId}/approve`, null, { headers: managerHeaders });
    woStatusDuration.add(res.timings.duration);
    errorRate.add(res.status >= 500);
  }

  sleep(0.3);

  // PATCH /workorders/:id/start (Staff starts it)
  if (woId) {
    const res = http.patch(`${BASE}/workorders/${woId}/start`, null, { headers: staffHeaders });
    woStatusDuration.add(res.timings.duration);
    errorRate.add(res.status >= 500);
  }

  sleep(0.3);

  // PATCH /workorders/:id/complete (Staff completes it)
  if (woId) {
    const res = http.patch(`${BASE}/workorders/${woId}/complete`, null, { headers: staffHeaders });
    woStatusDuration.add(res.timings.duration);
    errorRate.add(res.status >= 500);
  }

  sleep(0.3);

  // GET /workorders/:id
  if (woId) {
    const res = http.get(`${BASE}/workorders/${woId}`, { headers: managerHeaders });
    const ok = check(res, { 'wo detail 200': (r) => r.status === 200 });
    woDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // GET /workorders/:id/report
  if (woId) {
    const res = http.get(`${BASE}/workorders/${woId}/report`, { headers: managerHeaders });
    const ok = check(res, { 'wo report 200/404': (r) => r.status === 200 || r.status === 404 });
    woDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.5);
}
