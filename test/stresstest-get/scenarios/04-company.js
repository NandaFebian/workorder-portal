import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH } from '../config.js';

const t_company = new Trend('get_company');
const t_company_detail = new Trend('get_company_detail');
const t_employees = new Trend('get_company_employees');
const t_integration = new Trend('get_company_integration_config');
const t_inv_history = new Trend('get_company_inv_history');
const t_positions = new Trend('get_positions_list');
const t_position_detail = new Trend('get_position_detail');
const errorRate = new Rate('company_errors');

const BASE = BASE_URL;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const options = {
  scenarios: { stress: { executor: 'per-vu-iterations', vus: 100, iterations: 20, maxDuration: '5m' } },
  thresholds: {
    get_company: ['p(95)<5000'],
    get_company_detail: ['p(95)<5000'],
    get_company_employees: ['p(95)<5000'],
    get_company_integration_config: ['p(95)<5000'],
    get_company_inv_history: ['p(95)<5000'],
    get_positions_list: ['p(95)<5000'],
    get_position_detail: ['p(95)<5000'],
    company_errors: ['rate<0.3'],
  },
};

export function setup() {
  const ownerRes = http.post(`${BASE}/auth/login`, JSON.stringify({
    email: AUTH.owner.email, password: AUTH.owner.password,
  }), { headers: JSON_HEADERS });
  const ownerToken = ownerRes.status === 200 ? ownerRes.json('data.token') : null;

  console.log('[Setup] ownerToken:', !!ownerToken);
  return { ownerToken };
}

export default function (data) {
  const { ownerToken } = data;
  if (!ownerToken) { sleep(1); return; }

  const headers = { Authorization: ownerToken };

  let positionId = 'dummy-id';

  // GET /company
  {
    const res = http.get(`${BASE}/company`, { headers });
    const ok = check(res, { 'company 200': (r) => r.status === 200 });
    t_company.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /company/detail
  {
    const res = http.get(`${BASE}/company/detail`, { headers });
    const ok = check(res, { 'company detail 200': (r) => r.status === 200 });
    t_company_detail.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /company/employees
  {
    const res = http.get(`${BASE}/company/employees`, { headers });
    const ok = check(res, { 'employees 200': (r) => r.status === 200 });
    t_employees.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /company/integration-config
  {
    const res = http.get(`${BASE}/company/integration-config`, { headers });
    const ok = check(res, { 'integration config 200': (r) => r.status === 200 });
    t_integration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /company/invitations/history
  {
    const res = http.get(`${BASE}/company/invitations/history`, { headers });
    const ok = check(res, { 'inv history 200': (r) => r.status === 200 });
    t_inv_history.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /positions
  {
    const res = http.get(`${BASE}/positions`, { headers });
    const ok = check(res, { 'positions 200': (r) => r.status === 200 });
    t_positions.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const arr = res.json('data') || [];
      if (arr.length > 0) {
        const item = arr[Math.floor(Math.random() * arr.length)];
        positionId = item.id || item._id;
      }
    }
  }

  sleep(0.2);

  // GET /positions/:id
  {
    const res = http.get(`${BASE}/positions/${positionId}`, { headers });
    const ok = check(res, { 'position detail 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_position_detail.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);
}

