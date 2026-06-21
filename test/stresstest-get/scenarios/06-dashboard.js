import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH, PERIOD_TYPES } from '../config.js';

const t_dash_sr = new Trend('get_dashboard_sr');
const t_dash_wo = new Trend('get_dashboard_wo');
const t_dash_company = new Trend('get_dashboard_company');
const errorRate = new Rate('dashboard_errors');

const BASE = BASE_URL;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const options = {
  scenarios: { stress: { executor: 'per-vu-iterations', vus: 100, iterations: 20, maxDuration: '5m' } },
  thresholds: {
    get_dashboard_sr: ['p(95)<5000'],
    get_dashboard_wo: ['p(95)<5000'],
    get_dashboard_company: ['p(95)<5000'],
    dashboard_errors: ['rate<0.3'],
  },
};

export function setup() {
  const managerRes = http.post(`${BASE}/auth/login`, JSON.stringify({
    email: AUTH.owner.email, password: AUTH.owner.password,
  }), { headers: JSON_HEADERS });
  const managerToken = managerRes.status === 200 ? managerRes.json('data.token') : null;

  console.log('[Setup] managerToken:', !!managerToken);
  return { managerToken };
}

export default function (data) {
  const { managerToken } = data;
  if (!managerToken) { sleep(1); return; }

  const headers = { Authorization: managerToken };
  const period = PERIOD_TYPES[__VU % PERIOD_TYPES.length];

  // GET /dashboard/service-request?period_type=...
  {
    const res = http.get(`${BASE}/dashboard/service-request?period_type=${period}`, { headers });
    const ok = check(res, { 'dashboard sr 200': (r) => r.status === 200 });
    t_dash_sr.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /dashboard/work-order?period_type=...
  {
    const res = http.get(`${BASE}/dashboard/work-order?period_type=${period}`, { headers });
    const ok = check(res, { 'dashboard wo 200': (r) => r.status === 200 });
    t_dash_wo.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /dashboard/company
  {
    const res = http.get(`${BASE}/dashboard/company`, { headers });
    const ok = check(res, { 'dashboard company 200': (r) => r.status === 200 });
    t_dash_company.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);
}

