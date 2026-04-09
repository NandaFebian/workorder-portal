import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor() {
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
   * Handle invalid or expired tokens
   */
  private handleInvalidTokens(response: any, failedTokens?: string[]) {
    // Optional placeholder
    // Implementation to remove unregistered or invalid tokens from database
    if (failedTokens && failedTokens.length > 0) {
      this.logger.debug(`Invalid tokens to handle: ${failedTokens.join(', ')}`);
      // TODO: Remove these failed tokens from the corresponding user profiles or token tables.
    }
  }
}
