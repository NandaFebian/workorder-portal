import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

jest.setTimeout(60000);

describe('NotificationsController (e2e)', () => {
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
      .send({ name: 'Notif Owner', email: 'notif@owner.com', password: 'password123', companyName: 'Notif Corp' })
      .expect(200);

    ownerToken = regRes.body.data.token;
  });

  // TC-NOTIF-01
  describe('GET /notifications', () => {
    it('[TC-NOTIF-01] should return 200 OK with notification history (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('[TC-NOTIF-02] should return 401 when accessed without JWT token (Blackbox)', async () => {
      await request(app.getHttpServer())
        .get('/notifications')
        .expect(401);
    });
  });

  // TC-NOTIF-02, TC-NOTIF-03
  describe('POST /notifications/fcm-token', () => {
    it('[TC-NOTIF-02] should register FCM token and return 201 (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications/fcm-token')
        .set('Authorization', ownerToken)
        .send({ token: 'fake-fcm-token-abc123' })
        .expect(201);

      expect(res.body.data).toBeDefined();
    });

    it('[TC-NOTIF-03] should persist FCM token in user document (Whitebox)', async () => {
      const fcmToken = 'fake-fcm-token-whitebox';
      await request(app.getHttpServer())
        .post('/notifications/fcm-token')
        .set('Authorization', ownerToken)
        .send({ token: fcmToken })
        .expect(201);

      const user = await connection.model('User').findOne({ email: 'notif@owner.com' });
      expect(user!.fcmTokens).toContain(fcmToken);
    });

    it('[TC-NOTIF-05] should not duplicate FCM token if registered twice (Whitebox)', async () => {
      const fcmToken = 'duplicate-fcm-token-test';

      await request(app.getHttpServer())
        .post('/notifications/fcm-token')
        .set('Authorization', ownerToken)
        .send({ token: fcmToken })
        .expect(201);

      await request(app.getHttpServer())
        .post('/notifications/fcm-token')
        .set('Authorization', ownerToken)
        .send({ token: fcmToken })
        .expect(201);

      const user = await connection.model('User').findOne({ email: 'notif@owner.com' });
      const count = user!.fcmTokens.filter((t: string) => t === fcmToken).length;
      expect(count).toBe(1);
    });
  });

  // TC-NOTIF-04, TC-NOTIF-05
  describe('DELETE /notifications/fcm-token', () => {
    it('[TC-NOTIF-04] should delete FCM token and return 200 OK (Blackbox)', async () => {
      const fcmToken = 'fake-fcm-token-to-delete';
      await request(app.getHttpServer())
        .post('/notifications/fcm-token')
        .set('Authorization', ownerToken)
        .send({ token: fcmToken })
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete('/notifications/fcm-token')
        .set('Authorization', ownerToken)
        .send({ token: fcmToken })
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('[TC-NOTIF-05] should remove FCM token from user document (Whitebox)', async () => {
      const fcmToken = 'fake-fcm-token-whitebox-delete';
      await request(app.getHttpServer())
        .post('/notifications/fcm-token')
        .set('Authorization', ownerToken)
        .send({ token: fcmToken })
        .expect(201);

      await request(app.getHttpServer())
        .delete('/notifications/fcm-token')
        .set('Authorization', ownerToken)
        .send({ token: fcmToken })
        .expect(200);

      const user = await connection.model('User').findOne({ email: 'notif@owner.com' });
      expect(user!.fcmTokens).not.toContain(fcmToken);
    });

    it('[TC-NOTIF-08] should return 200 when deleting a non-existent FCM token (Blackbox)', async () => {
      await request(app.getHttpServer())
        .delete('/notifications/fcm-token')
        .set('Authorization', ownerToken)
        .send({ token: 'non-existent-token-xyz' })
        .expect(200);
    });
  });
});
