import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

jest.setTimeout(60000);

describe('FormsController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let ownerToken: string;

  const intakeFormPayload = {
    title: 'Form Intake Test',
    description: 'Form untuk mengajukan request',
    formType: 'intake',
    fields: [
      { order: 1, label: 'Nama Pemohon', type: 'text', required: true, placeholder: 'Masukkan nama' },
      { order: 2, label: 'Keterangan', type: 'textarea', required: true },
    ],
  };

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
      .send({ name: 'Form Owner', email: 'form@owner.com', password: 'password123', companyName: 'Form Corp' })
      .expect(200);

    ownerToken = regRes.body.data.token;
  });

  // TC-FORM-01, TC-FORM-02
  describe('POST /forms', () => {
    it('[TC-FORM-01] should create a form template and return 201 (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      expect(res.body.data).toEqual(
        expect.objectContaining({ title: intakeFormPayload.title, formType: 'intake' }),
      );
    });

    it('[TC-FORM-02] should return 400 when formType is invalid (Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send({ ...intakeFormPayload, formType: 'invalid_type' })
        .expect(400);

      expect(res.body.message).toContain('Validation failed');
    });

    it('[TC-FORM-03] should persist form record in MongoDB after create (Whitebox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      const formId = res.body.data._id;
      const formInDb = await connection.model('FormTemplate').findById(formId);
      expect(formInDb).toBeDefined();
      expect(formInDb!.title).toBe(intakeFormPayload.title);
    });

    it('[TC-FORM-04] should return 400 when title is empty (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send({ ...intakeFormPayload, title: '' })
        .expect(400);

      expect(res.body.message).toContain('Validation failed');
    });
  });

  // TC-FORM-03, TC-FORM-04
  describe('GET /forms', () => {
    it('[TC-FORM-03] should return 200 OK with all forms belonging to company (Blackbox)', async () => {
      await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/forms')
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toEqual(expect.arrayContaining([
        expect.objectContaining({ title: intakeFormPayload.title }),
      ]));
    });

    it('[TC-FORM-04] should only return forms from owner company (Whitebox)', async () => {
      await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      const regB = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({ name: 'Owner B', email: 'ownerb@form.com', password: 'password123', companyName: 'Company B' })
        .expect(200);

      const tokenB = regB.body.data.token;
      const resB = await request(app.getHttpServer())
        .get('/forms')
        .set('Authorization', tokenB)
        .expect(200);

      const titles = resB.body.data.map((f: any) => f.title);
      expect(titles).not.toContain(intakeFormPayload.title);
    });
  });

  // TC-FORM-05, TC-FORM-06
  describe('GET /forms/:id', () => {
    it('[TC-FORM-05] should return 200 OK with form detail (Blackbox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      const formId = created.body.data._id;
      const res = await request(app.getHttpServer())
        .get(`/forms/${formId}`)
        .set('Authorization', ownerToken)
        .expect(200);

      expect(res.body.data).toEqual(
        expect.objectContaining({ _id: formId, title: intakeFormPayload.title }),
      );
    });

    it('[TC-FORM-05b] should return 404 when form not found (Blackbox)', async () => {
      const fakeId = new Types.ObjectId().toString();
      await request(app.getHttpServer())
        .get(`/forms/${fakeId}`)
        .set('Authorization', ownerToken)
        .expect(404);
    });
  });

  // TC-FORM-07
  describe('PUT /forms/:id', () => {
    it('[TC-FORM-07] should update form and return 200 OK (Blackbox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      const formId = created.body.data._id;
      const res = await request(app.getHttpServer())
        .put(`/forms/${formId}`)
        .set('Authorization', ownerToken)
        .send({ title: 'Form Updated', fields: intakeFormPayload.fields })
        .expect(200);

      expect(res.body.data.title).toBe('Form Updated');
    });

    it('[TC-FORM-10] should persist form update in MongoDB (Whitebox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      const formId = created.body.data._id;
      await request(app.getHttpServer())
        .put(`/forms/${formId}`)
        .set('Authorization', ownerToken)
        .send({ title: 'Form Updated WB', fields: intakeFormPayload.fields })
        .expect(200);

      const formInDb = await connection.model('FormTemplate').findById(formId);
      expect(formInDb!.title).toBe('Form Updated WB');
    });
  });

  // TC-FORM-09, TC-FORM-10, TC-FORM-11, TC-FORM-12, TC-FORM-13
  describe('POST /forms/submissions', () => {
    let formId: string;

    beforeEach(async () => {
      const created = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      formId = created.body.data._id;
    });

    it('[TC-FORM-09] should submit form with valid required fields (Blackbox + Whitebox)', async () => {
      const fields = await connection.model('FormTemplate').findById(formId);
      const fieldId = (fields as any).fields[0]._id.toString();

      const res = await request(app.getHttpServer())
        .post('/forms/submissions')
        .set('Authorization', ownerToken)
        .send({
          formId,
          answers: [{ fieldId, value: 'Budi Santoso' }],
        })
        .expect(201);

      expect(res.body.data).toBeDefined();

      // Whitebox: record exists in DB
      const submission = await connection.model('FormSubmission').findById(res.body.data._id);
      expect(submission).toBeDefined();
    });

    it('[TC-FORM-10] should return 400 when required field is empty (Blackbox)', async () => {
      const res = await request(app.getHttpServer())
        .post('/forms/submissions')
        .set('Authorization', ownerToken)
        .send({ formId, answers: [] });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('[TC-FORM-13] should return error when formId is not registered (Blackbox)', async () => {
      const fakeFormId = new Types.ObjectId().toString();
      const res = await request(app.getHttpServer())
        .post('/forms/submissions')
        .set('Authorization', ownerToken)
        .send({ formId: fakeFormId, answers: [] });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // TC-FORM-14
  describe('DELETE /forms/:id', () => {
    it('[TC-FORM-14] should delete form and return 200 OK (Blackbox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      const formId = created.body.data._id;
      await request(app.getHttpServer())
        .delete(`/forms/${formId}`)
        .set('Authorization', ownerToken)
        .expect(200);
    });

    it('[TC-FORM-15] should remove form from MongoDB after delete (Whitebox)', async () => {
      const created = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', ownerToken)
        .send(intakeFormPayload)
        .expect(201);

      const formId = created.body.data._id;
      await request(app.getHttpServer())
        .delete(`/forms/${formId}`)
        .set('Authorization', ownerToken)
        .expect(200);

      const formInDb = await connection.model('FormTemplate').findById(formId);
      expect(formInDb).toBeNull();
    });
  });
});
