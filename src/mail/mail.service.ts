import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { OTP_TTL_MINUTES } from '../common/utils/otp.util';

type MailMode = 'resend' | 'smtp' | 'console';

/** Per-email wording; the layout/branding around it is shared. */
interface OtpEmailCopy {
  subject: string;
  heading: string;
  intro: string;
  textIntro: string;
  outro: string;
}

// Email palette, led by the app's primary brand colour (lightPrimary).
const PRIMARY = '#0978FE';
const TINT = '#EEF5FF'; // primary at ~6% — code block background
const TINT_BORDER = '#CFE2FF'; // primary at ~25% — code block border
const TEXT = '#101828';
const MUTED = '#667085';
const BG = '#F4F6F8';
const BORDER = '#E5E9F0';

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
    this.fromName = this.config.get<string>('MAIL_FROM_NAME') || 'Work Order';
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
    await this.sendOtp(to, otp, name, {
      subject: `${otp} adalah kode verifikasi Anda`,
      heading: 'Verifikasi email Anda',
      intro:
        'Gunakan kode verifikasi di bawah ini untuk menyelesaikan pendaftaran akun Anda.',
      textIntro: `Kode verifikasi Anda adalah ${otp}.`,
      outro: 'Jika Anda tidak meminta kode ini, abaikan saja email ini.',
    });
  }

  /**
   * Sends a password-reset OTP to the given email address.
   */
  async sendPasswordResetEmail(
    to: string,
    otp: string,
    name?: string,
  ): Promise<void> {
    await this.sendOtp(to, otp, name, {
      subject: `${otp} adalah kode reset password Anda`,
      heading: 'Reset password Anda',
      intro:
        'Gunakan kode di bawah ini untuk mengatur ulang password akun Anda.',
      textIntro: `Kode reset password Anda adalah ${otp}.`,
      outro:
        'Jika Anda tidak meminta reset password, abaikan saja email ini. Password Anda tidak akan berubah.',
    });
  }

  private async sendOtp(
    to: string,
    otp: string,
    name: string | undefined,
    copy: OtpEmailCopy,
  ): Promise<void> {
    const greeting = name ? `Halo ${name},` : 'Halo,';
    const subject = copy.subject;
    const text =
      `${greeting}\n\n` +
      `${copy.textIntro} Kode ini berlaku selama ${OTP_TTL_MINUTES} menit.\n\n` +
      `${copy.outro}`;
    const html = this.buildOtpHtml(otp, greeting, copy);

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

  /**
   * Table-based, fully inlined HTML — the only layout that renders reliably
   * across Gmail / Outlook / Apple Mail (no flexbox, grid, or external CSS).
   */
  private buildOtpHtml(
    otp: string,
    greeting: string,
    copy: OtpEmailCopy,
  ): string {
    const brand = this.fromName;
    const font =
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG};margin:0;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background-color:#ffffff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">
        <tr>
          <td style="height:4px;line-height:4px;font-size:0;background-color:${PRIMARY};">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:36px 36px 32px 36px;font-family:${font};">
            <p style="margin:0 0 28px 0;font-size:13px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:${PRIMARY};">${brand}</p>

            <h1 style="margin:0 0 14px 0;font-size:22px;line-height:1.35;font-weight:700;color:${TEXT};">${copy.heading}</h1>

            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:${TEXT};">${greeting}</p>
            <p style="margin:0 0 26px 0;font-size:15px;line-height:1.6;color:${MUTED};">${copy.intro}</p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${TINT};border:1px solid ${TINT_BORDER};border-radius:10px;">
              <tr>
                <td align="center" style="padding:22px 16px;">
                  <span style="display:inline-block;font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:32px;font-weight:700;line-height:1.2;letter-spacing:9px;text-indent:9px;color:${PRIMARY};">${otp}</span>
                </td>
              </tr>
            </table>

            <p style="margin:22px 0 0 0;font-size:14px;line-height:1.6;color:${MUTED};">Kode ini berlaku selama <strong style="color:${TEXT};">${OTP_TTL_MINUTES} menit</strong>. Jangan bagikan kode ini kepada siapa pun.</p>

            <div style="margin:28px 0 0 0;border-top:1px solid ${BORDER};"></div>

            <p style="margin:20px 0 0 0;font-size:13px;line-height:1.6;color:${MUTED};">${copy.outro}</p>
          </td>
        </tr>
      </table>

      <p style="margin:20px 0 0 0;font-family:${font};font-size:12px;color:${MUTED};">&copy; ${new Date().getFullYear()} ${brand}</p>
    </td>
  </tr>
</table>`.trim();
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
