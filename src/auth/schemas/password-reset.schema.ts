import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PasswordResetDocument = PasswordReset & Document;

/**
 * A pending "forgot password" request: holds the hashed OTP emailed to the
 * user. Consumed by /auth/reset-password, which sets the new password.
 *
 * One record per email (upserted), auto-removed by a TTL index after the OTP
 * expires so abandoned requests do not accumulate. The raw OTP is never stored.
 */
@Schema({ timestamps: true, versionKey: false })
export class PasswordReset {
  @Prop({ required: true, lowercase: true, trim: true, unique: true })
  email: string;

  @Prop({ required: true })
  otpHash: string;

  @Prop({ required: true })
  otpExpiresAt: Date;

  /** When the current OTP was emailed — drives the resend cooldown. */
  @Prop({ type: Date, default: null })
  lastOtpSentAt: Date | null;

  @Prop({ default: 0 })
  attempts: number;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);

// Auto-delete 10 minutes after the OTP expires (grace window for nicer errors).
PasswordResetSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 600 });
