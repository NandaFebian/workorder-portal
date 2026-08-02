import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Mounts interactive Swagger UI (OpenAPI 3) for the Work Order Portal API.
 *
 * Routes exposed once the app is running:
 *   - GET /api/docs        → Swagger UI (interactive, "online" docs page)
 *   - GET /api/docs-json   → raw OpenAPI JSON spec (import into Postman / SwaggerHub)
 *   - GET /api/docs-yaml   → raw OpenAPI YAML spec
 */
export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Work Order Portal API')
    .setDescription(
      [
        'Complete REST API documentation for the Work Order Portal.',
        '',
        '### Authentication',
        'Most endpoints require a **JWT Bearer token**. Obtain one via `POST /auth/login`',
        'or `POST /auth/register-company`, then click **Authorize** and paste the token',
        '(without the `Bearer ` prefix — Swagger adds it automatically).',
        '',
        '### Roles',
        'Access is role-based. Common roles: `admin_app`, `owner_company`, `manager_company`,',
        '`staff_company`, `unassigned_staff`, and `client`. Each endpoint lists the roles it allows.',
        '',
        '### Response envelope',
        'Successful responses are wrapped as `{ statusCode, message, data, meta? }`.',
        'Validation errors return `{ message, code: "VALIDATION_ERROR", errors: { field: [...] } }`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'Paste your JWT access token here.',
      },
      'access-token',
    )
    .addServer('http://localhost:3000', 'Local development')
    .addServer('/', 'Current host')
    // ─── Tag descriptions (order defines UI grouping order) ──────────────────
    .addTag('App', 'Health check / root endpoint')
    .addTag('Auth', 'Registration, login, logout and profile')
    .addTag('Users', 'Authenticated user profile management')
    .addTag('Companies (Internal)', 'Company management for owners/managers/admin')
    .addTag('Companies (Client)', 'Public company discovery for clients')
    .addTag('Invitations', 'Employee invitations lifecycle')
    .addTag('Memberships', 'Client memberships & membership codes')
    .addTag('Positions', 'Job positions (read) and administration')
    .addTag('Services (Internal)', 'Service catalog management for companies')
    .addTag('Services (Client)', 'Public service browsing for clients')
    .addTag('Service Pricing', 'Service price list management')
    .addTag('Service Requests (Client)', 'Requests submitted by clients')
    .addTag('Service Requests (Internal)', 'Request inbox & processing for companies')
    .addTag('Work Orders', 'Work order lifecycle for company users')
    .addTag('Work Orders (Staff)', 'Work order views for assigned staff')
    .addTag('Work Reports', 'Work report submission & approval')
    .addTag('Forms', 'Dynamic form templates & submissions')
    .addTag('Templates', 'Company-type & service templates')
    .addTag('Customer Pairing', 'Linking clients to external accounts')
    .addTag('FAQ', 'Company knowledge base & chatbot')
    .addTag('Notifications', 'Push notifications & FCM tokens')
    .addTag('Dashboard', 'Aggregated dashboard statistics')
    .addTag('Files', 'Image / file uploads')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Work Order Portal API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
    },
  });
}
