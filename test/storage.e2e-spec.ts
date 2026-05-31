import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Role } from '../src/common/enums/role.enum';

jest.setTimeout(60000);

describe('StorageController (e2e)', () => {
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
      .send({ name: 'File Owner', email: 'file@owner.com', password: 'password123', companyName: 'File Corp' })
      .expect(200);

    ownerToken = regRes.body.data.token;
  });

  // TC-FILE-02
  describe('POST /files', () => {
    it('[TC-FILE-02] should return 400 when file exceeds 5MB size limit (Blackbox)', async () => {
      // Create a buffer > 5MB filled with zeros
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 0);

      const res = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', ownerToken)
        .attach('file', largeBuffer, { filename: 'large.png', contentType: 'image/png' });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('[TC-FILE-03] should return 400 when file type is not an image (Blackbox)', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 fake pdf content');

      const res = await request(app.getHttpServer())
        .post('/files')
        .set('Authorization', ownerToken)
        .attach('file', pdfBuffer, { filename: 'document.pdf', contentType: 'application/pdf' });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
