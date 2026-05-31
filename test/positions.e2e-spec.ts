import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { Role } from '../src/common/enums/role.enum';

jest.setTimeout(60000);

describe('PositionsController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let ownerToken: string;
  let companyId: string;
  let staffToken: string;
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

    // Register company owner
    const regRes = await request(app.getHttpServer())
      .post('/auth/register-company')
      .send({
        name: 'Owner Pos',
        email: 'owner@pos.com',
        password: 'password123',
        companyName: 'Pos Corp',
      })
      .expect(200);

    ownerToken = regRes.body.data.token;
    companyId = regRes.body.data.user.company._id;

    // Register a client user (non-staff)
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Client User', email: 'client@pos.com', password: 'password123', role: Role.Client })
      .expect(200);

    const clientLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'client@pos.com', password: 'password123' })
      .expect(200);

    clientToken = clientLoginRes.body.data.token;
  });

  // TC-POS-06, TC-POS-07, TC-POS-08, TC-POS-09
  describe('POST /positions', () => {
    it('[TC-POS-06] should create a new position when owner (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: 'Teknisi Lapangan', description: 'Bertanggung jawab atas instalasi lapangan' })
        .expect(201);

      expect(res.body.data).toEqual(
        expect.objectContaining({ name: 'Teknisi Lapangan' }),
      );
    });

    it('[TC-POS-07] should return 403 Forbidden when non-admin creates position (Blackbox)', async () => {
      await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', clientToken)
        .send({ name: 'Test', description: 'Test' })
        .expect(403);
    });

    it('[TC-POS-09] should persist new position record in MongoDB (Whitebox)', async () => {
      await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: 'Admin Gudang', description: 'Kelola inventaris gudang' })
        .expect(201);

      const pos = await connection.model('Position').findOne({ name: 'Admin Gudang' });
      expect(pos).toBeDefined();
      expect(pos!.name).toBe('Admin Gudang');
    });

    it('[TC-POS-08] should return 400 when name is empty (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: '', description: '' })
        .expect(400);

      expect(res.body).toEqual(
        expect.objectContaining({ code: 400 }),
      );
    });
  });

  // TC-POS-01, TC-POS-02
  describe('GET /positions', () => {
    it('[TC-POS-01] should return 200 OK with position list (Blackbox)', async () => {
      await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: 'Supervisor', description: 'Supervisor produksi' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/positions')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'Supervisor' }),
      ]));
    });

    it('[TC-POS-02] should only return positions belonging to owner company (Whitebox)', async () => {
      // Create position in company A
      await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: 'Hanya Milik A', description: 'Test cross-company' })
        .expect(201);

      // Register company B
      const regB = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({ name: 'Owner B', email: 'ownerb@pos.com', password: 'password123', companyName: 'Company B' })
        .expect(200);

      const tokenB = regB.body.data.token;
      const resB = await request(app.getHttpServer())
        .get('/positions')
        .set('Authorization', tokenB)
        .expect(200);

      // Company B's position list should not contain 'Hanya Milik A'
      const names = resB.body.data.map((p: any) => p.name);
      expect(names).not.toContain('Hanya Milik A');
    });
  });

  // TC-POS-03, TC-POS-04
  describe('GET /positions/:id', () => {
    it('[TC-POS-03] should return 200 OK with position detail (Blackbox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: 'QA Engineer', description: 'Quality Assurance' })
        .expect(201);

      const posId = created.body.data._id;
      const res = await request(app.getHttpServer())
        .get(`/positions/${posId}`)
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toEqual(expect.objectContaining({ name: 'QA Engineer' }));
    });

    it('[TC-POS-04] should return 404 Not Found for invalid ID (Blackbox)', async () => {
      const fakeId = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .get(`/positions/${fakeId}`)
        .set('Authorization', ownerToken)
        .expect(404);
    });

    it('[TC-POS-05] should return 401 when accessed without JWT token (Blackbox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: 'Test Pos', description: 'Test' })
        .expect(201);

      const posId = created.body.data._id;
      await request(app.getHttpServer())
        .get(`/positions/${posId}`)
        .expect(401);
    });
  });

  // TC-POS-10, TC-POS-11
  describe('PUT /positions/:id', () => {
    it('[TC-POS-10] should update position and return 200 OK (Blackbox + Whitebox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: 'Old Name', description: 'Old Desc' })
        .expect(201);

      const posId = created.body.data._id;

      const res = await request(app.getHttpServer())
        .put(`/positions/${posId}`)
        .set('Authorization', ownerToken)
        .send({ name: 'New Name', description: 'New Desc' })
        .expect(200);

      expect(res.body.data).toEqual(expect.objectContaining({ name: 'New Name' }));

      const dbPos = await connection.model('Position').findById(posId);
      expect(dbPos!.name).toBe('New Name');
    });

    it('[TC-POS-11] should return 404 when updating a non-existent position (Blackbox)', async () => {
      const fakeId = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .put(`/positions/${fakeId}`)
        .set('Authorization', ownerToken)
        .send({ name: 'Updated', description: 'Updated desc' })
        .expect(404);
    });
  });

  // TC-POS-12
  describe('DELETE /positions/:id', () => {
    it('[TC-POS-12] should delete position and return 200 OK (Blackbox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: 'To Delete', description: 'Will be deleted' })
        .expect(201);

      const posId = created.body.data._id;
      await request(app.getHttpServer())
        .delete(`/positions/${posId}`)
        .set('Authorization', ownerToken)
        .expect(200);
    });

    it('[TC-POS-13] should remove position from MongoDB after delete (Whitebox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/positions')
        .set('Authorization', ownerToken)
        .send({ name: 'To Delete WB', description: 'Will be deleted whitebox' })
        .expect(201);

      const posId = created.body.data._id;
      await request(app.getHttpServer())
        .delete(`/positions/${posId}`)
        .set('Authorization', ownerToken)
        .expect(200);

      const pos = await connection.model('Position').findById(posId);
      expect(pos).toBeNull();
    });
  });
});
