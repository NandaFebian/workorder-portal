import { randomBytes } from 'crypto';

/**
 * Generates a random alphanumeric code of the specified length.
 * Used to produce human-readable unique identifiers like SR-K7XM29AB or WO-A1B2C3D4.
 */
export function generateCode(length = 8): string {
  let result = '';
  while (result.length < length) {
    result += randomBytes(length)
      .toString('base64url')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }
  return result.slice(0, length);
}
