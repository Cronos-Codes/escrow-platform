/**
 * @file Rate Limiter Utility
 * @description Rate limiting for credential linking operations
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if an operation is allowed
   * @param key Unique identifier for the rate limit (e.g., userId + operation type)
   * @returns true if allowed, false if rate limited
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new window
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining requests in current window
   */
  getRemaining(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get time until reset (in milliseconds)
   */
  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) {
      return 0;
    }
    return Math.max(0, entry.resetTime - Date.now());
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Create singleton instances for different operations
export const credentialLinkingLimiter = new RateLimiter(60000, 5); // 5 requests per minute
export const authAttemptLimiter = new RateLimiter(300000, 10); // 10 requests per 5 minutes


