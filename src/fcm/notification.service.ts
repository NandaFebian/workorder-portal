import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async markAsRead(notificationId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(notificationId)) {
        this.logger.warn(`Invalid notification ID: ${notificationId}`);
        return;
      }

      await this.notificationModel.updateOne(
        { _id: new Types.ObjectId(notificationId) },
        { 
          $set: { 
            isRead: true,
            readAt: new Date()
          } 
        }
      ).exec();
      
      this.logger.log(`Notification ${notificationId} marked as read`);
    } catch (error: any) {
      this.logger.error(`Error marking notification as read: ${error.message}`);
      throw error;
    }
  }
}
