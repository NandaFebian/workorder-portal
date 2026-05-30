import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { Role } from '../src/common/enums/role.enum';

jest.setTimeout(60000);

describe('CompanyController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let ownerToken: string;
  let ownerUser: any;
  let companyId: string;
  let otherToken: string;

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
    // Clean up the database before each test
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    // Register a company and owner
    const regRes = await request(app.getHttpServer())
      .post('/auth/register-company')
      .send({
        name: 'John Owner',
        email: 'owner@acme.com',
        password: 'password123',
        companyName: 'ACME Corp',
      })
      .expect(200);

    ownerToken = regRes.body.data.token;
    ownerUser = regRes.body.data.user;
    companyId = regRes.body.data.user.company._id;

    // Register an unassigned staff user for invitation tests
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Staff Candidate',
        email: 'staff.candidate@example.com',
        password: 'password123',
        role: Role.UnassignedStaff,
      })
      .expect(200);

    // Register another client (unauthorized for internal company endpoints)
    const otherRegRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Other Client',
        email: 'other.client@example.com',
        password: 'password123',
        role: Role.Client,
      })
      .expect(200);

    const otherLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'other.client@example.com',
        password: 'password123',
      })
      .expect(200);

    otherToken = otherLoginRes.body.data.token;
  });

  describe('GET /company', () => {
    it('should retrieve internal company details for company owner (Blackbox & Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/company')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Company retrieved successfully',
          data: expect.objectContaining({
            _id: companyId,
            name: 'ACME Corp',
          }),
        }),
      );
    });

    it('should return 403 Forbidden for a general client accessing internal company (Blackbox)', async () => {
      await request(app.getHttpServer())
        .get('/company')
        .set('Authorization', otherToken)
        .expect(403);
    });
  });

  describe('POST /company/invite', () => {
    it('should successfully invite a company manager (Blackbox & Whitebox)', async () => {
      const invitePayload = {
        invites: [
          {
            email: 'staff.candidate@example.com',
            role: Role.CompanyManager,
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .post('/company/invite')
        .set('Authorization', ownerToken)
        .send(invitePayload)
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Successfully invited 1 member(s)',
          data: expect.arrayContaining([
            expect.objectContaining({
              role: Role.CompanyManager,
              status: 'pending',
            }),
          ]),
        }),
      );

      // Whitebox check: ensure Invitation record is created in MongoDB
      const invitation = await connection.model('Invitation').findOne({
        companyId: new Types.ObjectId(companyId),
        role: Role.CompanyManager,
      });
      expect(invitation).toBeDefined();
      expect(invitation!.status).toBe('pending');
    });

    it('should return 422 Unprocessable Entity when inviting an already associated user', async () => {
      const invitePayload = {
        invites: [
          {
            email: 'owner@acme.com', // Owner is already associated with ACME Corp
            role: Role.CompanyManager,
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .post('/company/invite')
        .set('Authorization', ownerToken)
        .send(invitePayload)
        .expect(422);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Validation failed',
          errors: expect.any(Object),
        }),
      );
    });
  });

  describe('GET /company/invitations/history', () => {
    it('should retrieve invitation history for the company (Blackbox & Whitebox)', async () => {
      // Create a pending invitation first
      const invitePayload = {
        invites: [
          {
            email: 'staff.candidate@example.com',
            role: Role.CompanyManager,
          },
        ],
      };
      await request(app.getHttpServer())
        .post('/company/invite')
        .set('Authorization', ownerToken)
        .send(invitePayload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/company/invitations/history')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Invitations retrieved successfully',
          data: expect.arrayContaining([
            expect.objectContaining({
              role: Role.CompanyManager,
              status: 'pending',
            }),
          ]),
        }),
      );
    });
  });

  describe('GET /company/employees', () => {
    it('should retrieve company employee list (Blackbox & Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/company/employees')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Employees retrieved successfully',
          data: expect.any(Array),
        }),
      );
    });
  });

  describe('PUT /company', () => {
    it('should successfully update company profile information (Blackbox & Whitebox)', async () => {
      const updatePayload = {
        name: 'ACME Global Inc',
        address: '123 Enterprise Rd',
        description: 'Global tech provider',
      };

      const res = await request(app.getHttpServer())
        .put('/company')
        .set('Authorization', ownerToken)
        .send(updatePayload)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Company updated successfully',
          data: expect.objectContaining({
            _id: companyId,
            name: updatePayload.name,
            address: updatePayload.address,
            description: updatePayload.description,
          }),
        }),
      );

      // Whitebox check: verify in database
      const company = await connection.model('Company').findById(companyId);
      expect(company!.name).toBe(updatePayload.name);
      expect(company!.address).toBe(updatePayload.address);
    });
  });

  describe('GET /company/detail', () => {
    it('should retrieve detail company profile (Blackbox & Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/company/detail')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Company retrieved successfully',
          data: expect.objectContaining({
            _id: companyId,
            name: 'ACME Corp',
          }),
        }),
      );
    });
  });

  describe('DELETE /company', () => {
    it('should perform a soft-delete of company by setting deletedAt flag (Blackbox & Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/company')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Company deleted successfully',
          data: expect.objectContaining({
            deletedAt: expect.any(String),
          }),
        }),
      );

      // Whitebox check: ensure the record in DB has a deletedAt timestamp
      const company = await connection.model('Company').findById(companyId);
      expect(company!.deletedAt).not.toBeNull();
    });
  });

  describe('GET & PUT /company/integration-config', () => {
    it('should successfully get and update company integration config (Blackbox & Whitebox)', async () => {
      // 1. Get current integration config
      const getRes = await request(app.getHttpServer())
        .get('/company/integration-config')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(getRes.body).toEqual(
        expect.objectContaining({
          message: 'Integration config retrieved successfully',
          data: expect.objectContaining({
            is_integration_active: false,
          }),
        }),
      );

      // 2. Update integration config
      const updatePayload = {
        is_integration_active: true,
        integration_type: 'external_system' as const,
        external_login_url: 'http://acme.com/login',
        external_verify_url: 'http://acme.com/verify',
        external_check_memberships_url: 'http://acme.com/memberships',
        external_check_status_url: 'http://acme.com/status',
        secret_key: 'supersecretkey',
      };

      const putRes = await request(app.getHttpServer())
        .put('/company/integration-config')
        .set('Authorization', ownerToken)
        .send(updatePayload)
        .expect(200);

      expect(putRes.body).toEqual(
        expect.objectContaining({
          message: 'Integration config updated successfully',
          data: expect.objectContaining({
            is_integration_active: true,
            external_login_url: updatePayload.external_login_url,
          }),
        }),
      );

      // Whitebox check: verified mapping in DB (camelCase mapping verification)
      const company = await connection.model('Company').findById(companyId);
      expect(company!.integrationConfig.isIntegrationActive).toBe(true);
      expect(company!.integrationConfig.externalLoginUrl).toBe(updatePayload.external_login_url);
    });
  });

  describe('GET /public/companies', () => {
    it('should retrieve list of public companies without authentication (Blackbox & Whitebox)', async () => {
      // Let's activate the company first so that it is public/active
      await connection.model('Company').findByIdAndUpdate(companyId, { isActive: true });

      const res = await request(app.getHttpServer())
        .get('/public/companies')
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Companies retrieved successfully',
          data: expect.arrayContaining([
            expect.objectContaining({
              _id: companyId,
              name: 'ACME Corp',
            }),
          ]),
        }),
      );
    });

    it('should retrieve public company details by id (Blackbox & Whitebox)', async () => {
      // Let's activate company
      await connection.model('Company').findByIdAndUpdate(companyId, { isActive: true });

      const res = await request(app.getHttpServer())
        .get(`/public/companies/${companyId}`)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Company retrieved successfully',
          data: expect.objectContaining({
            _id: companyId,
            name: 'ACME Corp',
          }),
        }),
      );
    });

    it('should retrieve public company services list (Blackbox & Whitebox)', async () => {
      // Let's activate the company first so that it is active
      await connection.model('Company').findByIdAndUpdate(companyId, { isActive: true });

      const res = await request(app.getHttpServer())
        .get(`/public/companies/${companyId}/services`)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Services retrieved successfully',
          data: expect.any(Array),
        }),
      );
    });
  });
});
