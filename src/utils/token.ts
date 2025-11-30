import crypto from 'crypto';

export class TokenGenerator {
  /**
   * Generate random token untuk email verification
   * @param length Panjang token (default: 32)
   * @returns Token string (hex)
   */
  static generateVerificationToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate token expiry time
   * @param hours Berapa jam token valid (default: 24 jam)
   * @returns Date object untuk expiresAt
   */
  static generateTokenExpiry(hours: number = 24): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry;
  }

  /**
   * Cek apakah token sudah expired
   * @param expiresAt Tanggal expired dari database
   * @returns true jika sudah expired
   */
  static isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}