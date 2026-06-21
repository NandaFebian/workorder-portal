import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, AUTH } from '../config.js';

const svcConfigDuration = new Trend('svc_config_duration');
const errorRate = new Rate('svc_config_errors');

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
    svc_config_duration: ['p(95)<3000'],
    svc_config_errors: ['rate<0.1'],
    http_req_failed: ['rate<0.1'],
  },
};

export function setup() {
  const ownerRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: AUTH.owner.email, password: AUTH.owner.password,
  }), { headers: JSON_HEADERS });
  const ownerCred = ownerRes.status === 200 ? { token: ownerRes.json('data.token') } : null;
  if (!ownerCred) return { ownerCred: null, intakeFormId: null, reportFormId: null, positionId: null, existingServiceId: null };

  const formsRes = http.get(`${BASE}/forms`, {
    headers: { Authorization: ownerCred.token },
  });
  let intakeFormId = null;
  let reportFormId = null;
  if (formsRes.status === 200) {
    const forms = formsRes.json('data') || [];
    for (const f of forms) {
      if (f.formType === 'intake' && !intakeFormId) intakeFormId = f._id || f.id;
      if (f.formType === 'report' && !reportFormId) reportFormId = f._id || f.id;
    }
  }

  const posRes = http.get(`${BASE}/positions`, {
    headers: { Authorization: ownerCred.token },
  });
  let positionId = null;
  if (posRes.status === 200) {
    const positions = posRes.json('data') || [];
    if (positions.length > 0) positionId = positions[0]._id || positions[0].id;
  }

  let existingServiceId = null;
  const svcRes = http.get(`${BASE}/services`, {
    headers: { Authorization: ownerCred.token },
  });
  if (svcRes.status === 200) {
    const svcs = svcRes.json('data') || [];
    if (svcs.length > 0) existingServiceId = svcs[0]._id || svcs[0].id;
  }

  return { ownerCred, intakeFormId, reportFormId, positionId, existingServiceId };
}

