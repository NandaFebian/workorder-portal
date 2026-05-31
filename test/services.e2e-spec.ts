import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

jest.setTimeout(60000);

describe('ServicesController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let ownerToken: string;
  let companyId: string;
  let positionId: string;
  let intakeFormId: string;
  let reportFormId: string;

  const createService = async (overrides: any = {}) => {
    return request(app.getHttpServer())
      .post('/services')
      .set('Authorization', ownerToken)
      .send({
        title: 'Layanan Test',
        description: 'Deskripsi layanan test',
        accessType: 'internal',
        draftingWorkOrderType: 'auto',
        serviceRequestConfig: {
          intakeFormId,
          reviewNeed: false,
          serviceRequestApprovalAccessType: 'auto',
        },
        workOrdersConfig: [
          {
            positionId,
            workReportFormId: reportFormId,
            minStaff: 1,
            maxStaff: 3,
            workOrderApprovalAccessType: 'auto',
            workReportApprovalAccessType: 'auto',
          },
        ],
        ...overrides,
      });
  };

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

    // Setup: register company
    const regRes = await request(app.getHttpServer())
      .post('/auth/register-company')
      .send({
        name: 'SVC Owner',
        email: 'svcowner@test.com',
        password: 'password123',
        companyName: 'SVC Corp',
      })
      .expect(200);

    ownerToken = regRes.body.data.token;
    companyId = regRes.body.data.user.company._id;

    // Setup: create position
    const posRes = await request(app.getHttpServer())
      .post('/positions')
      .set('Authorization', ownerToken)
      .send({ name: 'Teknisi', description: 'Teknisi lapangan' })
      .expect(201);

    positionId = posRes.body.data._id;

    // Setup: create intake form
    const intakeRes = await request(app.getHttpServer())
      .post('/forms')
      .set('Authorization', ownerToken)
      .send({
        title: 'Form Intake Test',
        description: 'Form untuk test',
        formType: 'intake',
        fields: [
          { order: 1, label: 'Nama Pemohon', type: 'text', required: true },
        ],
      })
      .expect(201);

    intakeFormId = intakeRes.body.data._id;

    // Setup: create report form
    const reportRes = await request(app.getHttpServer())
      .post('/forms')
      .set('Authorization', ownerToken)
      .send({
        title: 'Form Report Test',
        description: 'Form laporan test',
        formType: 'report',
        fields: [
          { order: 1, label: 'Hasil Kerja', type: 'textarea', required: true },
        ],
      })
      .expect(201);

    reportFormId = reportRes.body.data._id;
  });

  // TC-SVC-01, TC-SVC-02
  describe('POST /services', () => {
    it('[TC-SVC-01] should create a new service and return 201 (Blackbox)', async () => {
      const res = await createService();
      expect(res.status).toBe(201);
      expect(res.body.data).toEqual(
        expect.objectContaining({
          title: 'Layanan Test',
          accessType: 'internal',
        }),
      );
    });

    it('[TC-SVC-02] should reject service creation with invalid intakeFormId (Whitebox)', async () => {
      const fakeFormId = new Types.ObjectId().toString();
      const res = await createService({
        serviceRequestConfig: {
          intakeFormId: fakeFormId,
          reviewNeed: false,
          serviceRequestApprovalAccessType: 'auto',
        },
      });
      expect(res.status).toBe(404);
    });

    it('[TC-SVC-03] should persist new service record in MongoDB (Whitebox)', async () => {
      const res = await createService();
      expect(res.status).toBe(201);
      const svcId = res.body.data._id;

      const svc = await connection.model('Service').findById(svcId);
      expect(svc).toBeDefined();
      expect(svc!.title).toBe('Layanan Test');
      expect(svc!.companyId.toString()).toBe(companyId);
    });

    it('[TC-SVC-04] should return 400 when required field title is empty (Blackbox)', async () => {
      const res = await createService({ title: '' });
      expect(res.status).toBe(400);
    });
  });

  // TC-SVC-03, TC-SVC-04
  describe('GET /services', () => {
    it('[TC-SVC-03] should return 200 OK with all services (Blackbox)', async () => {
      await createService().then((r) => {
        expect(r.status).toBe(201);
      });
      const res = await request(app.getHttpServer())
        .get('/services')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Layanan Test' }),
        ]),
      );
    });

    it('[TC-SVC-04] should only return services belonging to owner company (Whitebox)', async () => {
      await createService().then((r) => {
        expect(r.status).toBe(201);
      });

      const regB = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({
          name: 'Owner B',
          email: 'ownerb@svc.com',
          password: 'password123',
          companyName: 'Company B',
        })
        .expect(200);

      const tokenB = regB.body.data.token;
      const resB = await request(app.getHttpServer())
        .get('/services')
        .set('Authorization', tokenB)
        .expect(200);

      const titles = resB.body.data.map((s: any) => s.title);
      expect(titles).not.toContain('Layanan Test');
    });
  });

  // TC-SVC-05
  describe('GET /services/:id', () => {
    it('[TC-SVC-05] should return 200 OK with service detail (Blackbox)', async () => {
      const created = await createService();
      expect(created.status).toBe(201);
      const svcId = created.body.data._id;

      const res = await request(app.getHttpServer())
        .get(`/services/${svcId}`)
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toEqual(expect.objectContaining({ _id: svcId }));
    });

    it('[TC-SVC-08] should return 404 for non-existent service ID (Blackbox)', async () => {
      const fakeId = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .get(`/services/${fakeId}`)
        .set('Authorization', ownerToken)
        .expect(404);
    });
  });

  // TC-SVC-13, TC-SVC-14
  describe('PATCH /services/:id/toggle-active', () => {
    it('[TC-SVC-13] should toggle service active status (Blackbox + Whitebox)', async () => {
      const created = await createService();
      expect(created.status).toBe(201);
      const svcId = created.body.data._id;

      // Toggle off
      const resOff = await request(app.getHttpServer())
        .patch(`/services/${svcId}/toggle-active`)
        .set('Authorization', ownerToken)
        .send({ isActive: false })
        .expect(200);

      expect(resOff.body.data.isActive).toBe(false);

      // Whitebox: verify in DB
      const dbSvc = await connection.model('Service').findById(svcId);
      expect(dbSvc!.isActive).toBe(false);
    });

    it('[TC-SVC-10] should toggle service active status back to true (Blackbox)', async () => {
      const created = await createService();
      expect(created.status).toBe(201);
      const svcId = created.body.data._id;

      await request(app.getHttpServer())
        .patch(`/services/${svcId}/toggle-active`)
        .set('Authorization', ownerToken)
        .send({ isActive: false })
        .expect(200);

      const resOn = await request(app.getHttpServer())
        .patch(`/services/${svcId}/toggle-active`)
        .set('Authorization', ownerToken)
        .send({ isActive: true })
        .expect(200);

      expect(resOn.body.data.isActive).toBe(true);
    });
  });

  // TC-SVC-15, TC-SVC-16
  describe('DELETE /services/:id', () => {
    it('[TC-SVC-15] should soft delete service (Blackbox + Whitebox)', async () => {
      const created = await createService();
      expect(created.status).toBe(201);
      const svcId = created.body.data._id;

      await request(app.getHttpServer())
        .delete(`/services/${svcId}`)
        .set('Authorization', ownerToken)
        .expect(200);

      // Whitebox: deletedAt should be set
      const dbSvc = await connection.model('Service').findById(svcId);
      expect(dbSvc!.deletedAt).not.toBeNull();
    });
  });

  // TC-SVC-17, TC-SVC-18
  describe('GET /public/services/company/:companyId', () => {
    it('[TC-SVC-17] should return public services without auth (Blackbox)', async () => {
      await createService({ accessType: 'public' }).then((r) => {
        expect(r.status).toBe(201);
      });
      // Toggle active
      const services = await request(app.getHttpServer())
        .get('/services')
        .set('Authorization', ownerToken)
        .expect(200);
      const svcId = services.body.data[0]._id;
      await request(app.getHttpServer())
        .patch(`/services/${svcId}/toggle-active`)
        .set('Authorization', ownerToken)
        .send({ isActive: true });

      const res = await request(app.getHttpServer())
        .get(`/public/services/company/${companyId}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('[TC-SVC-18] should be accessible without JWT token (Whitebox)', async () => {
      // No Authorization header
      const res = await request(app.getHttpServer()).get(
        `/public/services/company/${companyId}`,
      );
      expect(res.status).not.toBe(401);
    });

    it('[TC-SVC-14] should not return inactive services in public endpoint (Whitebox)', async () => {
      // Create service with public accessType but do NOT activate it
      await createService({ accessType: 'public' }).then((r) => {
        expect(r.status).toBe(201);
      });

      const res = await request(app.getHttpServer())
        .get(`/public/services/company/${companyId}`)
        .expect(200);

      const inactiveServices = (res.body.data || []).filter(
        (s: any) => !s.isActive,
      );
      expect(inactiveServices.length).toBe(0);
    });
  });
});
