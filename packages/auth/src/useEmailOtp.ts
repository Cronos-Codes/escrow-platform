import { useState, useCallback } from 'react';
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  UserCredential 
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { auth } from './firebase-config';

export interface EmailOtpState {
  loading: boolean;
  error: string | null;
  success: boolean;
  emailSent: boolean;
}

export interface EmailOtpResult {
  state: EmailOtpState;
  sendEmailLink: (email: string) => Promise<void>;
  verifyEmailLink: () => Promise<UserCredential | null>;
  reset: () => void;
}

export const useEmailOtp = (): EmailOtpResult => {
  const [state, setState] = useState<EmailOtpState>({
    loading: false,
    error: null,
    success: false,
    emailSent: false,
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      emailSent: false,
    });
  }, []);

  const mapSendEmailError = (error: unknown): string => {
    const fallback = 'Failed to send email link';
    const err = error as Partial<FirebaseError> | undefined;
    const code = (err && 'code' in err ? (err as any).code : undefined) as string | undefined;
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please try again later';
      case 'auth/missing-email':
        return 'Email address is required';
      default:
        return err && typeof (err as any).message === 'string' ? (err as any).message : fallback;
    }
  };

  const sendEmailLink = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Basic email validation (avoid cross-package runtime deps)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      const actionCodeSettings = {
        url: `${window.location.origin}/login?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true,
      };

      // Send email link
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Save email to localStorage for verification
      window.localStorage.setItem('emailForSignIn', email);

      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        emailSent: true,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: mapSendEmailError(error),
      }));
    }
  }, []);

  const mapVerifyEmailError = (error: unknown): string => {
    const fallback = 'Failed to verify email link';
    const err = error as Partial<FirebaseError> | undefined;
    const code = (err && 'code' in err ? (err as any).code : undefined) as string | undefined;
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/invalid-action-code':
      case 'auth/expired-action-code':
        return 'Invalid or expired sign-in link';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      default:
        return err && typeof (err as any).message === 'string' ? (err as any).message : fallback;
    }
  };

  const verifyEmailLink = useCallback(async (): Promise<UserCredential | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!isSignInWithEmailLink(auth, window.location.href)) {
        throw new Error('Invalid email sign-in link');
      }

      const email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        throw new Error('Email not found. Please request a new sign-in link.');
      }

      // Sign in with email link
      const userCredential = await signInWithEmailLink(auth, email, window.location.href);

      // Clear email from localStorage
      window.localStorage.removeItem('emailForSignIn');

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
        error: mapVerifyEmailError(error),
      }));
      return null;
    }
  }, []);

  return {
    state,
    sendEmailLink,
    verifyEmailLink,
    reset,
  };
}; 