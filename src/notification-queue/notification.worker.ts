import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationService } from 'src/fcm/notification.service';

@Processor('notification')
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<{ notificationId: string }, any, string>): Promise<any> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`);

    switch (job.name) {
      case 'markAsRead': {
        const { notificationId } = job.data;
        if (!notificationId) {
          this.logger.warn('markAsRead job received without notificationId');
          return;
        }

        try {
          await this.notificationService.markAsRead(notificationId);
          this.logger.log(`Successfully processed markAsRead for notificationId: ${notificationId}`);
        } catch (error: any) {
          this.logger.error(`Failed to process markAsRead for notificationId ${notificationId}: ${error.message}`);
          throw error; // Let BullMQ retry based on configuration
        }
        break;
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
