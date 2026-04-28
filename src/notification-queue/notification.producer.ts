import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationService } from 'src/fcm/notification.service';

@Injectable()
export class NotificationProducer {
  private readonly logger = new Logger(NotificationProducer.name);

  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Enqueue a job to mark a notification as read.
   * This is a fire-and-forget operation to avoid blocking the main thread.
   */
  async enqueueMarkAsRead(notificationId: string): Promise<void> {
    try {
      await this.notificationQueue.add(
        'markAsRead',
        { notificationId },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
        },
      );
      this.logger.debug(`Enqueued markAsRead job for notificationId: ${notificationId}`);
    } catch (error: any) {
      this.logger.error(`Failed to enqueue markAsRead job: ${error.message}. Using fallback.`);
      this.notificationService.markAsRead(notificationId).catch(console.error);
    }
  }
}
