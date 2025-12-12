import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';
import { AuthGuard } from '../src/auth/guards/auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';

describe('Global Exception Handling (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication();
        setupApp(app);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return 400 (not 500) for invalid ObjectId', () => {
        const invalidId = '68fa31cdc122d79a11504fb'; // 23 chars
        return request(app.getHttpServer())
            .get(`/forms/${invalidId}`)
            .expect(400)
            .expect((res) => {
                expect(res.body).toEqual(expect.objectContaining({
                    code: expect.any(String),
                    message: expect.any(String) // 'Invalid ID format' or similar
                }));
            });
    });
});
