import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { BASE_URL, CSV_PATH } from '../config.js';

const publicReadDuration = new Trend('public_read_duration');
const errorRate = new Rate('public_errors');

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
    public_read_duration: ['p(95)<3000'],
    public_errors: ['rate<0.1'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE = BASE_URL;

const users = new SharedArray('users', function () {
  return open('../' + CSV_PATH).split('\n').slice(1).filter(Boolean).map((line) => {
    const [name, email, password, role] = line.split(',');
    return { name, email, password, role };
  });
});

export function setup() {
  const clients = users.filter((u) => u.role === 'client');
  const clientCreds = [];
  
  // Log in a subset of clients to avoid huge setup time, say 100
  for (const c of clients.slice(0, 100)) {
    const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: c.email, password: c.password,
    }), { headers: JSON_HEADERS });
    if (res.status === 200) {
      clientCreds.push({ token: res.json('data.token') });
    }
  }

  let companyIds = [];
  let serviceIds = [];

  const compRes = http.get(`${BASE}/public/companies`);
  if (compRes.status === 200) {
    const companies = compRes.json('data') || [];
    companyIds = companies.map((c) => c.id || c._id).filter(Boolean);
  }

  if (companyIds.length > 0) {
    const svcRes = http.get(`${BASE}/public/companies/${companyIds[0]}/services`);
    if (svcRes.status === 200) {
      const services = svcRes.json('data') || [];
      serviceIds = services.map((s) => s.id || s._id).filter(Boolean);
    }
  }

  return { companyIds, serviceIds, clientCreds };
}

export default function (data) {
  const { companyIds, serviceIds, clientCreds } = data;
  const cred = clientCreds.length > 0 ? clientCreds[__VU % clientCreds.length] : null;
  const headers = cred ? { Authorization: cred.token } : {};

  // GET /public/companies
  {
    const res = http.get(`${BASE}/public/companies`);
    const ok = check(res, { 'companies list 200': (r) => r.status === 200 });
    publicReadDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /public/companies/:id
  if (companyIds.length > 0) {
    const cid = companyIds[__VU % companyIds.length];
    const res = http.get(`${BASE}/public/companies/${cid}`);
    const ok = check(res, { 'company detail 200': (r) => r.status === 200 });
    publicReadDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /public/companies/:id/services
  if (companyIds.length > 0) {
    const cid = companyIds[__VU % companyIds.length];
    const res = http.get(`${BASE}/public/companies/${cid}/services`);
    const ok = check(res, { 'company services 200': (r) => r.status === 200 });
    publicReadDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /public/services/:id/intake-form
  if (serviceIds.length > 0) {
    const sid = serviceIds[__VU % serviceIds.length];
    const res = http.get(`${BASE}/public/services/${sid}/intake-form`);
    const ok = check(res, { 'intake form 200': (r) => r.status === 200 });
    publicReadDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /customer-pairing (requires auth)
  if (cred) {
    const res = http.get(`${BASE}/customer-pairing`, { headers });
    const ok = check(res, { 'customer pairing 200': (r) => r.status === 200 });
    publicReadDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.5);
}
