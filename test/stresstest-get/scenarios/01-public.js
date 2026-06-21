import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL } from '../config.js';

const t_companies = new Trend('get_public_companies');
const t_company_detail = new Trend('get_public_company_detail');
const t_company_services = new Trend('get_public_company_services');
const t_intake_form = new Trend('get_public_intake_form');
const errorRate = new Rate('public_errors');

const BASE = BASE_URL;

export const options = {
  scenarios: { stress: { executor: 'per-vu-iterations', vus: 100, iterations: 20, maxDuration: '5m' } },
  thresholds: {
    get_public_companies: ['p(95)<5000'],
    get_public_company_detail: ['p(95)<5000'],
    get_public_company_services: ['p(95)<5000'],
    get_public_intake_form: ['p(95)<5000'],
    public_errors: ['rate<0.3'],
  },
};

export function setup() {
  return {};
}

export default function () {
  let companyId = 'dummy-id';
  let serviceId = 'dummy-id';

  // GET /public/companies
  {
    const res = http.get(`${BASE}/public/companies`);
    const ok = check(res, { 'public companies 200': (r) => r.status === 200 });
    t_companies.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const arr = res.json('data') || [];
      if (arr.length > 0) {
        const item = arr[Math.floor(Math.random() * arr.length)];
        companyId = item.id || item._id;
      }
    }
  }

  sleep(0.2);

  // GET /public/companies/:id
  {
    const res = http.get(`${BASE}/public/companies/${companyId}`);
    const ok = check(res, { 'public company detail 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_company_detail.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /public/companies/:id/services
  {
    const res = http.get(`${BASE}/public/companies/${companyId}/services`);
    const ok = check(res, { 'public company services 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_company_services.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const arr = res.json('data') || [];
      if (arr.length > 0) {
        const item = arr[Math.floor(Math.random() * arr.length)];
        serviceId = item.id || item._id;
      }
    }
  }

  sleep(0.2);

  // GET /public/services/:id/intake-form
  {
    const res = http.get(`${BASE}/public/services/${serviceId}/intake-form`);
    const ok = check(res, { 'public intake form 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_intake_form.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);
}

