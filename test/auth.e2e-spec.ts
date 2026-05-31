import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Role } from '../src/common/enums/role.enum';
import * as bcrypt from 'bcrypt';

jest.setTimeout(60000);

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

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
  });

  describe('POST /auth/register', () => {
    const registerPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: Role.Client,
    };

    it('should successfully register a new user (Blackbox & Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'User registered successfully',
          data: expect.objectContaining({
            name: registerPayload.name,
            email: registerPayload.email,
            role: registerPayload.role,
          }),
        }),
      );

      // Whitebox check: User is in the database and password is encrypted
      const user = await connection
        .model('User')
        .findOne({ email: registerPayload.email })
        .select('+password');
      expect(user).toBeDefined();
      expect(user!.name).toBe(registerPayload.name);
      expect(user!.password).not.toBe(registerPayload.password);

      const isPasswordMatched = await bcrypt.compare(
        registerPayload.password,
        user!.password,
      );
      expect(isPasswordMatched).toBe(true);
    });

    it('should return 400 Bad Request when email already exists', async () => {
      // Register first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(200);

      // Register same email again
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(400);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 400,
          message: 'Email already registered',
        }),
      );
    });

    it('should return 400 validation error when input is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: '',
          email: 'not-an-email',
          password: '123', // less than 6 chars
          role: 'invalid_role',
        })
        .expect(400);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 400,
          message: 'Validation failed',
        }),
      );
    });
  });

  describe('POST /auth/register-company', () => {
    const registerCompanyPayload = {
      name: 'Owner Name',
      email: 'owner@company.com',
      password: 'password123',
      companyName: 'ACME Corp',
    };

    it('should successfully register a company and owner (Blackbox & Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send(registerCompanyPayload)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Company and owner registered successfully',
          data: expect.objectContaining({
            user: expect.objectContaining({
              name: registerCompanyPayload.name,
              email: registerCompanyPayload.email,
              role: Role.CompanyOwner,
              company: expect.objectContaining({
                name: registerCompanyPayload.companyName,
              }),
            }),
            token: expect.any(String),
          }),
        }),
      );

      // Whitebox check: company and owner relation in database
      const user = await connection
        .model('User')
        .findOne({ email: registerCompanyPayload.email });
      expect(user).toBeDefined();
      expect(user!.role).toBe(Role.CompanyOwner);
      expect(user!.companyId).toBeDefined();

      const company = await connection
        .model('Company')
        .findOne({ ownerId: user!._id });
      expect(company).toBeDefined();
      expect(company!.name).toBe(registerCompanyPayload.companyName);
      expect(user!.companyId.toString()).toBe(company!._id.toString());
    });

    it('should return 400 Bad Request when owner email already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register-company')
        .send(registerCompanyPayload)
        .expect(200);

      const res = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send(registerCompanyPayload)
        .expect(400);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 400,
          message: 'Email already registered',
        }),
      );
    });

    it('should return 400 validation error when fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({
          name: '',
          email: 'invalid-email',
        })
        .expect(400);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 400,
          message: 'Validation failed',
        }),
      );
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Pre-register a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: Role.Client,
        })
        .expect(200);
    });

    it('should successfully login and return access token (Blackbox & Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Operation successful',
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'jane@example.com',
              role: Role.Client,
            }),
            token: expect.stringMatching(/^Bearer\s.+$/),
          }),
        }),
      );
    });

    it('should return 400 when logging in with invalid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'wrongpassword',
        })
        .expect(400);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 400,
          message: 'Invalid credentials',
        }),
      );
    });

    it('[TC-AUTH-09] should return 400 when email is not registered (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notexist@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 400,
          message: 'Invalid credentials',
        }),
      );
    });
  });

  describe('POST /auth/logout', () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({
          name: 'Owner',
          email: 'owner@logout.com',
          password: 'password123',
          companyName: 'Logout Corp',
        })
        .expect(200);

      token = res.body.data.token;
    });

    it('should successfully logout when authenticated (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', token)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Logout successful. Please discard your token.',
        }),
      );
    });

    it('should return 401 Unauthorized when logging out without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 401,
        }),
      );
    });
  });

  describe('GET /auth/profile', () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({
          name: 'Profile Owner',
          email: 'profile@owner.com',
          password: 'password123',
          companyName: 'Profile Corp',
        })
        .expect(200);

      token = res.body.data.token;
    });

    it('should retrieve active user profile with valid JWT (Blackbox & Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', token)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Profile retrieved successfully',
          data: expect.objectContaining({
            email: 'profile@owner.com',
            role: Role.CompanyOwner,
          }),
        }),
      );

      // Verify password is not in profile output
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return 401 Unauthorized when profile is accessed without JWT', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 401,
        }),
      );
    });
  });
});
