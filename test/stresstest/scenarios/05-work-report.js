import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH } from '../config.js';

const wrDuration = new Trend('wr_duration');
const errorRate = new Rate('wr_errors');

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
    wr_duration: ['p(95)<5000'],
    wr_errors: ['rate<0.1'],
    http_req_failed: ['rate<0.1'],
  },
};

export function setup() {
  const managerRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: AUTH.manager.email, password: AUTH.manager.password,
  }), { headers: JSON_HEADERS });
  const managerCred = managerRes.status === 200 ? { token: managerRes.json('data.token') } : null;

  const staffRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: AUTH.staff1.email, password: AUTH.staff1.password,
  }), { headers: JSON_HEADERS });
  const staffCred = staffRes.status === 200 ? { token: staffRes.json('data.token') } : null;

  if (!managerCred || !staffCred) return { managerCred: null, staffCred: null, workOrders: [] };

  const woRes = http.get(`${BASE}/workorders`, {
    headers: { Authorization: managerCred.token },
  });
  let workOrders = [];
  if (woRes.status === 200) {
    const wos = woRes.json('data') || [];
    workOrders = wos.map((wo) => ({
      id: wo.id || wo._id,
      status: wo.status || wo.workOrderStatus,
    }));
  }

  console.log('[WR Setup] Work orders found:', workOrders.length);
  return { managerCred, staffCred, workOrders };
}

export default function (data) {
  const { managerCred, staffCred, workOrders } = data;

  if (!managerCred || !staffCred || !workOrders || workOrders.length === 0) {
    sleep(1);
    return;
  }

  const managerHeaders = { Authorization: managerCred.token, ...JSON_HEADERS };
  const staffHeaders = { Authorization: staffCred.token, ...JSON_HEADERS };
  const wo = workOrders[__VU % workOrders.length];
  const woId = wo.id;

  // GET /workorders/:id/report (get report form info)
  let reportId = null;
  let reportFormId = null;
  {
    const res = http.get(`${BASE}/workorders/${woId}/report`, {
      headers: staffHeaders,
    });
    if (res.status === 200) {
      const report = res.json('data');
      if (report) {
        reportId = report._id || report.id;
        reportFormId = report.reportFormId;
        if (!reportFormId && report.reportForm) {
          reportFormId = report.reportForm._id || report.reportForm.id;
        }
      }
    }
    wrDuration.add(res.timings.duration);
  }

  sleep(0.3);

  // POST /workreports/:id/submit (Staff)
  if (reportId && reportFormId) {
    const submitPayload = {
      formId: reportFormId,
      fieldsData: [
        { order: 1, value: `Work completed by VU ${__VU} at ${Date.now()}` },
        { order: 2, value: 'done' },
      ],
    };
    const res = http.post(
      `${BASE}/workreports/${reportId}/submit`,
      JSON.stringify(submitPayload),
      { headers: staffHeaders },
    );
    const ok = check(res, {
      'wr submit 200/201/400': (r) => r.status === 200 || r.status === 201 || r.status === 400,
    });
    wrDuration.add(res.timings.duration);
    errorRate.add(!ok && res.status >= 500);
  }

  sleep(0.3);

  // PATCH /workreports/:id/sent (Staff)
  if (reportId) {
    const res = http.patch(`${BASE}/workreports/${reportId}/sent`, null, {
      headers: staffHeaders,
    });
    const ok = check(res, { 'wr sent 200/400': (r) => r.status === 200 || r.status === 400 });
    wrDuration.add(res.timings.duration);
    errorRate.add(!ok && res.status >= 500);
  }

  sleep(0.3);

  // PATCH /workreports/:id/approve (Manager)
  if (reportId) {
    const res = http.patch(`${BASE}/workreports/${reportId}/approve`, null, {
      headers: managerHeaders,
    });
    const ok = check(res, {
      'wr approve 200/400': (r) => r.status === 200 || r.status === 400,
    });
    wrDuration.add(res.timings.duration);
    errorRate.add(!ok && res.status >= 500);
  }

  sleep(0.5);
}
