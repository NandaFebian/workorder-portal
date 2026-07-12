import * as crypto from 'crypto';

/** How long an OTP stays valid. Single source of truth. */
export const OTP_TTL_MINUTES = 5;
export const OTP_TTL_MS = OTP_TTL_MINUTES * 60 * 1000;

/**
 * Minimum gap between two OTP emails for the same address. Stops a resend
 * button from being used to spam someone's inbox.
 */
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_RESEND_COOLDOWN_MS = OTP_RESEND_COOLDOWN_SECONDS * 1000;

/**
 * Generates a cryptographically-random numeric OTP of the given length.
 * Defaults to a 6-digit code, zero-padded (e.g. "042571").
 */
export function generateOtp(length = 6): string {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, '0');
}

/**
 * Hashes an OTP for storage so the raw code is never persisted.
 * A fixed SHA-256 is sufficient here: OTPs are short-lived, attempt-limited,
 * and single-use.
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}
