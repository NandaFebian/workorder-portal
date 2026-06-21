import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH } from '../config.js';

const loginDuration = new Trend('auth_login_duration');
const registerDuration = new Trend('auth_register_duration');
const profileDuration = new Trend('auth_profile_duration');
const logoutDuration = new Trend('auth_logout_duration');
const errorRate = new Rate('auth_errors');

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
    auth_login_duration: ['p(95)<3000'],
    auth_register_duration: ['p(95)<5000'],
    auth_errors: ['rate<0.1'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE = BASE_URL;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default function () {
  const ts = Date.now();
  const email = `auth-vu${__VU}-${ts}@stresstest.com`;
  const password = 'StressTest123!';

  // POST /auth/register
  {
    const res = http.post(`${BASE}/auth/register`, JSON.stringify({
      name: `Test User ${__VU}`,
      email,
      password,
      role: 'client',
    }), { headers: JSON_HEADERS });
    const ok = check(res, {
      'register 200/201': (r) => r.status === 200 || r.status === 201,
    });
    registerDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // POST /auth/login
  let token = '';
  {
    const res = http.post(`${BASE}/auth/login`, JSON.stringify({
      email, password,
    }), { headers: JSON_HEADERS });
    const ok = check(res, {
      'login 200': (r) => r.status === 200,
      'login has token': (r) => {
        try { return !!r.json('data.token'); } catch { return false; }
      },
    });
    loginDuration.add(res.timings.duration);
    errorRate.add(!ok);
    if (ok) token = res.json('data.token');
  }

  sleep(0.3);

  // GET /auth/profile
  if (token) {
    const res = http.get(`${BASE}/auth/profile`, {
      headers: { Authorization: token },
    });
    const ok = check(res, {
      'profile 200': (r) => r.status === 200,
    });
    profileDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

  // POST /auth/logout
  if (token) {
    const res = http.post(`${BASE}/auth/logout`, null, {
      headers: { Authorization: token },
    });
    const ok = check(res, {
      'logout 200': (r) => r.status === 200,
    });
    logoutDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.5);
}
