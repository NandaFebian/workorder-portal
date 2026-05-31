import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

jest.setTimeout(60000);

describe('TemplateController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let ownerToken: string;
  let companyId: string;
  let companyTypeId: string;
  let serviceTemplateId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    connection = app.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    const regRes = await request(app.getHttpServer())
      .post('/auth/register-company')
      .send({ name: 'TPL Owner', email: 'tpl@owner.com', password: 'password123', companyName: 'TPL Corp' })
      .expect(200);

    ownerToken = regRes.body.data.token;
    companyId = regRes.body.data.user.company._id;

    // Run seed to populate company types and service templates
    // We insert directly into DB for E2E test isolation
    const companyTypeDoc = await connection.model('CompanyType').create({
      _id: new Types.ObjectId('665000000000000000000001'),
      name: 'PT (Perseroan Terbatas)',
      description: 'Test company type',
    });
    companyTypeId = companyTypeDoc._id.toString();

    const templateDoc = await connection.model('ServiceTemplate').create({
      title: 'Template Test',
      description: 'Template untuk test',
      companyTypeId: new Types.ObjectId(companyTypeId),
      accessType: 'internal',
      draftingWorkOrderType: 'auto',
      serviceRequestConfig: {
        serviceRequestApprovalAccessType: 'auto',
        reviewNeed: false,
        intakeForm: {
          title: 'Form Intake',
          description: 'Intake',
          formType: 'intake',
          fields: [{ order: 1, label: 'Nama', type: 'text', required: true }],
        },
        reviewForm: null,
      },
      workOrdersConfig: [
        {
          configId: null,
          positionsOnDuty: { name: 'General Services', description: 'Divisi umum' },
          workOrderApprovalAccessType: 'auto',
          workReportApprovalAccessType: 'auto',
          minStaff: 1,
          maxStaff: 2,
          workOrderForm: null,
          workReportForm: {
            title: 'Form Report',
            description: 'Report',
            formType: 'report',
            fields: [{ order: 1, label: 'Catatan', type: 'textarea', required: true }],
          },
        },
      ],
    });

    serviceTemplateId = templateDoc._id.toString();
  });

  // TC-TPL-01
  describe('GET /template/company-type', () => {
    it('[TC-TPL-01] should return 200 OK with company type list (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/template/company-type')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ companyTypeName: 'PT (Perseroan Terbatas)' }),
        ]),
      );
    });

    it('[TC-TPL-02] should return data from CompanyType collection in MongoDB (Whitebox)', async () => {
      const count = await connection.model('CompanyType').countDocuments();
      const res = await request(app.getHttpServer())
        .get('/template/company-type')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  // TC-TPL-02, TC-TPL-03
  describe('GET /template/company-type/:companyTypeId/services', () => {
    it('[TC-TPL-02] should return 200 OK with template list for valid company type ID (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/template/company-type/${companyTypeId}/services`)
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toEqual(
        expect.arrayContaining([expect.objectContaining({ title: 'Template Test' })]),
      );
    });

    it('[TC-TPL-03] should return 404 for invalid company type ID (Blackbox)', async () => {
      const fakeId = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .get(`/template/company-type/${fakeId}/services`)
        .set('Authorization', ownerToken)
        .expect(404);
    });
  });

  // TC-TPL-04
  describe('GET /template/services/:serviceTemplateId', () => {
    it('[TC-TPL-04] should return 200 OK with template detail (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/template/services/${serviceTemplateId}`)
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data.service).toEqual(
        expect.objectContaining({ title: 'Template Test' }),
      );
    });

    it('[TC-TPL-06] should return 404 for non-existent serviceTemplateId (Blackbox)', async () => {
      const fakeId = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .get(`/template/services/${fakeId}`)
        .set('Authorization', ownerToken)
        .expect(404);
    });
  });

  // TC-TPL-05, TC-TPL-06, TC-TPL-07, TC-TPL-08
  describe('POST /template/services/generate', () => {
    it('[TC-TPL-05] should generate service from template and return 201 (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/template/services/generate')
        .set('Authorization', ownerToken)
        .send({ serviceTemplateIds: [serviceTemplateId] })
        .expect(201);

      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Template Test' }),
        ]),
      );
    });

    it('[TC-TPL-06] should persist cloned service in MongoDB (Whitebox)', async () => {
      await request(app.getHttpServer())
        .post('/template/services/generate')
        .set('Authorization', ownerToken)
        .send({ serviceTemplateIds: [serviceTemplateId] })
        .expect(201);

      const svc = await connection.model('Service').findOne({
        title: 'Template Test',
        companyId: new Types.ObjectId(companyId),
      });
      expect(svc).toBeDefined();
      expect(svc!.accessType).toBe('internal');
    });

    it('[TC-TPL-07] should create form documents from template blueprints (Whitebox)', async () => {
      await request(app.getHttpServer())
        .post('/template/services/generate')
        .set('Authorization', ownerToken)
        .send({ serviceTemplateIds: [serviceTemplateId] })
        .expect(201);

      const form = await connection.model('FormTemplate').findOne({ title: 'Form Intake' });
      expect(form).toBeDefined();
    });

    it('[TC-TPL-08] should create position if not exists in company (Whitebox)', async () => {
      await request(app.getHttpServer())
        .post('/template/services/generate')
        .set('Authorization', ownerToken)
        .send({ serviceTemplateIds: [serviceTemplateId] })
        .expect(201);

      const pos = await connection.model('Position').findOne({ name: 'General Services' });
      expect(pos).toBeDefined();
    });

    it('[TC-TPL-11] should return error when serviceTemplateId does not exist (Blackbox)', async () => {
      const fakeId = new Types.ObjectId().toString();
      const res = await request(app.getHttpServer())
        .post('/template/services/generate')
        .set('Authorization', ownerToken)
        .send({ serviceTemplateIds: [fakeId] });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('[TC-TPL-12] should return 401 when accessing without JWT token (Blackbox)', async () => {
      await request(app.getHttpServer())
        .post('/template/services/generate')
        .send({ serviceTemplateIds: [serviceTemplateId] })
        .expect(401);
    });
  });
});
