import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH } from '../config.js';

const t_services = new Trend('get_services_list');
const t_service_detail = new Trend('get_service_detail');
const t_service_intake = new Trend('get_service_intake_form');
const t_forms = new Trend('get_forms_list');
const t_form_detail = new Trend('get_form_detail');
const t_service_price = new Trend('get_service_price');
const t_notifications = new Trend('get_notifications');
const t_tpl_company_type = new Trend('get_template_company_type');
const t_tpl_services = new Trend('get_template_ct_services');
const t_tpl_service_detail = new Trend('get_template_service_detail');
const errorRate = new Rate('config_errors');

const BASE = BASE_URL;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const options = {
  scenarios: { stress: { executor: 'per-vu-iterations', vus: 100, iterations: 20, maxDuration: '5m' } },
  thresholds: {
    get_services_list: ['p(95)<5000'],
    get_service_detail: ['p(95)<5000'],
    get_service_intake_form: ['p(95)<5000'],
    get_forms_list: ['p(95)<5000'],
    get_form_detail: ['p(95)<5000'],
    get_service_price: ['p(95)<5000'],
    get_notifications: ['p(95)<5000'],
    get_template_company_type: ['p(95)<5000'],
    get_template_ct_services: ['p(95)<5000'],
    get_template_service_detail: ['p(95)<5000'],
    config_errors: ['rate<0.3'],
  },
};

export function setup() {
  const ownerRes = http.post(`${BASE}/auth/login`, JSON.stringify({
    email: AUTH.owner.email, password: AUTH.owner.password,
  }), { headers: JSON_HEADERS });
  const ownerToken = ownerRes.status === 200 ? ownerRes.json('data.token') : null;
  if (!ownerToken) return { ownerToken: null, serviceId: null, formId: null, companyTypeId: null, serviceTemplateId: null };

  const authHeaders = { Authorization: ownerToken };
  console.log('[Setup] ownerToken:', !!ownerToken);
  return { ownerToken };
}

export default function (data) {
  const { ownerToken } = data;
  if (!ownerToken) { sleep(1); return; }

  const headers = { Authorization: ownerToken };

  let serviceId = 'dummy-id';
  let formId = 'dummy-id';
  let companyTypeId = 'dummy-id';
  let serviceTemplateId = 'dummy-id';

  // GET /services
  {
    const res = http.get(`${BASE}/services`, { headers });
    const ok = check(res, { 'services list 200': (r) => r.status === 200 });
    t_services.add(res.timings.duration);
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

  // GET /services/:id
  {
    const res = http.get(`${BASE}/services/${serviceId}`, { headers });
    const ok = check(res, { 'service detail 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_service_detail.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /services/:id/intake-form
  {
    const res = http.get(`${BASE}/services/${serviceId}/intake-form`, { headers });
    const ok = check(res, { 'service intake form 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_service_intake.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /forms
  {
    const res = http.get(`${BASE}/forms`, { headers });
    const ok = check(res, { 'forms list 200': (r) => r.status === 200 });
    t_forms.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const arr = res.json('data') || [];
      if (arr.length > 0) {
        const item = arr[Math.floor(Math.random() * arr.length)];
        formId = item.id || item._id;
      }
    }
  }

  sleep(0.2);

  // GET /forms/:id
  {
    const res = http.get(`${BASE}/forms/${formId}`, { headers });
    const ok = check(res, { 'form detail 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_form_detail.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /services/:id/price
  {
    const res = http.get(`${BASE}/services/${serviceId}/price`, { headers });
    const ok = check(res, { 'service price 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_service_price.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /notifications
  {
    const res = http.get(`${BASE}/notifications`, { headers });
    const ok = check(res, { 'notifications 200': (r) => r.status === 200 });
    t_notifications.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /template/company-type
  {
    const res = http.get(`${BASE}/template/company-type`, { headers });
    const ok = check(res, { 'template company type 200': (r) => r.status === 200 });
    t_tpl_company_type.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const arr = res.json('data') || [];
      if (arr.length > 0) {
        const item = arr[Math.floor(Math.random() * arr.length)];
        companyTypeId = item.id || item._id;
      }
    }
  }

  sleep(0.2);

  // GET /templates/company-types/:id/services
  {
    const res = http.get(`${BASE}/templates/company-types/${companyTypeId}/services`, { headers });
    const ok = check(res, { 'template ct services 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_tpl_services.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const arr = res.json('data') || [];
      if (arr.length > 0) {
        const item = arr[Math.floor(Math.random() * arr.length)];
        serviceTemplateId = item.id || item._id;
      }
    }
  }

  sleep(0.2);

  // GET /templates/services/:id
  {
    const res = http.get(`${BASE}/templates/services/${serviceTemplateId}`, { headers });
    const ok = check(res, { 'template service detail 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_tpl_service_detail.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);

