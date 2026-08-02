// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './app-setup';
import { setupSwagger } from './swagger-setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply shared configuration
  setupApp(app);

  // Mount interactive Swagger UI at /api/docs
  setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
