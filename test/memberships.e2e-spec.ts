import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { Role } from '../src/common/enums/role.enum';

jest.setTimeout(60000);

describe('MembershipsController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let ownerToken: string;
  let companyId: string;
  let clientToken: string;

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
      .send({ name: 'MBR Owner', email: 'mbr@owner.com', password: 'password123', companyName: 'MBR Corp' })
      .expect(200);

    ownerToken = regRes.body.data.token;
    companyId = regRes.body.data.user.company._id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Client User', email: 'client@mbr.com', password: 'password123', role: Role.Client })
      .expect(200);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'client@mbr.com', password: 'password123' })
      .expect(200);

    clientToken = loginRes.body.data.token;
  });

  // TC-MBR-01
  describe('GET /memberships', () => {
    it('[TC-MBR-01] should return 200 OK with active membership list (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/memberships')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });

  // TC-MBR-02
  describe('GET /memberships/codes', () => {
    it('[TC-MBR-02] should return 200 OK with membership code list (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/memberships/codes')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });

  // TC-MBR-03, TC-MBR-04
  describe('POST /memberships/codes', () => {
    it('[TC-MBR-03] should generate a new membership code and return 201 (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/memberships/codes')
        .set('Authorization', ownerToken)
        .send({ role: Role.CompanyStaff, maxUses: 5 })
        .expect(201);

      expect(res.body.data).toBeDefined();
    });

    it('[TC-MBR-04] should persist membership code in MongoDB (Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/memberships/codes')
        .set('Authorization', ownerToken)
        .send({ role: Role.CompanyStaff, maxUses: 5 })
        .expect(201);

      const codeId = res.body.data._id;
      const doc = await connection.model('MembershipCode').findById(codeId);
      expect(doc).toBeDefined();
    });

    it('[TC-MBR-05] should return 400 when role is invalid (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/memberships/codes')
        .set('Authorization', ownerToken)
        .send({ role: 'invalid_role', maxUses: 5 })
        .expect(400);

      expect(res.body).toEqual(expect.objectContaining({ code: 400 }));
    });
  });

  // TC-MBR-05, TC-MBR-06, TC-MBR-07, TC-MBR-08
  describe('POST /memberships/codes/claim', () => {
    let validCode: string;
    let codeId: string;

    beforeEach(async () => {
      const codeRes = await request(app.getHttpServer())
        .post('/memberships/codes')
        .set('Authorization', ownerToken)
        .send({ role: Role.CompanyStaff, maxUses: 10 })
        .expect(201);

      validCode = codeRes.body.data.code;
      codeId = codeRes.body.data._id;
    });

    it('[TC-MBR-05] should claim a valid code and join company (Blackbox + Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/memberships/codes/claim')
        .set('Authorization', clientToken)
        .send({ code: validCode })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('[TC-MBR-07] should set companyId on user after successful claim (Whitebox)', async () => {
      await request(app.getHttpServer())
        .post('/memberships/codes/claim')
        .set('Authorization', clientToken)
        .send({ code: validCode })
        .expect(200);

      const user = await connection.model('User').findOne({ email: 'client@mbr.com' });
      expect(user!.companyId?.toString()).toBe(companyId);
    });

    it('[TC-MBR-07] should return 400 for invalid membership code (Blackbox)', async () => {
      await request(app.getHttpServer())
        .post('/memberships/codes/claim')
        .set('Authorization', clientToken)
        .send({ code: 'INVALID_CODE_XYZ' })
        .expect(400);
    });

    it('[TC-MBR-09] should return 400 when code has reached maxUses limit (Blackbox)', async () => {
      // Create a code with maxUses: 1
      const limitedCodeRes = await request(app.getHttpServer())
        .post('/memberships/codes')
        .set('Authorization', ownerToken)
        .send({ role: Role.CompanyStaff, maxUses: 1 })
        .expect(201);

      const limitedCode = limitedCodeRes.body.data.code;

      // First client claims successfully
      await request(app.getHttpServer())
        .post('/memberships/codes/claim')
        .set('Authorization', clientToken)
        .send({ code: limitedCode })
        .expect(200);

      // Register second client
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Second Client', email: 'second@mbr2.com', password: 'password123', role: Role.Client })
        .expect(200);

      const loginRes2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'second@mbr2.com', password: 'password123' })
        .expect(200);

      const secondToken = loginRes2.body.data.token;

      // Second client tries to claim same maxed-out code
      await request(app.getHttpServer())
        .post('/memberships/codes/claim')
        .set('Authorization', secondToken)
        .send({ code: limitedCode })
        .expect(400);
    });
  });

  // TC-MBR-09
  describe('DELETE /memberships/codes/:id', () => {
    it('[TC-MBR-09] should deactivate membership code and return 200 OK (Blackbox)', async () => {
      const codeRes = await request(app.getHttpServer())
        .post('/memberships/codes')
        .set('Authorization', ownerToken)
        .send({ role: Role.CompanyStaff, maxUses: 5 })
        .expect(201);

      const codeId = codeRes.body.data._id;

      await request(app.getHttpServer())
        .delete(`/memberships/codes/${codeId}`)
        .set('Authorization', ownerToken)
        .expect(200);
    });

    it('[TC-MBR-11] should deactivate code in MongoDB after delete (Whitebox)', async () => {
      const codeRes = await request(app.getHttpServer())
        .post('/memberships/codes')
        .set('Authorization', ownerToken)
        .send({ role: Role.CompanyStaff, maxUses: 5 })
        .expect(201);

      const codeId = codeRes.body.data._id;

      await request(app.getHttpServer())
        .delete(`/memberships/codes/${codeId}`)
        .set('Authorization', ownerToken)
        .expect(200);

      const doc = await connection.model('MembershipCode').findById(codeId);
      expect(doc === null || doc!.isActive === false).toBe(true);
    });
  });
});
