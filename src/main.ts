// src/main.ts
import { setDefaultResultOrder } from 'dns';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './app-setup';

// Prefer IPv4 when resolving hostnames. Some networks can't reach Gmail's
// (and other providers') IPv6 addresses, which otherwise stalls SMTP sends
// ~10s per email before falling back to IPv4.
setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply shared configuration
  setupApp(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
