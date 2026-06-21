import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { BASE_URL, CSV_PATH } from '../config.js';

const srDuration = new Trend('sr_duration');
const approveDuration = new Trend('sr_approve_duration');
const errorRate = new Rate('sr_errors');

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
    sr_duration: ['p(95)<5000'],
    sr_approve_duration: ['p(95)<3000'],
    sr_errors: ['rate<0.1'],
    http_req_failed: ['rate<0.1'],
  },
};

const users = new SharedArray('users', function () {
  return open('../' + CSV_PATH).split('\n').slice(1).filter(Boolean).map((line) => {
    const [name, email, password, role] = line.split(',');
    return { name, email, password, role };
  });
});

export function setup() {
  const managers = users.filter((u) => u.role === 'staff_unassigned' && u.name.includes('Manager'));
  const clients = users.filter((u) => u.role === 'client');

  const managerLogin = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: managers[0].email, password: managers[0].password,
  }), { headers: JSON_HEADERS });
  const managerCred = managerLogin.status === 200 ? { token: managerLogin.json('data.token') } : null;

  const clientCreds = [];
  for (const c of clients.slice(0, 100)) {
    const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: c.email, password: c.password,
    }), { headers: JSON_HEADERS });
    if (res.status === 200) clientCreds.push({ token: res.json('data.token'), email: c.email });
  }

  if (!managerCred) return { managerCred: null, clientCreds, serviceId: null, intakeFormId: null };

  const svcRes = http.get(`${BASE}/services`, {
    headers: { Authorization: managerCred.token },
  });
  let serviceId = null;
  let intakeFormId = null;

  if (svcRes.status === 200) {
    const svcs = svcRes.json('data') || [];
    for (const svc of svcs) {
      const sid = svc.id || svc._id;
      const intakeRes = http.get(`${BASE}/public/services/${sid}/intake-form`);
      if (intakeRes.status === 200 && intakeRes.json('data')) {
        serviceId = sid;
        intakeFormId = intakeRes.json('data._id') || intakeRes.json('data.id');
        break;
      }
    }
  }

  console.log('[SR Setup] serviceId:', serviceId, 'intakeFormId:', intakeFormId);
  return { managerCred, clientCreds, serviceId, intakeFormId };
}

export default function (data) {
  const { serviceId, intakeFormId, managerCred, clientCreds } = data;
  const client = clientCreds.length > 0 ? clientCreds[__VU % clientCreds.length] : null;

  if (!client || !serviceId) {
    sleep(1);
    return;
  }

  const clientHeaders = { Authorization: client.token };
  const managerHeaders = managerCred ? { Authorization: managerCred.token } : {};

  // GET /service-requests/sent
  {
    const res = http.get(`${BASE}/service-requests/sent`, { headers: clientHeaders });
    const ok = check(res, { 'sent list 200': (r) => r.status === 200 });
    srDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // POST /service-requests/service/:serviceId
  let srId = null;
  {
    const payload = intakeFormId ? {
      formId: intakeFormId,
      fieldsData: [
        { order: 1, value: `Stress Client VU${__VU}` },
        { order: 2, value: `Stress test masalah dari VU ${__VU} - ${Date.now()}` },
      ],
    } : {};

    const res = http.post(
      `${BASE}/service-requests/service/${serviceId}`,
      JSON.stringify(intakeFormId ? { submission: payload } : {}),
      { headers: { ...JSON_HEADERS, ...clientHeaders } },
    );
    const ok = check(res, {
      'create sr 200/201': (r) => r.status === 200 || r.status === 201,
    });
    srDuration.add(res.timings.duration);
    errorRate.add(!ok);
    if (ok) {
      srId = res.json('data._id') || res.json('data.id');
    }
  }

  sleep(0.3);

  // GET /service-requests/:id (client)
  if (srId) {
    const res = http.get(`${BASE}/service-requests/${srId}`, { headers: clientHeaders });
    const ok = check(res, { 'sr detail 200': (r) => r.status === 200 });
    srDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // GET /service-requests/inbox (manager)
  if (managerCred) {
    const inboxRes = http.get(`${BASE}/service-requests/inbox`, { headers: managerHeaders });
    const ok = check(inboxRes, { 'inbox 200': (r) => r.status === 200 });
    srDuration.add(inboxRes.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // PATCH /service-requests/:id/approve (manager)
  if (srId && managerCred) {
    const approveRes = http.patch(
      `${BASE}/service-requests/${srId}/approve`,
      null,
      { headers: managerHeaders },
    );
    const ok = check(approveRes, {
      'approve sr': (r) => r.status === 200 || r.status === 400,
    });
    approveDuration.add(approveRes.timings.duration);
    errorRate.add(approveRes.status >= 500);
  }

  sleep(0.3);

  // GET /service-requests/:id/report
  if (srId) {
    const res = http.get(`${BASE}/service-requests/${srId}/report`, { headers: clientHeaders });
    const ok = check(res, { 'sr report 200': (r) => r.status === 200 || r.status === 404 });
    srDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.5);
}
