/**
 * Challenge code generation and validation
 * Generates unique, shareable challenge codes for daily puzzles
 */

/**
 * Generate a unique challenge code
 * Format: 6 uppercase alphanumeric characters (e.g., "ABC123")
 */
export function generateChallengeCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Validate challenge code format
 */
export function isValidChallengeCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Create shareable challenge URL
 */
export function createChallengeUrl(code: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/challenge/${code}`;
}

/**
 * Extract challenge code from URL
 */
export function extractChallengeCodeFromUrl(url: string): string | null {
  const match = url.match(/\/challenge\/([A-Z0-9]{6})/);
  return match ? match[1] : null;
}

/**
 * Check if challenge is expired
 */
export function isChallengeExpired(expiresAt: string | Date | null): boolean {
  if (!expiresAt) {
    return false; // No expiration
  }
  
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiry < new Date();
}

/**
 * Get default challenge expiration (24 hours from now)
 */
export function getDefaultChallengeExpiration(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

