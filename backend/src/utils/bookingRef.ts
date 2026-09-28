import crypto from 'crypto';

/**
 * Generates a unique, human-readable booking reference prefix with TF-
 * Example: TF-8F42K9
 */
export function generateBookingReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous 0, O, 1, I
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `TF-${code}`;
}
