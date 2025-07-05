import * as functions from 'firebase-functions';
import { auth } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { phoneOtpSchema, emailOtpSchema } from '@escrow/schemas';

// Initialize Firebase Admin
if (!auth.apps.length) {
  initializeApp();
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
      return createResponse(false, undefined, 'Invalid phone number format');
    }

    const { phoneNumber } = validation.data;

    // TODO: Implement actual OTP sending logic
    // For now, simulate OTP sending
    console.log(`Sending OTP to ${phoneNumber}`);

    const responseTime = Date.now() - startTime;
    console.log(`loginPhone completed in ${responseTime}ms`);

    return createResponse(true, { 
      message: 'OTP sent successfully',
      phoneNumber: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3') // Mask phone number
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`loginPhone failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const verifyPhoneOtp = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const validation = phoneOtpSchema.safeParse(data);
    if (!validation.success) {
      return createResponse(false, undefined, 'Invalid OTP format');
    }

    const { phoneNumber, otpCode } = validation.data;

    // TODO: Implement actual OTP verification logic
    // For now, simulate verification (accept any 6-digit code)
    if (otpCode === '123456') {
      // Create custom token
      const customToken = await auth().createCustomToken(`phone_${phoneNumber}`, {
        phoneNumber,
        role: 'buyer', // Default role, can be updated later
      });

      const responseTime = Date.now() - startTime;
      console.log(`verifyPhoneOtp completed in ${responseTime}ms`);

      return createResponse(true, { 
        token: customToken,
        user: {
          id: `phone_${phoneNumber}`,
          phone: phoneNumber,
          role: 'buyer',
          kycStatus: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      });
    } else {
      return createResponse(false, undefined, 'Invalid OTP code');
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`verifyPhoneOtp failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const loginEmail = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const validation = emailOtpSchema.pick({ email: true }).safeParse(data);
    if (!validation.success) {
      return createResponse(false, undefined, 'Invalid email format');
    }

    const { email } = validation.data;

    // TODO: Implement actual email link sending logic
    // For now, simulate email sending
    console.log(`Sending email link to ${email}`);

    const responseTime = Date.now() - startTime;
    console.log(`loginEmail completed in ${responseTime}ms`);

    return createResponse(true, { 
      message: 'Email link sent successfully',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`loginEmail failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const verifyEmailOtp = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const validation = emailOtpSchema.safeParse(data);
    if (!validation.success) {
      return createResponse(false, undefined, 'Invalid OTP format');
    }

    const { email, otpCode } = validation.data;

    // TODO: Implement actual email verification logic
    // For now, simulate verification (accept any 6-digit code)
    if (otpCode === '123456') {
      // Create custom token
      const customToken = await auth().createCustomToken(`email_${email}`, {
        email,
        role: 'buyer', // Default role, can be updated later
      });

      const responseTime = Date.now() - startTime;
      console.log(`verifyEmailOtp completed in ${responseTime}ms`);

      return createResponse(true, { 
        token: customToken,
        user: {
          id: `email_${email}`,
          email: email,
          role: 'buyer',
          kycStatus: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      });
    } else {
      return createResponse(false, undefined, 'Invalid OTP code');
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`verifyEmailOtp failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
}); 