import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PendingRegistrationDocument = PendingRegistration & Document;

/**
 * Holds a registration that has been submitted but not yet verified by email
 * OTP. The real User (and Company, for owner signups) is only created once the
 * OTP is verified. Documents are auto-removed by a TTL index after the OTP
 * expires, so abandoned registrations do not accumulate.
 *
 * The password is stored **encrypted** (reversible, via crypto.util) — not the
 * final bcrypt hash — because the User model hashes the password itself on
 * creation. We never store the raw password.
 */
@Schema({ timestamps: true, versionKey: false })
export class PendingRegistration {
  @Prop({ required: true, lowercase: true, trim: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string; // encrypted

  @Prop({ required: true, enum: ['user', 'company'] })
  type: string;

  @Prop({ type: String, default: null })
  role: string | null; // used when type === 'user'

  @Prop({ type: String, default: null })
  companyName: string | null; // used when type === 'company'

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

export const PendingRegistrationSchema =
  SchemaFactory.createForClass(PendingRegistration);

// Auto-delete 10 minutes after the OTP expires (grace window for nicer errors).
PendingRegistrationSchema.index(
  { otpExpiresAt: 1 },
  { expireAfterSeconds: 600 },
);
