import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

type MailMode = 'resend' | 'smtp' | 'console';

/**
 * Sends transactional email (currently just registration OTPs).
 *
 * Transport is chosen from env, in priority order:
 *   1. RESEND_API_KEY set -> Resend HTTP API (POST over port 443). Preferred on
 *      hosts like Railway that block outbound SMTP ports (25/465/587).
 *   2. SMTP_HOST set      -> nodemailer SMTP (works locally / where SMTP is open).
 *   3. neither            -> "dev" mode: the OTP is logged to the console
 *      instead of being sent, so the flow is testable without any provider.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly mode: MailMode;
  private readonly from: string;
  private readonly fromName: string;
  private readonly resendApiKey?: string;
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>('MAIL_FROM') || 'onboarding@resend.dev';
    this.fromName =
      this.config.get<string>('MAIL_FROM_NAME') || 'Work Order Portal';
    this.resendApiKey = this.config.get<string>('RESEND_API_KEY') || undefined;
    const smtpHost = this.config.get<string>('SMTP_HOST');

    if (this.resendApiKey) {
      this.mode = 'resend';
      this.logger.log('Mail transport: Resend HTTP API');
    } else if (smtpHost) {
      this.mode = 'smtp';
      const user = this.config.get<string>('SMTP_USER');
      const secure =
        String(this.config.get<string>('SMTP_SECURE') ?? 'false') === 'true';
      const options: SMTPTransport.Options = {
        host: smtpHost,
        port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
        secure,
        auth: user
          ? { user, pass: this.config.get<string>('SMTP_PASS') }
          : undefined,
        // Fail fast instead of hanging if the SMTP server is unreachable.
        // IPv4 is preferred process-wide via setDefaultResultOrder in main.ts.
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      };
      this.transporter = nodemailer.createTransport(options);
      this.logger.log(`Mail transport: SMTP (${smtpHost})`);
    } else {
      this.mode = 'console';
      this.logger.warn(
        'No mail transport configured (RESEND_API_KEY / SMTP_HOST missing) — OTP emails will be logged to the console instead of being sent.',
      );
    }
  }

  /**
   * Sends a registration OTP to the given email address.
   */
  async sendOtpEmail(to: string, otp: string, name?: string): Promise<void> {
    const { subject, text, html } = this.buildOtpMessage(otp, name);

    if (this.mode === 'console') {
      this.logger.log(`[DEV] OTP for ${to}: ${otp}`);
      return;
    }

    if (this.mode === 'resend') {
      await this.sendViaResend(to, subject, text, html);
      return;
    }

    await this.sendViaSmtp(to, subject, text, html);
  }

  private buildOtpMessage(otp: string, name?: string) {
    const greeting = name ? `Hi ${name},` : 'Hi,';
    return {
      subject: 'Your verification code',
      text:
        `${greeting}\n\n` +
        `Your verification code is ${otp}. It will expire in 10 minutes.\n\n` +
        `If you did not request this, you can safely ignore this email.`,
      html:
        `<p>${greeting}</p>` +
        `<p>Your verification code is:</p>` +
        `<p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${otp}</p>` +
        `<p>It will expire in 10 minutes.</p>` +
        `<p style="color:#888;">If you did not request this, you can safely ignore this email.</p>`,
    };
  }

  private async sendViaResend(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: `${this.fromName} <${this.from}>`,
          to: [to],
          subject,
          html,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${this.resendApiKey as string}`,
            'content-type': 'application/json',
          },
          timeout: 15_000,
        },
      );
    } catch (err: unknown) {
      const detail = axios.isAxiosError(err)
        ? JSON.stringify(err.response?.data ?? err.message)
        : err instanceof Error
          ? err.message
          : String(err);
      this.logger.error(
        `Failed to send OTP email to ${to} via Resend: ${detail}`,
      );
      throw new ServiceUnavailableException(
        'Failed to send the verification email. Please try again later.',
      );
    }
  }

  private async sendViaSmtp(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    try {
      await this.transporter!.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html,
      });
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to send OTP email to ${to} via SMTP: ${detail}`,
      );
      throw new ServiceUnavailableException(
        'Failed to send the verification email. Please try again later.',
      );
    }
  }
}