export default function (data) {
  const { ownerCred, intakeFormId, reportFormId, positionId, existingServiceId } = data;
  if (!ownerCred) {
    sleep(1);
    return;
  }

  const headers = { ...JSON_HEADERS, Authorization: ownerCred.token };
  const now = Date.now();

  // ── FORMS ──
  // GET /forms
  {
    const res = http.get(`${BASE}/forms`, { headers });
    const ok = check(res, { 'forms list 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // POST /forms
  let formId = null;
  {
    const res = http.post(`${BASE}/forms`, JSON.stringify({
      title: `Stress Form ${now}-${__VU}`,
      description: 'Stress test form',
      formType: 'intake',
      fields: [
        { order: 1, label: 'Nama', type: 'text', required: true },
        { order: 2, label: 'Catatan', type: 'textarea', required: false },
      ],
    }), { headers });
    const ok = check(res, {
      'create form 200/201': (r) => r.status === 200 || r.status === 201,
    });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
    if (ok) formId = res.json('data._id') || res.json('data.id');
  }

  sleep(0.2);

  // GET /forms/:id
  if (formId) {
    const res = http.get(`${BASE}/forms/${formId}`, { headers });
    const ok = check(res, { 'form detail 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // PUT /forms/:id
  if (formId) {
    const res = http.put(`${BASE}/forms/${formId}`, JSON.stringify({
      title: `Updated Form ${now}-${__VU}`,
      description: 'Updated by stress test',
      formType: 'intake',
      fields: [
        { order: 1, label: 'Nama Lengkap', type: 'text', required: true },
        { order: 2, label: 'Detail', type: 'textarea', required: false },
      ],
    }), { headers });
    const ok = check(res, { 'update form 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // DELETE /forms/:id
  if (formId) {
    const res = http.del(`${BASE}/forms/${formId}`, null, { headers });
    const ok = check(res, { 'delete form 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // ── SERVICES ──
  // GET /services
  {
    const res = http.get(`${BASE}/services`, { headers });
    const ok = check(res, { 'svc list 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // POST /services
  let svcId = null;
  if (intakeFormId && reportFormId && positionId) {
    const payload = {
      title: `Stress Svc ${now}-${__VU}`,
      description: 'Created by stress test',
      accessType: 'public',
      isActive: true,
      draftingWorkOrderType: 'manual',
      serviceRequestConfig: {
        intakeFormId,
        serviceRequestApprovalAccessType: 'auto',
        reviewNeed: false,
      },
      workOrdersConfig: [{
        positionId,
        workOrderFormId: null, // Fixed: Need to supply this
        workReportFormId: reportFormId,
        workOrderApprovalAccessType: 'auto',
        workReportApprovalAccessType: 'auto',
        minStaff: 1,
        maxStaff: 1,
        showReportToRequester: false,
      }],
    };
    const res = http.post(`${BASE}/services`, JSON.stringify(payload), { headers });
    const ok = check(res, {
      'create svc 200/201': (r) => r.status === 200 || r.status === 201,
    });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
    if (ok) svcId = res.json('data._id') || res.json('data.id');
  }

  sleep(0.2);

  // GET /services/:id
  if (svcId) {
    const res = http.get(`${BASE}/services/${svcId}`, { headers });
    const ok = check(res, { 'svc detail 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // PATCH /services/:id/toggle-active
  if (svcId) {
    const res = http.patch(`${BASE}/services/${svcId}/toggle-active`,
      JSON.stringify({ isActive: false }),
      { headers },
    );
    const ok = check(res, { 'svc toggle 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // DELETE /services/:id
  if (svcId) {
    const res = http.del(`${BASE}/services/${svcId}`, null, { headers });
    const ok = check(res, { 'svc delete 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // ── SERVICE PRICE ──
  // GET /service-price
  {
    const res = http.get(`${BASE}/service-price`, { headers });
    const ok = check(res, { 'price list 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // POST /service-price
  let priceId = null;
  if (existingServiceId) {
    const res = http.post(`${BASE}/service-price`, JSON.stringify({
      serviceId: existingServiceId,
      name: `Stress Price ${now}-${__VU}`,
      price: 100000 + __VU * 1000,
    }), { headers });
    const ok = check(res, {
      'create price 200/201': (r) => r.status === 200 || r.status === 201,
    });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
    if (ok) priceId = res.json('data._id') || res.json('data.id');
  }

  sleep(0.2);

  // PUT /service-price/:id
  if (priceId) {
    const res = http.put(`${BASE}/service-price/${priceId}`, JSON.stringify({
      price: 200000,
    }), { headers });
    const ok = check(res, { 'update price 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // DELETE /service-price/:id
  if (priceId) {
    const res = http.del(`${BASE}/service-price/${priceId}`, null, { headers });
    const ok = check(res, { 'delete price 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // ── TEMPLATES ──
  // GET /template/company-type
  let ctId = null;
  {
    const res = http.get(`${BASE}/template/company-type`, { headers });
    const ok = check(res, { 'company types 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const ct = res.json('data') || [];
      if (ct.length > 0) ctId = ct[0]._id || ct[0].id;
    }
  }

  sleep(0.2);

  // GET /template/company-type/:id/services
  let svcTemplateId = null;
  if (ctId) {
    const res = http.get(`${BASE}/template/company-type/${ctId}/services`, { headers });
    const ok = check(res, { 'template svcs 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.status === 200) {
      const tpls = res.json('data') || [];
      if (tpls.length > 0) svcTemplateId = tpls[0]._id || tpls[0].id;
    }
  }

  sleep(0.2);

  // GET /template/services/:id
  if (svcTemplateId) {
    const res = http.get(`${BASE}/template/services/${svcTemplateId}`, { headers });
    const ok = check(res, { 'template detail 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // POST /template/generate
  if (svcTemplateId) {
    const res = http.post(`${BASE}/template/generate`, JSON.stringify({
      templateServiceIds: [svcTemplateId],
    }), { headers });
    const ok = check(res, { 'generate template 200/201': (r) => r.status === 200 || r.status === 201 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // ── NOTIFICATIONS ──
  // GET /notifications
  {
    const res = http.get(`${BASE}/notifications`, { headers });
    const ok = check(res, { 'notifications list 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // POST /notifications/fcm-token
  {
    const res = http.post(`${BASE}/notifications/fcm-token`, JSON.stringify({
      token: `stress-fcm-${__VU}-${now}`,
    }), { headers });
    const ok = check(res, { 'fcm store 200/201': (r) => r.status === 200 || r.status === 201 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.2);

  // DELETE /notifications/fcm-token
  {
    const res = http.del(`${BASE}/notifications/fcm-token`,
      JSON.stringify({ token: `stress-fcm-${__VU}-${now}` }),
      { headers },
    );
    const ok = check(res, { 'fcm delete 200': (r) => r.status === 200 });
    svcConfigDuration.add(res.timings.duration);
    errorRate.add(!ok);
  }

  sleep(0.5);
}
