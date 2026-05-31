import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

jest.setTimeout(60000);

describe('ServicePriceController (e2e)', () => {
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
      .send({ name: 'SP Owner', email: 'sp@owner.com', password: 'password123', companyName: 'SP Corp' })
      .expect(200);

    ownerToken = regRes.body.data.token;
  });

  // TC-SP-01
  describe('GET /service-price', () => {
    it('[TC-SP-01] should return 200 OK with service price list (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/service-price')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // TC-SP-02
  describe('POST /service-price', () => {
    it('[TC-SP-02] should create a new service price schema and return 201 (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/service-price')
        .set('Authorization', ownerToken)
        .send({ name: 'Harga Standar', price: 100000, currency: 'IDR' })
        .expect(201);

      expect(res.body.data).toBeDefined();
    });
  });

  // TC-SP-03, TC-SP-04
  describe('PUT & DELETE /service-price/:id', () => {
    let priceId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/service-price')
        .set('Authorization', ownerToken)
        .send({ name: 'Harga Update', price: 50000, currency: 'IDR' })
        .expect(201);

      priceId = res.body.data._id;
    });

    it('[TC-SP-03] should update price schema and return 200 OK (Blackbox)', async () => {
      await request(app.getHttpServer())
        .put(`/service-price/${priceId}`)
        .set('Authorization', ownerToken)
        .send({ name: 'Harga Diupdate', price: 75000 })
        .expect(200);
    });

    it('[TC-SP-04] should delete price schema and return 200 OK (Blackbox)', async () => {
      await request(app.getHttpServer())
        .delete(`/service-price/${priceId}`)
        .set('Authorization', ownerToken)
        .expect(200);
    });
  });
});
