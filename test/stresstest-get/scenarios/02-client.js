import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { BASE_URL, CSV_PATH } from '../config.js';

const t_profile = new Trend('get_auth_profile');
const t_sr_sent = new Trend('get_sr_sent');
const t_sr_detail = new Trend('get_sr_detail');
const t_sr_report = new Trend('get_sr_report');
const t_cust_pairing = new Trend('get_customer_pairing');
const errorRate = new Rate('client_errors');

const BASE = BASE_URL;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const options = {
  scenarios: { stress: { executor: 'per-vu-iterations', vus: 100, iterations: 20, maxDuration: '5m' } },
  thresholds: {
    get_auth_profile: ['p(95)<5000'],
    get_sr_sent: ['p(95)<5000'],
    get_sr_detail: ['p(95)<5000'],
    get_sr_report: ['p(95)<5000'],
    get_customer_pairing: ['p(95)<5000'],
    client_errors: ['rate<0.3'],
  },
};

const users = new SharedArray('users', function () {
  return open('../' + CSV_PATH)
    .split('\n')
    .slice(1)
    .map((line) => line.trim()) // strip trailing \r from CRLF line endings
    .filter(Boolean)
    .map((line) => {
      const [name, email, password, role] = line.split(',');
      return { name, email, password, role };
    });
});

export function setup() {
  const clients = users.filter((u) => u.role === 'client');
  const clientCreds = [];

  for (const c of clients.slice(0, 5)) {
    const res = http.post(`${BASE}/auth/login`, JSON.stringify({
      email: c.email, password: c.password,
    }), { headers: JSON_HEADERS });
    if (res.status === 200) clientCreds.push({ token: res.json('data.token'), email: c.email });
  }

  console.log('[Setup] clientCreds:', clientCreds.length);
  return { clientCreds };
}

export default function (data) {
  const { clientCreds } = data;
  const client = clientCreds.length > 0 ? clientCreds[__VU % clientCreds.length] : null;
  if (!client) { sleep(1); return; }

  const headers = { Authorization: client.token };
  let serviceRequestId = 'dummy-id';

  // GET /auth/profile
  {
    const res = http.get(`${BASE}/auth/profile`, { headers });
    const ok = check(res, { 'auth profile 200': (r) => r.status === 200 || r.status === 429 });
    t_profile.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /service-requests/sent
  {
    const res = http.get(`${BASE}/service-requests/sent`, { headers });
    const ok = check(res, { 'sr sent 200': (r) => r.status === 200 });
    t_sr_sent.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const arr = res.json('data') || [];
      if (arr.length > 0) {
        const item = arr[Math.floor(Math.random() * arr.length)];
        serviceRequestId = item.id || item._id;
      }
    }
  }

  sleep(0.2);

  // GET /service-requests/:id
  {
    const res = http.get(`${BASE}/service-requests/${serviceRequestId}`, { headers });
    const ok = check(res, { 'sr detail 200/403/404': (r) => [200, 400, 403, 404].includes(r.status) });
    t_sr_detail.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /service-requests/:id/report
  {
    const res = http.get(`${BASE}/service-requests/${serviceRequestId}/report`, { headers });
    const ok = check(res, { 'sr report 200/404/403': (r) => [200, 400, 403, 404].includes(r.status) });
    t_sr_report.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /customer-pairing
  {
    const res = http.get(`${BASE}/customer-pairing`, { headers });
    const ok = check(res, { 'customer pairing 200': (r) => r.status === 200 });
    t_cust_pairing.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);
}

