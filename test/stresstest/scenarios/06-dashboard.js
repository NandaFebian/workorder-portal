import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH, PERIOD_TYPES } from '../config.js';

const dashDuration = new Trend('dash_duration');
const errorRate = new Rate('dash_errors');

const JSON_HEADERS = { 'Content-Type': 'application/json' };

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
    dash_duration: ['p(95)<3000'],
    dash_errors: ['rate<0.1'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE = BASE_URL;

export function setup() {
  const managerRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: AUTH.manager.email, password: AUTH.manager.password,
  }), { headers: JSON_HEADERS });
  const managerCred = managerRes.status === 200 ? { token: managerRes.json('data.token') } : null;
  return { managerCred };
}

export default function (data) {
  const { managerCred } = data;
  if (!managerCred) {
    sleep(1);
    return;
  }

  const headers = { Authorization: managerCred.token };
  const period = PERIOD_TYPES[__VU % PERIOD_TYPES.length];

  // GET /dashboard/service-request?period_type=...
  {
    const res = http.get(`${BASE}/dashboard/service-request?period_type=${period}`, { headers });
    const ok = check(res, { 'dash sr 200': (r) => r.status === 200 });
    dashDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // GET /dashboard/work-order?period_type=...
  {
    const res = http.get(`${BASE}/dashboard/work-order?period_type=${period}`, { headers });
    const ok = check(res, { 'dash wo 200': (r) => r.status === 200 });
    dashDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // GET /dashboard/company/
  {
    const res = http.get(`${BASE}/dashboard/company/`, { headers });
    const ok = check(res, { 'dash company 200': (r) => r.status === 200 });
    dashDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.5);
}
