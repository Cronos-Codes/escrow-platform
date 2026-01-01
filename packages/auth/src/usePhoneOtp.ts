import { useState, useCallback } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  PhoneAuthProvider,
  signInWithCredential,
  UserCredential 
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { auth } from './firebase-config';

export interface PhoneOtpState {
  loading: boolean;
  error: string | null;
  success: boolean;
  verificationId: string | null;
}

export interface PhoneOtpResult {
  state: PhoneOtpState;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otpCode: string) => Promise<UserCredential | null>;
  reset: () => void;
}

export const usePhoneOtp = (): PhoneOtpResult => {
  const [state, setState] = useState<PhoneOtpState>({
    loading: false,
    error: null,
    success: false,
    verificationId: null,
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      verificationId: null,
    });
  }, []);

  const mapFirebasePhoneError = (error: unknown): string => {
    const fallback = 'Failed to send OTP';
    const err = error as Partial<FirebaseError> | undefined;
    const code = (err && 'code' in err ? (err as any).code : undefined) as string | undefined;
    switch (code) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/missing-phone-number':
        return 'Phone number is required';
      case 'auth/quota-exceeded':
        return 'Request quota exceeded. Please try again later';
      case 'auth/captcha-check-failed':
        return 'Security check failed. Please retry';
      default:
        return err && typeof (err as any).message === 'string' ? (err as any).message : fallback;
    }
  };

  const sendOtp = useCallback(async (phoneNumber: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Basic E.164 validation (avoid cross-package runtime deps)
      const e164 = /^\+?[1-9]\d{1,14}$/;
      if (!e164.test(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Create reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
      });

      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        recaptchaVerifier
      );

      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        verificationId: confirmationResult.verificationId,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: mapFirebasePhoneError(error),
      }));
    }
  }, []);

  const mapFirebaseVerifyError = (error: unknown): string => {
    const fallback = 'Failed to verify OTP';
    const err = error as Partial<FirebaseError> | undefined;
    const code = (err && 'code' in err ? (err as any).code : undefined) as string | undefined;
    switch (code) {
      case 'auth/invalid-verification-code':
        return 'Invalid verification code';
      case 'auth/code-expired':
        return 'Verification code has expired';
      case 'auth/missing-verification-code':
        return 'Enter the verification code';
      default:
        return err && typeof (err as any).message === 'string' ? (err as any).message : fallback;
    }
  };

  const verifyOtp = useCallback(async (otpCode: string): Promise<UserCredential | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 6-digit OTP validation
      const otpRegex = /^\d{6}$/;
      if (!otpRegex.test(otpCode)) {
        throw new Error('Invalid verification code');
      }

      if (!state.verificationId) {
        throw new Error('No verification ID found. Please send OTP first.');
      }

      // Create credential and sign in
      const credential = PhoneAuthProvider.credential(state.verificationId, otpCode);
      const userCredential = await signInWithCredential(auth, credential);

      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
      }));

      return userCredential;

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: mapFirebaseVerifyError(error),
      }));
      return null;
    }
  }, [state.verificationId]);

  return {
    state,
    sendOtp,
    verifyOtp,
    reset,
  };
}; 