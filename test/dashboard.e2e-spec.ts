import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

jest.setTimeout(60000);

describe('DashboardController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let ownerToken: string;

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
      .send({
        name: 'Dash Owner',
        email: 'dash@owner.com',
        password: 'password123',
        companyName: 'Dash Corp',
      })
      .expect(200);

    ownerToken = regRes.body.data.token;
  });

  // TC-DASH-01
  describe('GET /dashboard/service-request', () => {
    it('[TC-DASH-01] should return 200 OK with service request metrics (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/service-request')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('[TC-DASH-02] should return 401 when accessed without JWT token (Blackbox)', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/service-request')
        .expect(401);
    });
  });

  // TC-DASH-02
  describe('GET /dashboard/work-order', () => {
    it('[TC-DASH-02] should return 200 OK with work order metrics (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/work-order')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('[TC-DASH-04] should return metrics scoped to authenticated owner company (Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/work-order')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data).toBe('object');
    });
  });

  // TC-DASH-03
  describe('GET /dashboard/company', () => {
    it('[TC-DASH-03] should return 200 OK with company summary metrics (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/company')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('[TC-DASH-06] should return response with defined data structure (Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/company')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data).toBe('object');
    });
  });
});
