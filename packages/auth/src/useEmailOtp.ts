import { useState, useCallback } from 'react';
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  UserCredential 
} from 'firebase/auth';
import { auth } from './firebase-config';
import { emailOtpSchema } from '@escrow/schemas';

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

  const sendEmailLink = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate email format
      const validation = emailOtpSchema.pick({ email: true }).safeParse({ email });
      if (!validation.success) {
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
        error: error instanceof Error ? error.message : 'Failed to send email link',
      }));
    }
  }, []);

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
        error: error instanceof Error ? error.message : 'Failed to verify email link',
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