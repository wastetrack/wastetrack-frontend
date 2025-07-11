/**
 * ID Obfuscation Utilities
 *
 * This module provides functions to encode and decode IDs for URL protection.
 * Uses Base64 encoding with additional obfuscation to hide real IDs.
 */

const OBFUSCATION_KEY =
  process.env.NEXT_PUBLIC_OBFUSCATION_KEY || 'fallback-key';

/**
 * Encode an ID for URL use
 * @param id - The real ID to encode
 * @returns Encoded string
 */
export function encodeId(id: string): string {
  try {
    // Add timestamp and key for additional obfuscation
    const timestamp = Date.now().toString(36);
    const combined = `${id}|${timestamp}|${OBFUSCATION_KEY}`;
    return btoa(combined).replace(/[+/=]/g, (match) => {
      switch (match) {
        case '+':
          return '-';
        case '/':
          return '_';
        case '=':
          return '';
        default:
          return match;
      }
    });
  } catch (error) {
    console.error('Error encoding ID:', error);
    return id;
  }
}

/**
 * Decode an ID from URL
 * @param encodedId - The encoded ID from URL
 * @returns Real ID or null if invalid
 */
export function decodeId(encodedId: string): string | null {
  try {
    // Restore Base64 padding and characters
    let base64 = encodedId.replace(/[-_]/g, (match) => {
      switch (match) {
        case '-':
          return '+';
        case '_':
          return '/';
        default:
          return match;
      }
    });

    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    const decoded = atob(base64);
    const parts = decoded.split('|');

    // Validate format and key
    if (parts.length === 3 && parts[2] === OBFUSCATION_KEY) {
      return parts[0]; // Return the real ID
    }

    return null;
  } catch (error) {
    console.error('Error decoding ID:', error);
    return null;
  }
}

/**
 * Generate a hash-like ID for display purposes
 * @param id - The real ID
 * @returns Hash-like string
 */
export function generateHashId(id: string): string {
  try {
    // Create a hash-like appearance
    const hash = btoa(id + OBFUSCATION_KEY).slice(0, 8);
    return `#${hash.toLowerCase()}`;
  } catch (error) {
    console.error('Error generating hash ID:', error);
    return '#unknown';
  }
}
