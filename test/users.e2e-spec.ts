import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Role } from '../src/common/enums/role.enum';

jest.setTimeout(60000);

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let clientToken: string;
  let clientUser: any;

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

    // Register a client user to get token
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Jane User',
        email: 'jane.user@example.com',
        password: 'password123',
        role: Role.Client,
      })
      .expect(200);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'jane.user@example.com',
        password: 'password123',
      })
      .expect(200);

    clientToken = loginRes.body.data.token;
    clientUser = loginRes.body.data.user;
  });

  describe('GET /users/me', () => {
    it('should successfully get authenticated user profile (Blackbox & Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', clientToken)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Operation successful',
          data: expect.objectContaining({
            _id: clientUser._id,
            email: 'jane.user@example.com',
            name: 'Jane User',
            role: Role.Client,
          }),
        }),
      );

      // Whitebox check: ensure password is excluded
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return 401 Unauthorized when accessed without JWT token', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 401,
          message: 'Unauthorized',
        }),
      );
    });
  });

  describe('PATCH /users/me', () => {
    it('should successfully update name and email (Blackbox & Whitebox)', async () => {
      const updateDto = {
        name: 'Jane Updated',
        email: 'jane.updated@example.com',
      };

      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', clientToken)
        .send(updateDto)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Operation successful',
          data: expect.objectContaining({
            name: updateDto.name,
            email: updateDto.email,
          }),
        }),
      );

      // Whitebox check: verified in DB
      const userInDb = await connection.model('User').findById(clientUser._id);
      expect(userInDb).toBeDefined();
      expect(userInDb!.name).toBe(updateDto.name);
      expect(userInDb!.email).toBe(updateDto.email);
    });

    it('should successfully change password when currentPassword is correct (Blackbox & Whitebox)', async () => {
      const updateDto = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      };

      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', clientToken)
        .send(updateDto)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Operation successful',
        }),
      );

      // Whitebox check: check new password by logging in again
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'jane.user@example.com',
          password: 'newpassword123',
        })
        .expect(200);

      expect(loginRes.body.data.token).toBeDefined();
    });

    it('should return 401 Unauthorized when currentPassword is incorrect', async () => {
      const updateDto = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', clientToken)
        .send(updateDto)
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 401,
        }),
      );
    });

    it('should return 400 validation error when input is invalid', async () => {
      const updateDto = {
        email: 'invalid-email-format',
      };

      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', clientToken)
        .send(updateDto)
        .expect(400);

      expect(res.body).toEqual(
        expect.objectContaining({
          code: 400,
          message: 'Validation failed',
        }),
      );
    });
  });
});
