import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Thin wrapper around nodemailer.
 *
 * Configured entirely from environment variables (see .env.example). When
 * SMTP_HOST is not set, the service runs in "dev" mode: instead of sending a
 * real email it logs the message to the console. This keeps the registration
 * flow fully testable locally without SMTP credentials.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    this.from =
      this.config.get<string>('MAIL_FROM') || 'no-reply@workorder.local';

    if (host) {
      const user = this.config.get<string>('SMTP_USER');
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
        secure: String(this.config.get<string>('SMTP_SECURE') ?? 'false') === 'true',
        auth: user
          ? { user, pass: this.config.get<string>('SMTP_PASS') }
          : undefined,
        // Fail fast instead of hanging the HTTP request forever if the SMTP
        // server is unreachable (blocked port, network issue, bad TLS).
        // (IPv4 is preferred globally via setDefaultResultOrder in main.ts.)
        connectionTimeout: 10_000, // time to establish the TCP connection
        greetingTimeout: 10_000, // time to receive the SMTP greeting
        socketTimeout: 15_000, // inactivity timeout on the socket
      });
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP_HOST is not configured — OTP emails will be logged to the console instead of being sent.',
      );
    }
  }

  /**
   * Sends a registration OTP to the given email address.
   */
  async sendOtpEmail(to: string, otp: string, name?: string): Promise<void> {
    const subject = 'Your verification code';
    const greeting = name ? `Hi ${name},` : 'Hi,';
    const text =
      `${greeting}\n\n` +
      `Your verification code is ${otp}. It will expire in 10 minutes.\n\n` +
      `If you did not request this, you can safely ignore this email.`;
    const html =
      `<p>${greeting}</p>` +
      `<p>Your verification code is:</p>` +
      `<p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${otp}</p>` +
      `<p>It will expire in 10 minutes.</p>` +
      `<p style="color:#888;">If you did not request this, you can safely ignore this email.</p>`;

    if (!this.transporter) {
      this.logger.log(`[DEV] OTP for ${to}: ${otp}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text, html });
    } catch (err: any) {
      this.logger.error(
        `Failed to send OTP email to ${to}: ${err?.message ?? err}`,
      );
      throw new ServiceUnavailableException(
        'Failed to send the verification email. Please try again later.',
      );
    }
  }
}
