import * as functions from 'firebase-functions';
import { auth } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
import { phoneOtpSchema, emailOtpSchema } from '@escrow/schemas';
import { rateLimiter, rateLimitConfigs } from './utils/rateLimiter';
import { logger } from './utils/logger';
import { authMonitor } from './utils/monitoring';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();

// OTP hashing utility - uses SHA256 for fast, secure hashing
function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function verifyOtpHash(otp: string, hash: string): boolean {
  return hashOtp(otp) === hash;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

const createResponse = <T>(success: boolean, data?: T, error?: string): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

export const loginPhone = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  try {
    // Validate input
    const validation = phoneOtpSchema.pick({ phoneNumber: true }).safeParse(data);
    if (!validation.success) {
      await Promise.all([
        logger.logAuthEvent('loginPhone', 'error', {
          error: new Error('Invalid phone number format'),
          phoneNumber: data?.phoneNumber,
        }),
        authMonitor.recordAuthAttempt({
          method: 'phone',
          status: 'failure',
          reason: 'Invalid phone number format',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid phone number format');
    }

    const { phoneNumber } = validation.data;

    // Check rate limiting
    const isLimited = await rateLimiter.isRateLimited(
      phoneNumber,
      'phoneOtp',
      rateLimitConfigs.phoneOtp
    );

    if (isLimited) {
      await Promise.all([
        logger.logAuthEvent('loginPhone', 'error', {
          error: new Error('Rate limit exceeded'),
          phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
        }),
        authMonitor.recordRateLimit({
          action: 'phoneOtp',
          identifier: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
          exceeded: true,
          timestamp: Date.now(),
        }),
        authMonitor.recordAuthAttempt({
          method: 'phone',
          status: 'failure',
          reason: 'Rate limit exceeded',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Too many attempts. Please try again later.');
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Firestore with hash and expiry
    const otpDocRef = db.collection('otpTokens').doc(`phone_${phoneNumber.replace(/[^0-9]/g, '')}`);
    await otpDocRef.set({
      otpHash: hashOtp(otpCode),
      expiresAt: Date.now() + 600000, // 10 minutes
      attempts: 0,
      maxAttempts: 3,
      createdAt: Date.now(),
    });

    // TODO: Integrate with SMS provider (Twilio, etc.)
    // For now, log the OTP in development only (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV ONLY] OTP for ${phoneNumber}: ${otpCode}`);
    }

    const responseTime = Date.now() - startTime;
    await Promise.all([
      logger.logAuthEvent('loginPhone', 'success', {
        phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
        responseTime,
      }),
      authMonitor.recordAuthAttempt({
        method: 'phone',
        status: 'success',
        responseTime,
        timestamp: Date.now(),
      }),
    ]);

    return createResponse(true, {
      message: 'OTP sent successfully',
      phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    await Promise.all([
      logger.logAuthEvent('loginPhone', 'error', {
        error: error instanceof Error ? error : new Error('Unknown error'),
        responseTime,
      }),
      authMonitor.recordAuthAttempt({
        method: 'phone',
        status: 'failure',
        reason: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        timestamp: Date.now(),
      }),
    ]);
    return createResponse(false, undefined, 'Failed to send OTP');
  }
});

export const verifyPhoneOtp = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();

  try {
    // Validate input
    const validation = phoneOtpSchema.safeParse(data);
    if (!validation.success) {
      await Promise.all([
        logger.logAuthEvent('verifyPhoneOtp', 'error', {
          error: new Error('Invalid input format'),
          phoneNumber: data?.phoneNumber,
        }),
        authMonitor.recordAuthAttempt({
          method: 'phone',
          status: 'failure',
          reason: 'Invalid input format',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid input format');
    }

    const { phoneNumber, otpCode } = validation.data;

    // Check rate limiting
    const isLimited = await rateLimiter.isRateLimited(
      phoneNumber,
      'phoneOtp',
      rateLimitConfigs.phoneOtp
    );

    if (isLimited) {
      await Promise.all([
        logger.logAuthEvent('verifyPhoneOtp', 'error', {
          error: new Error('Rate limit exceeded'),
          phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
        }),
        authMonitor.recordRateLimit({
          action: 'phoneOtp',
          identifier: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
          exceeded: true,
          timestamp: Date.now(),
        }),
        authMonitor.recordAuthAttempt({
          method: 'phone',
          status: 'failure',
          reason: 'Rate limit exceeded',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Too many attempts. Please try again later.');
    }

    // Verify OTP format first
    if (!/^\d{6}$/.test(otpCode)) {
      await Promise.all([
        logger.logAuthEvent('verifyPhoneOtp', 'error', {
          error: new Error('Invalid OTP format'),
          phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
        }),
        authMonitor.recordAuthAttempt({
          method: 'phone',
          status: 'failure',
          reason: 'Invalid OTP format',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid OTP format');
    }

    // Retrieve and verify stored OTP
    const otpDocRef = db.collection('otpTokens').doc(`phone_${phoneNumber.replace(/[^0-9]/g, '')}`);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      await logger.logAuthEvent('verifyPhoneOtp', 'error', {
        error: new Error('OTP not found'),
        phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
      });
      return createResponse(false, undefined, 'OTP not found. Please request a new code.');
    }

    const otpData = otpDoc.data()!;

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      await otpDocRef.delete();
      await logger.logAuthEvent('verifyPhoneOtp', 'error', {
        error: new Error('OTP expired'),
        phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
      });
      return createResponse(false, undefined, 'OTP expired. Please request a new code.');
    }

    // Check attempt count
    if (otpData.attempts >= otpData.maxAttempts) {
      await otpDocRef.delete();
      await logger.logAuthEvent('verifyPhoneOtp', 'error', {
        error: new Error('Max OTP attempts exceeded'),
        phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
      });
      return createResponse(false, undefined, 'Maximum attempts exceeded. Please request a new code.');
    }

    // Verify OTP hash
    if (!verifyOtpHash(otpCode, otpData.otpHash)) {
      // Increment attempt counter
      await otpDocRef.update({
        attempts: otpData.attempts + 1,
      });
      await Promise.all([
        logger.logAuthEvent('verifyPhoneOtp', 'error', {
          error: new Error('Invalid OTP'),
          phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
          attemptsRemaining: otpData.maxAttempts - otpData.attempts - 1,
        }),
        authMonitor.recordAuthAttempt({
          method: 'phone',
          status: 'failure',
          reason: 'Invalid OTP',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid OTP. Please try again.');
    }

    // OTP verified - delete token to prevent reuse
    await otpDocRef.delete();

    // Create user if not exists
    let user = await auth().getUserByPhoneNumber(phoneNumber).catch(() => null);

    if (!user) {
      user = await auth().createUser({
        phoneNumber,
        displayName: `User_${Date.now()}`,
      });
    }

    // Generate custom token with role information
    const token = await auth().createCustomToken(user.uid, {
      phoneNumber,
      role: 'user', // Default role, can be updated through KYC
      kycStatus: 'pending'
    });

    const responseTime = Date.now() - startTime;
    await Promise.all([
      logger.logAuthEvent('verifyPhoneOtp', 'success', {
        userId: user.uid,
        phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3'),
        responseTime,
      }),
      authMonitor.recordAuthAttempt({
        method: 'phone',
        status: 'success',
        responseTime,
        timestamp: Date.now(),
      }),
      // Clear rate limit after successful verification
      rateLimiter.clearRateLimit(phoneNumber, 'phoneOtp'),
    ]);

    return createResponse(true, {
      token,
      user: {
        id: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        role: 'user',
        kycStatus: 'pending',
        createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now(),
        updatedAt: Date.now(),
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logger.logAuthEvent('verifyPhoneOtp', 'error', {
      error: error instanceof Error ? error : new Error('Unknown error'),
      responseTime,
    });

    return createResponse(false, undefined, 'Failed to verify OTP');
  }
});

export const loginEmail = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();

  try {
    // Validate input
    const validation = emailOtpSchema.pick({ email: true }).safeParse(data);
    if (!validation.success) {
      await Promise.all([
        logger.logAuthEvent('loginEmail', 'error', {
          error: new Error('Invalid email format'),
          email: data?.email,
        }),
        authMonitor.recordAuthAttempt({
          method: 'email',
          status: 'failure',
          reason: 'Invalid email format',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid email format');
    }

    const { email } = validation.data;

    // Check rate limiting
    const isLimited = await rateLimiter.isRateLimited(
      email,
      'emailOtp',
      rateLimitConfigs.emailOtp
    );

    if (isLimited) {
      await Promise.all([
        logger.logAuthEvent('loginEmail', 'error', {
          error: new Error('Rate limit exceeded'),
          email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        }),
        authMonitor.recordRateLimit({
          action: 'emailOtp',
          identifier: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          exceeded: true,
          timestamp: Date.now(),
        }),
        authMonitor.recordAuthAttempt({
          method: 'email',
          status: 'failure',
          reason: 'Rate limit exceeded',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Too many attempts. Please try again later.');
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Firestore with hash and expiry
    const otpDocRef = db.collection('otpTokens').doc(`email_${email.replace(/[^a-zA-Z0-9]/g, '_')}`);
    await otpDocRef.set({
      otpHash: hashOtp(otpCode),
      expiresAt: Date.now() + 600000, // 10 minutes
      attempts: 0,
      maxAttempts: 3,
      createdAt: Date.now(),
    });

    // TODO: Integrate with email service provider (SendGrid, SES, etc.)
    // For now, log the OTP in development only (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV ONLY] OTP for ${email}: ${otpCode}`);
    }

    const responseTime = Date.now() - startTime;
    await Promise.all([
      logger.logAuthEvent('loginEmail', 'success', {
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        responseTime,
      }),
      authMonitor.recordAuthAttempt({
        method: 'email',
        status: 'success',
        responseTime,
        timestamp: Date.now(),
      }),
    ]);

    return createResponse(true, {
      message: 'Email OTP sent successfully',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logger.logAuthEvent('loginEmail', 'error', {
      error: error instanceof Error ? error : new Error('Unknown error'),
      responseTime,
    });

    return createResponse(false, undefined, 'Failed to send email OTP');
  }
});

export const verifyEmailOtp = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();

  try {
    // Validate input
    const validation = emailOtpSchema.safeParse(data);
    if (!validation.success) {
      await Promise.all([
        logger.logAuthEvent('verifyEmailOtp', 'error', {
          error: new Error('Invalid input format'),
          email: data?.email,
        }),
        authMonitor.recordAuthAttempt({
          method: 'email',
          status: 'failure',
          reason: 'Invalid input format',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid input format');
    }

    const { email, otpCode } = validation.data;

    // Check rate limiting
    const isLimited = await rateLimiter.isRateLimited(
      email,
      'emailOtp',
      rateLimitConfigs.emailOtp
    );

    if (isLimited) {
      await Promise.all([
        logger.logAuthEvent('verifyEmailOtp', 'error', {
          error: new Error('Rate limit exceeded'),
          email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        }),
        authMonitor.recordRateLimit({
          action: 'emailOtp',
          identifier: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          exceeded: true,
          timestamp: Date.now(),
        }),
        authMonitor.recordAuthAttempt({
          method: 'email',
          status: 'failure',
          reason: 'Rate limit exceeded',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Too many attempts. Please try again later.');
    }

    // Verify OTP format
    if (!/^\d{6}$/.test(otpCode)) {
      await Promise.all([
        logger.logAuthEvent('verifyEmailOtp', 'error', {
          error: new Error('Invalid OTP format'),
          email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        }),
        authMonitor.recordAuthAttempt({
          method: 'email',
          status: 'failure',
          reason: 'Invalid OTP format',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid OTP format');
    }

    // Retrieve and verify stored OTP
    const otpDocRef = db.collection('otpTokens').doc(`email_${email.replace(/[^a-zA-Z0-9]/g, '_')}`);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      await logger.logAuthEvent('verifyEmailOtp', 'error', {
        error: new Error('OTP not found'),
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      });
      return createResponse(false, undefined, 'OTP not found. Please request a new code.');
    }

    const otpData = otpDoc.data()!;

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      await otpDocRef.delete();
      await logger.logAuthEvent('verifyEmailOtp', 'error', {
        error: new Error('OTP expired'),
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      });
      return createResponse(false, undefined, 'OTP expired. Please request a new code.');
    }

    // Check attempt count
    if (otpData.attempts >= otpData.maxAttempts) {
      await otpDocRef.delete();
      await logger.logAuthEvent('verifyEmailOtp', 'error', {
        error: new Error('Max OTP attempts exceeded'),
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      });
      return createResponse(false, undefined, 'Maximum attempts exceeded. Please request a new code.');
    }

    // Verify OTP hash
    if (!verifyOtpHash(otpCode, otpData.otpHash)) {
      // Increment attempt counter
      await otpDocRef.update({
        attempts: otpData.attempts + 1,
      });
      await Promise.all([
        logger.logAuthEvent('verifyEmailOtp', 'error', {
          error: new Error('Invalid OTP'),
          email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          attemptsRemaining: otpData.maxAttempts - otpData.attempts - 1,
        }),
        authMonitor.recordAuthAttempt({
          method: 'email',
          status: 'failure',
          reason: 'Invalid OTP',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid OTP. Please try again.');
    }

    // OTP verified - delete token to prevent reuse
    await otpDocRef.delete();

    // Create user if not exists
    let user = await auth().getUserByEmail(email).catch(() => null);

    if (!user) {
      user = await auth().createUser({
        email,
        emailVerified: true,
        displayName: `User_${Date.now()}`,
      });
    }

    // Generate custom token with role information
    const token = await auth().createCustomToken(user.uid, {
      email,
      role: 'user', // Default role, can be updated through KYC
      kycStatus: 'pending'
    });

    const responseTime = Date.now() - startTime;
    await Promise.all([
      logger.logAuthEvent('verifyEmailOtp', 'success', {
        userId: user.uid,
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        responseTime,
      }),
      authMonitor.recordAuthAttempt({
        method: 'email',
        status: 'success',
        responseTime,
        timestamp: Date.now(),
      }),
      // Clear rate limit after successful verification
      rateLimiter.clearRateLimit(email, 'emailOtp'),
    ]);

    return createResponse(true, {
      token,
      user: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'user',
        kycStatus: 'pending',
        createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now(),
        updatedAt: Date.now(),
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logger.logAuthEvent('verifyEmailOtp', 'error', {
      error: error instanceof Error ? error : new Error('Unknown error'),
      responseTime,
    });
    return createResponse(false, undefined, 'Failed to verify email OTP');
  }
});

export const walletLogin = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();

  try {
    // Validate input
    if (!data.address || !/^0x[a-fA-F0-9]{40}$/.test(data.address)) {
      await Promise.all([
        logger.logAuthEvent('walletLogin', 'error', {
          error: new Error('Invalid wallet address format'),
          address: data?.address,
        }),
        authMonitor.recordAuthAttempt({
          method: 'wallet',
          status: 'failure',
          reason: 'Invalid wallet address format',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid wallet address format');
    }

    if (!data.signature || typeof data.signature !== 'string') {
      await Promise.all([
        logger.logAuthEvent('walletLogin', 'error', {
          error: new Error('Invalid signature'),
          address: data.address,
        }),
        authMonitor.recordAuthAttempt({
          method: 'wallet',
          status: 'failure',
          reason: 'Invalid signature format',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid signature');
    }

    const { address, signature } = data;

    // Check rate limiting
    const isLimited = await rateLimiter.isRateLimited(
      address.toLowerCase(),
      'walletLogin',
      rateLimitConfigs.walletLogin
    );

    if (isLimited) {
      await Promise.all([
        logger.logAuthEvent('walletLogin', 'error', {
          error: new Error('Rate limit exceeded'),
          address: address,
        }),
        authMonitor.recordRateLimit({
          action: 'walletLogin',
          identifier: address.toLowerCase(),
          exceeded: true,
          timestamp: Date.now(),
        }),
        authMonitor.recordAuthAttempt({
          method: 'wallet',
          status: 'failure',
          reason: 'Rate limit exceeded',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Too many attempts. Please try again later.');
    }

    // Verify the signature using ethers.js
    // The message format must match what the frontend signs
    const expectedMessage = `Sign in to Gold Escrow Platform\nAddress: ${address.toLowerCase()}\nTimestamp: ${data.timestamp}\nNonce: ${data.nonce}`;

    let isValidSignature = false;
    try {
      // Dynamically import ethers to avoid bundling issues
      const { ethers } = await import('ethers');
      const recoveredAddress = ethers.verifyMessage(expectedMessage, signature);
      isValidSignature = recoveredAddress.toLowerCase() === address.toLowerCase();

      // Verify timestamp is within 5 minutes to prevent replay attacks
      if (isValidSignature && data.timestamp) {
        const now = Date.now();
        if (Math.abs(now - data.timestamp) > 300000) { // 5 minutes
          isValidSignature = false;
          await logger.logAuthEvent('walletLogin', 'error', {
            error: new Error('Signature expired'),
            address: address,
          });
        }
      }
    } catch (err) {
      isValidSignature = false;
      await logger.logAuthEvent('walletLogin', 'error', {
        error: new Error('Signature verification failed'),
        address: address,
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    if (!isValidSignature) {
      await Promise.all([
        logger.logAuthEvent('walletLogin', 'error', {
          error: new Error('Invalid signature'),
          address: address,
        }),
        authMonitor.recordAuthAttempt({
          method: 'wallet',
          status: 'failure',
          reason: 'Invalid signature',
          responseTime: Date.now() - startTime,
          timestamp: Date.now(),
        }),
      ]);
      return createResponse(false, undefined, 'Invalid signature');
    }

    // Get or create user
    let user = await auth().getUser(`wallet_${address.toLowerCase()}`).catch(() => null);

    if (!user) {
      user = await auth().createUser({
        uid: `wallet_${address.toLowerCase()}`,
        displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      // Set custom claims after user creation
      await auth().setCustomUserClaims(user.uid, {
        walletAddress: address.toLowerCase()
      });
    }

    // Generate custom token with role information
    const token = await auth().createCustomToken(user.uid, {
      walletAddress: address.toLowerCase(),
      role: 'user',
      kycStatus: 'pending'
    });

    const responseTime = Date.now() - startTime;
    await Promise.all([
      logger.logAuthEvent('walletLogin', 'success', {
        userId: user.uid,
        address: address,
        responseTime,
      }),
      authMonitor.recordAuthAttempt({
        method: 'wallet',
        status: 'success',
        responseTime,
        timestamp: Date.now(),
      }),
      // Clear rate limit after successful verification
      rateLimiter.clearRateLimit(address.toLowerCase(), 'walletLogin'),
    ]);

    return createResponse(true, {
      token,
      user: {
        id: user.uid,
        address: address.toLowerCase(),
        displayName: user.displayName,
        role: 'user',
        kycStatus: 'pending',
        createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now(),
        updatedAt: Date.now(),
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    await logger.logAuthEvent('walletLogin', 'error', {
      error: error instanceof Error ? error : new Error('Unknown error'),
      responseTime,
    });
    return createResponse(false, undefined, 'Failed to authenticate wallet');
  }
}); 