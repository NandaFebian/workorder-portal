import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH } from '../config.js';

const companyDuration = new Trend('company_duration');
const errorRate = new Rate('company_errors');

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
    company_duration: ['p(95)<3000'],
    company_errors: ['rate<0.1'],
    http_req_failed: ['rate<0.1'],
  },
};

export function setup() {
  const ownerRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: AUTH.owner.email, password: AUTH.owner.password,
  }), { headers: JSON_HEADERS });
  const ownerCred = ownerRes.status === 200 ? { token: ownerRes.json('data.token') } : null;
  if (!ownerCred) return { ownerCred: null, positionId: null, employeeId: null };

  const posRes = http.get(`${BASE}/positions`, {
    headers: { Authorization: ownerCred.token },
  });
  let positionId = null;
  if (posRes.status === 200) {
    const positions = posRes.json('data') || [];
    if (positions.length > 0) positionId = positions[0]._id || positions[0].id;
  }

  const empRes = http.get(`${BASE}/company/employees`, {
    headers: { Authorization: ownerCred.token },
  });
  let employeeId = null;
  if (empRes.status === 200) {
    const employees = empRes.json('data') || [];
    if (employees.length > 0) employeeId = employees[0].id || employees[0]._id;
  }

  return { ownerCred, positionId, employeeId };
}

export default function (data) {
  const { ownerCred, positionId, employeeId } = data;
  if (!ownerCred) {
    sleep(1);
    return;
  }

  const headers = { ...JSON_HEADERS, Authorization: ownerCred.token };

  // GET /company
  {
    const res = http.get(`${BASE}/company`, { headers });
    const ok = check(res, { 'company get 200': (r) => r.status === 200 });
    companyDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // PUT /company
  {
    const res = http.put(`${BASE}/company`, JSON.stringify({
      description: `Stress updated at ${Date.now()}`,
    }), { headers });
    const ok = check(res, { 'company put 200/201': (r) => r.status === 200 || r.status === 201 });
    companyDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // GET /company/employees
  {
    const res = http.get(`${BASE}/company/employees`, { headers });
    const ok = check(res, { 'employees list 200': (r) => r.status === 200 });
    companyDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // GET /company/employees/:id
  if (employeeId) {
    const res = http.get(`${BASE}/company/employees/${employeeId}`, { headers });
    const ok = check(res, { 'employee detail 200': (r) => r.status === 200 });
    companyDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // GET /company/integration-config
  {
    const res = http.get(`${BASE}/company/integration-config`, { headers });
    const ok = check(res, { 'integration config 200': (r) => r.status === 200 });
    companyDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // POST /company/invite
  if (positionId) {
    const email = `invite-${__VU}-${Date.now()}@stresstest.com`;
    const res = http.post(`${BASE}/company/invite`, JSON.stringify({
      invites: [{ email, role: 'staff_company', positionId }],
    }), { headers });
    const ok = check(res, { 'invite staff 200/201': (r) => r.status === 200 || r.status === 201 });
    companyDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // GET /company/invitations/history
  {
    const res = http.get(`${BASE}/company/invitations/history`, { headers });
    const ok = check(res, { 'invitation history 200': (r) => r.status === 200 });
    companyDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // GET /positions
  {
    const res = http.get(`${BASE}/positions`, { headers });
    const ok = check(res, { 'positions list 200': (r) => r.status === 200 });
    companyDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // POST /positions
  let posId = null;
  {
    const res = http.post(`${BASE}/positions`, JSON.stringify({
      name: `StressPos-${__VU}-${Date.now()}`,
      description: 'Stress test position',
      isActive: true,
    }), { headers });
    const ok = check(res, {
      'create position 200/201': (r) => r.status === 201 || r.status === 200,
    });
    companyDuration.add(res.timings.duration);
    errorRate.add(!ok);
    if (ok) posId = res.json('data._id') || res.json('data.id');
  }

  sleep(0.3);

  // GET /positions/:id
  if (posId) {
    const res = http.get(`${BASE}/positions/${posId}`, { headers });
    companyDuration.add(res.timings.duration);
  }

  sleep(0.3);

  // PUT /positions/:id
  if (posId) {
    const res = http.put(`${BASE}/positions/${posId}`, JSON.stringify({
      name: `Updated-${__VU}`,
      description: 'Updated',
      isActive: true,
    }), { headers });
    companyDuration.add(res.timings.duration);
  }

  sleep(0.3);

  // DELETE /positions/:id
  if (posId) {
    const res = http.del(`${BASE}/positions/${posId}`, null, { headers });
    companyDuration.add(res.timings.duration);
  }

  sleep(0.3);

  // GET /invitations/pending
  {
    const res = http.get(`${BASE}/invitations/pending`, { headers });
    companyDuration.add(res.timings.duration);
  }

  sleep(0.5);
}
