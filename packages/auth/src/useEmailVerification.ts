import { useState, useCallback } from 'react';
import { sendEmailVerification, User } from 'firebase/auth';
import { auth } from './firebase-config';

export interface EmailVerificationState {
  loading: boolean;
  error: string | null;
  success: boolean;
  isVerified: boolean;
}

export interface EmailVerificationResult {
  state: EmailVerificationState;
  sendVerificationEmail: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
}

export const useEmailVerification = (): EmailVerificationResult => {
  const [state, setState] = useState<EmailVerificationState>({
    loading: false,
    error: null,
    success: false,
    isVerified: false,
  });

  const sendVerificationEmail = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user with email found');
      }

      // Send verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/profile/complete`,
        handleCodeInApp: true,
      });

      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to send verification email',
      }));
    }
  }, []);

  const checkVerificationStatus = useCallback(async (): Promise<boolean> => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // Reload user to get latest verification status
      await user.reload();
      
      const isVerified = user.emailVerified;
      
      setState(prev => ({
        ...prev,
        isVerified,
      }));

      return isVerified;
    } catch (error) {
      console.error('Failed to check verification status:', error);
      return false;
    }
  }, []);

  return {
    state,
    sendVerificationEmail,
    checkVerificationStatus,
  };
}; 