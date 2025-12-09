import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/app-setup';

describe('Error Format (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        setupApp(app); // Ensure global pipes and filters are applied
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return standardized 404 error', () => {
        return request(app.getHttpServer())
            .get('/non-existent-route')
            .expect(404)
            .expect((res) => {
                expect(res.body).toEqual(expect.objectContaining({
                    message: expect.any(String),
                    code: expect.stringMatching(/^HTTP_404$/),
                }));
                // errors should be undefined or not present for generic 404 if not thrown with details
            });
    });

    // Depending on if there is a public post endpoint without auth that has validation
    // We might need to mock or find one.
    // Assuming there is some DTO validation we can trigger.
    // Using a hypothetical endpoint or existing one if possible. 
    // Since authentication is likely globally handled or per endpoint, hitting a protected endpoint without auth should give 401.

    it('should return standardized 401 error', () => {
        return request(app.getHttpServer())
            .get('/memberships') // Assuming this is protected
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual(expect.objectContaining({
                    message: expect.any(String),
                    code: 'HTTP_401'
                }));
            });
    });
});
