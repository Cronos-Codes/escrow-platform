import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 5, // Max 5 OTPs per hour
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
};

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export const checkRateLimit = async (identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
  const now = Date.now();
  const docRef = db.collection('rateLimits').doc(identifier);
  
  try {
    const doc = await docRef.get();
    
    if (!doc.exists) {
      // First request, create record
      const record: RateLimitRecord = {
        count: 1,
        resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      };
      
      await docRef.set(record);
      
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
        resetTime: record.resetTime,
      };
    }
    
    const data = doc.data() as RateLimitRecord;
    
    // Check if window has expired
    if (now > data.resetTime) {
      // Reset window
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      };
      
      await docRef.set(newRecord);
      
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
        resetTime: newRecord.resetTime,
      };
    }
    
    // Check if limit exceeded
    if (data.count >= RATE_LIMIT_CONFIG.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.resetTime,
      };
    }
    
    // Increment count
    const updatedRecord: RateLimitRecord = {
      count: data.count + 1,
      resetTime: data.resetTime,
    };
    
    await docRef.set(updatedRecord);
    
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - updatedRecord.count,
      resetTime: updatedRecord.resetTime,
    };
    
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow request if rate limiting fails
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    };
  }
};

export const clearRateLimit = async (identifier: string): Promise<void> => {
  try {
    await db.collection('rateLimits').doc(identifier).delete();
  } catch (error) {
    console.error('Failed to clear rate limit:', error);
  }
}; 