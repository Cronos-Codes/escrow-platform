import { useState, useCallback } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  PhoneAuthProvider,
  UserCredential 
} from 'firebase/auth';
import { auth } from './firebase-config';
import { phoneOtpSchema } from '@escrow/schemas';

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

  const sendOtp = useCallback(async (phoneNumber: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate phone number format
      const validation = phoneOtpSchema.pick({ phoneNumber: true }).safeParse({ phoneNumber });
      if (!validation.success) {
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
        error: error instanceof Error ? error.message : 'Failed to send OTP',
      }));
    }
  }, []);

  const verifyOtp = useCallback(async (otpCode: string): Promise<UserCredential | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate OTP format
      const validation = phoneOtpSchema.pick({ otpCode: true }).safeParse({ otpCode });
      if (!validation.success) {
        throw new Error('Invalid OTP format');
      }

      if (!state.verificationId) {
        throw new Error('No verification ID found. Please send OTP first.');
      }

      // Create credential and sign in
      const credential = PhoneAuthProvider.credential(state.verificationId, otpCode);
      const userCredential = await auth.signInWithCredential(credential);

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
        error: error instanceof Error ? error.message : 'Failed to verify OTP',
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