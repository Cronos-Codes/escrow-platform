import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export class RateLimiter {
  private db: FirebaseFirestore.Firestore;
  private collection: string;

  constructor() {
    this.db = getFirestore();
    this.collection = 'rateLimits';
  }

  async isRateLimited(
    identifier: string,
    action: string,
    config: RateLimitConfig
  ): Promise<boolean> {
    const docRef = this.db.collection(this.collection).doc(`${action}_${identifier}`);

    try {
      const now = Date.now();
      const windowStart = now - config.windowMs;

      const result = await this.db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        const data = doc.data();

        if (!doc.exists || !data) {
          // First attempt
          transaction.set(docRef, {
            attempts: 1,
            firstAttempt: now,
            lastAttempt: now,
          });
          return false;
        }

        // Reset if outside window
        if (data.firstAttempt < windowStart) {
          transaction.set(docRef, {
            attempts: 1,
            firstAttempt: now,
            lastAttempt: now,
          });
          return false;
        }

        // Check if over limit
        if (data.attempts >= config.maxAttempts) {
          return true;
        }

        // Increment attempts
        transaction.update(docRef, {
          attempts: admin.firestore.FieldValue.increment(1),
          lastAttempt: now,
        });

        return false;
      });

      return result;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail closed for security - prefer temporary denial over potential abuse
      // This ensures rate limiting cannot be bypassed during system issues
      return true;
    }
  }

  async clearRateLimit(identifier: string, action: string): Promise<void> {
    const docRef = this.db.collection(this.collection).doc(`${action}_${identifier}`);
    await docRef.delete();
  }
}

// Rate limit configurations
export const rateLimitConfigs = {
  phoneOtp: {
    maxAttempts: 5,
    windowMs: 3600000, // 1 hour
  },
  emailOtp: {
    maxAttempts: 5,
    windowMs: 3600000, // 1 hour
  },
  walletLogin: {
    maxAttempts: 10,
    windowMs: 3600000, // 1 hour
  },
} as const;

// Singleton instance
export const rateLimiter = new RateLimiter();
