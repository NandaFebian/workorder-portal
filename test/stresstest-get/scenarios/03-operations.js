import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH } from '../config.js';

const t_sr_inbox = new Trend('get_sr_inbox');
const t_wo_list = new Trend('get_wo_list');
const t_wo_detail = new Trend('get_wo_detail');
const t_wo_report = new Trend('get_wo_report');
const t_wr_detail = new Trend('get_wr_detail');
const errorRate = new Rate('operations_errors');

const BASE = BASE_URL;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const options = {
  scenarios: { stress: { executor: 'per-vu-iterations', vus: 100, iterations: 20, maxDuration: '5m' } },
  thresholds: {
    get_sr_inbox: ['p(95)<5000'],
    get_wo_list: ['p(95)<5000'],
    get_wo_detail: ['p(95)<5000'],
    get_wo_report: ['p(95)<5000'],
    get_wr_detail: ['p(95)<5000'],
    operations_errors: ['rate<0.3'],
  },
};

export function setup() {
  const managerRes = http.post(`${BASE}/auth/login`, JSON.stringify({
    email: AUTH.manager.email, password: AUTH.manager.password,
  }), { headers: JSON_HEADERS });
  const managerToken = managerRes.status === 200 ? managerRes.json('data.token') : null;

  const staffRes = http.post(`${BASE}/auth/login`, JSON.stringify({
    email: AUTH.staff1.email, password: AUTH.staff1.password,
  }), { headers: JSON_HEADERS });
  const staffToken = staffRes.status === 200 ? staffRes.json('data.token') : null;

  console.log('[Setup] managerToken:', !!managerToken, 'staffToken:', !!staffToken);
  return { managerToken, staffToken };
}

export default function (data) {
  const { managerToken, staffToken } = data;
  if (!managerToken) { sleep(1); return; }

  const mgrHeaders = { Authorization: managerToken };
  const staffHeaders = staffToken ? { Authorization: staffToken } : mgrHeaders;

  let workorderId = 'dummy-id';
  let workReportId = 'dummy-id';

  // GET /service-requests/inbox
  {
    const res = http.get(`${BASE}/service-requests/inbox`, { headers: mgrHeaders });
    const ok = check(res, { 'sr inbox 200': (r) => r.status === 200 });
    t_sr_inbox.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /workorders
  {
    const res = http.get(`${BASE}/workorders`, { headers: mgrHeaders });
    const ok = check(res, { 'wo list 200': (r) => r.status === 200 });
    t_wo_list.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const arr = res.json('data') || [];
      if (arr.length > 0) {
        const item = arr[Math.floor(Math.random() * arr.length)];
        workorderId = item.id || item._id;
      }
    }
  }

  sleep(0.2);

  // GET /workorders/:id
  {
    const res = http.get(`${BASE}/workorders/${workorderId}`, { headers: mgrHeaders });
    const ok = check(res, { 'wo detail 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_wo_detail.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // GET /workorders/:id/report
  {
    const res = http.get(`${BASE}/workorders/${workorderId}/report`, { headers: mgrHeaders });
    const ok = check(res, { 'wo report 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_wo_report.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200 && res.json('data')) {
      const rpData = res.json('data');
      workReportId = rpData.id || rpData._id;
    }
  }

  sleep(0.2);

  // GET /workreports/:id
  {
    const res = http.get(`${BASE}/workreports/${workReportId}`, { headers: mgrHeaders });
    const ok = check(res, { 'wr detail 200/404': (r) => [200, 400, 404].includes(r.status) });
    t_wr_detail.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.3);
}

