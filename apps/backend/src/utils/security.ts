/**
 * Security utilities for the Escrow backend
 * Contains sanitization, validation, and security helper functions
 */

/**
 * Sanitize user-provided text to prevent XSS attacks
 * Strips all HTML tags and dangerous characters
 */
export function sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove script-related patterns
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // Encode special HTML characters
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

    // Trim whitespace
    return sanitized.trim();
}

/**
 * Sanitize an array of strings (e.g., evidence URLs)
 */
export function sanitizeArray(input: string[] | undefined): string[] {
    if (!input || !Array.isArray(input)) {
        return [];
    }
    return input.map(item => sanitizeText(item));
}

/**
 * Validate and normalize Ethereum address
 */
export function normalizeAddress(address: string): string {
    if (!address || typeof address !== 'string') {
        throw new Error('Invalid address');
    }
    return address.toLowerCase().trim();
}

/**
 * Check if two addresses are equal (case-insensitive)
 */
export function addressesMatch(address1: string | undefined, address2: string | undefined): boolean {
    if (!address1 || !address2) {
        return false;
    }
    return normalizeAddress(address1) === normalizeAddress(address2);
}

/**
 * Generate a unique idempotency key for an operation
 */
export function generateIdempotencyKey(
    userId: string,
    operation: string,
    resourceId: string
): string {
    return `${userId}_${operation}_${resourceId}_${Date.now()}`;
}

/**
 * Rate limit configuration interface
 */
export interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
}

/**
 * Default rate limits for escrow operations
 */
export const escrowRateLimits: Record<string, RateLimitConfig> = {
    createDeal: { maxAttempts: 10, windowMs: 3600000 },      // 10 per hour
    fundDeal: { maxAttempts: 20, windowMs: 3600000 },        // 20 per hour
    approveMilestone: { maxAttempts: 50, windowMs: 3600000 }, // 50 per hour
    releaseFunds: { maxAttempts: 20, windowMs: 3600000 },    // 20 per hour
    raiseDispute: { maxAttempts: 5, windowMs: 86400000 },    // 5 per day
    cancelDeal: { maxAttempts: 10, windowMs: 3600000 },      // 10 per hour
    getDeal: { maxAttempts: 100, windowMs: 60000 },          // 100 per minute
    getDeals: { maxAttempts: 50, windowMs: 60000 },          // 50 per minute
};
