import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationWorker } from './notification.worker';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          // BullMQ requires maxRetriesPerRequest to be null for correct behavior
          maxRetriesPerRequest: null,
          // Prevent application crash if Redis is unavailable
          retryStrategy: (times: number) => {
            console.warn(
              `[Redis] Connection failed (attempt ${times}). Retrying...`,
            );
            // Limit retries or delay
            return Math.min(times * 1000, 3000);
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [NotificationWorker],
})
export class NotificationQueueModule {}
