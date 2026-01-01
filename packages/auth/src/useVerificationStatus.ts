import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useEmailVerification } from './useEmailVerification';
import { usePhoneOtp } from './usePhoneOtp';

export interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  walletConnected: boolean;
  hasAnyVerification: boolean;
  canSkipSecondFactor: boolean;
}

export interface UseVerificationStatusResult {
  verificationStatus: VerificationStatus;
  checkAllVerificationStatus: () => Promise<void>;
  refreshVerificationStatus: () => Promise<void>;
}

export const useVerificationStatus = (): UseVerificationStatusResult => {
  const { user } = useAuth();
  const { checkVerificationStatus: checkEmailVerification } = useEmailVerification();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    emailVerified: false,
    phoneVerified: false,
    walletConnected: false,
    hasAnyVerification: false,
    canSkipSecondFactor: false,
  });

  const checkAllVerificationStatus = useCallback(async () => {
    if (!user) {
      setVerificationStatus({
        emailVerified: false,
        phoneVerified: false,
        walletConnected: false,
        hasAnyVerification: false,
        canSkipSecondFactor: false,
      });
      return;
    }

    try {
      // Check email verification
      const emailVerified = await checkEmailVerification();
      
      // Check phone verification (if user has phone number)
      const phoneVerified = user.phone ? true : false; // Simplified - in real app, check actual verification status
      
      // Check wallet connection (if user has wallet address)
      const walletConnected = user.walletAddress ? true : false;
      
      // Determine if user has any verification method
      const hasAnyVerification = emailVerified || phoneVerified || walletConnected;
      
      // User can skip second factor if they have at least one verified method
      const canSkipSecondFactor = hasAnyVerification;

      setVerificationStatus({
        emailVerified,
        phoneVerified,
        walletConnected,
        hasAnyVerification,
        canSkipSecondFactor,
      });

    } catch (error) {
      console.error('Error checking verification status:', error);
      // On error, assume no verification to be safe
      setVerificationStatus({
        emailVerified: false,
        phoneVerified: false,
        walletConnected: false,
        hasAnyVerification: false,
        canSkipSecondFactor: false,
      });
    }
  }, [user, checkEmailVerification]);

  const refreshVerificationStatus = useCallback(async () => {
    await checkAllVerificationStatus();
  }, [checkAllVerificationStatus]);

  // Check verification status when user changes
  useEffect(() => {
    checkAllVerificationStatus();
  }, [checkAllVerificationStatus]);

  return {
    verificationStatus,
    checkAllVerificationStatus,
    refreshVerificationStatus,
  };
};

