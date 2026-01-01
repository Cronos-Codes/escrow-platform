import { useState, useCallback } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase-config';

export interface PhoneAuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
  verificationId: string | null;
  otpSent: boolean;
  cooldown: number;
}

export interface PhoneAuthResult {
  state: PhoneAuthState;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otpCode: string) => Promise<UserCredential | null>;
  reset: () => void;
}

export const usePhoneAuth = (): PhoneAuthResult => {
  const [state, setState] = useState<PhoneAuthState>({
    loading: false,
    error: null,
    success: false,
    verificationId: null,
    otpSent: false,
    cooldown: 0,
  });

  // Cooldown timer
  const startCooldown = () => {
    setState((prev) => ({ ...prev, cooldown: 60 }));
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.cooldown <= 1) {
          clearInterval(interval);
          return { ...prev, cooldown: 0 };
        }
        return { ...prev, cooldown: prev.cooldown - 1 };
      });
    }, 1000);
  };

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      verificationId: null,
      otpSent: false,
      cooldown: 0,
    });
  }, []);

  const sendOtp = useCallback(async (phoneNumber: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      // Create reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        verificationId: confirmationResult.verificationId,
        otpSent: true,
      }));
      startCooldown();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP',
      }));
    }
  }, []);

  const verifyOtp = useCallback(
    async (otpCode: string): Promise<UserCredential | null> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        if (!state.verificationId) {
          throw new Error('No verification ID found. Please send OTP first.');
        }
        // Create credential and sign in
        const credential = PhoneAuthProvider.credential(state.verificationId, otpCode);
        const userCredential = await signInWithCredential(auth, credential);
        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
        }));
        return userCredential;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to verify OTP',
        }));
        return null;
      }
    },
    [state.verificationId]
  );

  return {
    state,
    sendOtp,
    verifyOtp,
    reset,
  };
}; 