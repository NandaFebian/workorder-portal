import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationService } from 'src/fcm/notification.service';
import { FcmService } from 'src/fcm/fcm.service';

@Processor('notification')
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly fcmService: FcmService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`,
    );

    switch (job.name) {
      case 'sendFcmNotification': {
        const { userId, title, body, data } = job.data;
        if (!userId) {
          this.logger.warn('sendFcmNotification job received without userId');
          return;
        }

        try {
          await this.fcmService.sendFcmDirect(userId, title, body, data);
          this.logger.log(
            `Successfully processed sendFcmNotification for userId: ${userId}`,
          );
        } catch (error: any) {
          this.logger.error(
            `Failed to process sendFcmNotification for userId ${userId}: ${error.message}`,
          );
          throw error; // Let BullMQ retry
        }
        break;
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
