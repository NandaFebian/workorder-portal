import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
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
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
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
    data?: { [key: string]: string },
  ): Promise<void> {
    try {
      if (!admin.apps.length) {
        this.logger.warn('Firebase app not initialized. Cannot send notification.');
        return;
      }

      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token,
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
    data?: { [key: string]: string },
  ): Promise<void> {
    try {
      if (!admin.apps.length) {
        this.logger.warn('Firebase app not initialized. Cannot send notifications.');
        return;
      }

      if (!tokens || tokens.length === 0) {
        return;
      }

      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
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
    data?: { [key: string]: string },
  ): Promise<void> {
    try {
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
}
