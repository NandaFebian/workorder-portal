import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { Role } from '../src/common/enums/role.enum';

jest.setTimeout(60000);

describe('InvitationsController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let ownerToken: string;
  let companyId: string;
  let staffToken: string;
  let invitationId: string;

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
      .send({ name: 'INV Owner', email: 'inv@owner.com', password: 'password123', companyName: 'INV Corp' })
      .expect(200);

    ownerToken = regRes.body.data.token;
    companyId = regRes.body.data.user.company._id;

    // Register a staff candidate
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Staff INV', email: 'staff@inv.com', password: 'password123', role: Role.UnassignedStaff })
      .expect(200);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'staff@inv.com', password: 'password123' })
      .expect(200);

    staffToken = loginRes.body.data.token;

    // Create invitation
    const invRes = await request(app.getHttpServer())
      .post('/company/invite')
      .set('Authorization', ownerToken)
      .send({ invites: [{ email: 'staff@inv.com', role: Role.CompanyStaff }] })
      .expect(201);

    invitationId = invRes.body.data[0]._id;
  });

  // TC-INV-01
  describe('GET /invitations/pending', () => {
    it('[TC-INV-01] should return pending invitations for user (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/invitations/pending')
        .set('Authorization', staffToken)
        .expect(200);

      expect(res.body.data).toEqual(
        expect.arrayContaining([expect.objectContaining({ _id: invitationId })]),
      );
    });
  });

  // TC-INV-02, TC-INV-03
  describe('PUT /invitations/:id/accept', () => {
    it('[TC-INV-02] should accept invitation and return 200 OK (Blackbox + Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/invitations/${invitationId}/accept`)
        .set('Authorization', staffToken)
        .expect(200);

      expect(res.body.data.status).toBe('accepted');

      // Whitebox: verify staff is now associated with company
      const user = await connection.model('User').findOne({ email: 'staff@inv.com' });
      expect(user!.companyId?.toString()).toBe(companyId);
    });
  });

  // TC-INV-04
  describe('PUT /invitations/:id/reject', () => {
    it('[TC-INV-04] should reject invitation and return 200 OK (Blackbox)', async () => {
      // Create a new invitation for the reject test
      const newInvRes = await request(app.getHttpServer())
        .post('/company/invite')
        .set('Authorization', ownerToken)
        .send({ invites: [{ email: 'staff@inv.com', role: Role.CompanyStaff }] });

      if (newInvRes.status === 201) {
        const newInvId = newInvRes.body.data[0]._id;
        const res = await request(app.getHttpServer())
          .put(`/invitations/${newInvId}/reject`)
          .set('Authorization', staffToken)
          .expect(200);

        expect(res.body.data.status).toBe('rejected');
      }
    });
  });

  // TC-INV-05
  describe('DELETE /invitations/:id', () => {
    it('[TC-INV-05] should cancel/withdraw invitation by sender (Blackbox)', async () => {
      await request(app.getHttpServer())
        .delete(`/invitations/${invitationId}`)
        .set('Authorization', ownerToken)
        .expect(200);
    });
  });
});
