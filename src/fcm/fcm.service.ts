import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as admin from 'firebase-admin';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.warn('Firebase credentials are not set. FCM will not work.');
        return;
      }

      if (!admin.apps.length) {
        // More robust private key cleaning
        const cleanPrivateKey = privateKey.startsWith('"') && privateKey.endsWith('"')
          ? privateKey.substring(1, privateKey.length - 1).replace(/\\n/g, '\n')
          : privateKey.replace(/\\n/g, '\n');

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: cleanPrivateKey,
          }),
        });
        this.logger.log('Firebase Admin SDK initialized successfully.');
      }
    } catch (error: any) {
      this.logger.error('Error initializing Firebase Admin SDK', error.stack);
    }
  }

  /**
   * Send a notification to a single device
   */
  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      if (!admin.apps.length) {
        this.logger.warn('Firebase app not initialized. Cannot send notification.');
        return;
      }

      // Ensure all data values are strings (FCM requirement)
      const sanitizedData = this.toFcmData(data || {});

      // Add title and body to data payload
      sanitizedData.title = String(title || '');
      sanitizedData.body = String(body || '');

      // Ensure resource and resourceId are present in data payload
      sanitizedData.resource = String(data?.resource || '');
      sanitizedData.resourceId = String(data?.resourceId || '');

      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data: sanitizedData,
        token: token.trim(),
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent message to device: ${response}`);
    } catch (error: any) {
      this.logger.error(`Error sending message to device: ${error.message}`);
      this.handleInvalidTokens(error, [token]);
    }
  }

  /**
   * Send a notification to multiple devices (Multicast)
   */
  async sendToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      if (!admin.apps.length) {
        this.logger.warn('Firebase app not initialized. Cannot send notifications.');
        return;
      }

      // Filter out empty or invalid tokens
      const validTokens = tokens.filter(t => t && typeof t === 'string' && t.trim() !== '');
      if (validTokens.length === 0) {
        return;
      }

      // Ensure all data values are strings
      const sanitizedData = this.toFcmData(data || {});

      // Add title and body to data payload
      sanitizedData.title = String(title || '');
      sanitizedData.body = String(body || '');

      // Ensure resource and resourceId are present in data payload
      sanitizedData.resource = String(data?.resource || '');
      sanitizedData.resourceId = String(data?.resourceId || '');

      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: sanitizedData,
        tokens: validTokens.map(t => t.trim()),
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Successfully sent ${response.successCount} messages. Failed: ${response.failureCount}`,
      );

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        this.handleInvalidTokens(response, failedTokens);
      }
    } catch (error: any) {
      this.logger.error(`Error sending message to multiple devices: ${error.message}`);
    }
  }

  /**
   * Register a new FCM token for a user
   */
  async registerToken(userId: string, token: string): Promise<void> {
    try {
      await this.userModel.updateOne(
        { _id: userId },
        { $addToSet: { fcmTokens: token } },
      );
      this.logger.log(`Registered FCM token for user ${userId}`);
    } catch (error: any) {
      this.logger.error(`Error registering FCM token: ${error.message}`);
    }
  }

  /**
   * Remove an FCM token from all user profiles
   */
  async removeToken(token: string): Promise<void> {
    try {
      await this.userModel.updateMany(
        { fcmTokens: token },
        { $pull: { fcmTokens: token } },
      );
      this.logger.log(`Removed FCM token: ${token}`);
    } catch (error: any) {
      this.logger.error(`Error removing FCM token: ${error.message}`);
    }
  }

  /**
   * Send a notification to all devices of a user
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      // Persist to inbox
      await this.saveNotification(userId, title, body, data);

      const user = await this.userModel.findById(userId).select('fcmTokens').exec();
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        this.logger.debug(`No FCM tokens found for user ${userId}`);
        return;
      }

      await this.sendToMultipleDevices(user.fcmTokens, title, body, data);
    } catch (error: any) {
      this.logger.error(`Error sending notification to user ${userId}: ${error.message}`);
    }
  }

  /**
   * Save a notification to the database for the user's inbox
   */
  private async saveNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      // Ensure resource and resourceId are present in the data object
      const notificationData = {
        ...(data || {}),
        resource: data?.resource || '',
        resourceId: data?.resourceId || '',
      };

      await this.notificationModel.create({
        userId,
        title,
        body,
        data: notificationData,
        isRead: false,
      });
    } catch (error: any) {
      this.logger.error(`Error saving notification to database: ${error.message}`);
    }
  }

  async getInbox(userId: string): Promise<NotificationDocument[]> {
    const notifications = await this.notificationModel
      .find({ userId })
      .select('-__v -updatedAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return notifications;
  }

  /**
   * Mark notifications as read based on resource and resourceId
   */
  async markAsReadByResource(
    userId: string,
    resource: string,
    resourceId: string,
  ): Promise<void> {
    try {
      await this.notificationModel
        .updateMany(
          {
            userId: new Types.ObjectId(userId),
            'data.resource': resource,
            'data.resourceId': resourceId,
            isRead: false,
          },
          { $set: { isRead: true } },
        )
        .exec();
    } catch (error: any) {
      this.logger.error(`Error marking notifications as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications of a certain resource type as read
   */
  async markAsReadByType(userId: string, resource: string): Promise<void> {
    try {
      await this.notificationModel
        .updateMany(
          {
            userId: new Types.ObjectId(userId),
            'data.resource': resource,
            isRead: false,
          },
          { $set: { isRead: true } },
        )
        .exec();
    } catch (error: any) {
      this.logger.error(
        `Error marking notifications type as read: ${error.message}`,
      );
    }
  }

  /**
   * Handle invalid or expired tokens by removing them from the database
   */
  private async handleInvalidTokens(response: any, failedTokens?: string[]) {
    if (failedTokens && failedTokens.length > 0) {
      this.logger.warn(`Found invalid FCM tokens. Removing from database: ${failedTokens.join(', ')}`);
      try {
        await this.userModel.updateMany(
          { fcmTokens: { $in: failedTokens } },
          { $pull: { fcmTokens: { $in: failedTokens } } },
        );
      } catch (error: any) {
        this.logger.error(`Error cleaning up invalid tokens: ${error.message}`);
      }
    }
  }

  /**
   * Convert an object to FCM-compatible data (all values as strings)
   */
  private toFcmData(obj: Record<string, any>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        v !== null && v !== undefined ? String(v) : '',
      ]),
    );
  }
}
