/**
 * @file useCredentialLinking Hook
 * @description React hook for linking credentials to user accounts
 */

import { useState, useCallback, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  linkEmailCredential,
  linkPhoneCredential,
  linkWalletCredential,
  getUserCredentials,
  UserCredentials,
  getMissingCredentials,
  hasAllCredentials,
} from './credentialLinking';
import { debounce } from './utils/debounce';
import { credentialLinkingLimiter } from './utils/rateLimiter';
import { logAuditEvent } from './utils/auditLogger';
import { getCredentialVerificationStatus, CredentialVerificationStatus } from './credentialLinking';

export interface CredentialLinkingState {
  loading: boolean;
  error: string | null;
  success: boolean;
  credentials: UserCredentials | null;
  missingCredentials: Array<'email' | 'phone' | 'wallet'>;
  verificationStatus: CredentialVerificationStatus;
}

export interface CredentialLinkingResult {
  state: CredentialLinkingState;
  linkEmail: (user: FirebaseUser, email: string, password?: string) => Promise<boolean>;
  linkPhone: (user: FirebaseUser, phoneNumber: string, verificationId: string, otpCode: string) => Promise<boolean>;
  linkWallet: (user: FirebaseUser, walletAddress: string) => Promise<boolean>;
  refreshCredentials: (uid: string) => Promise<void>;
  reset: () => void;
}

export const useCredentialLinking = (): CredentialLinkingResult => {
  const [state, setState] = useState<CredentialLinkingState>({
    loading: false,
    error: null,
    success: false,
    credentials: null,
    missingCredentials: ['email', 'phone', 'wallet'],
    verificationStatus: {
      email: { verified: false, exists: false },
      phone: { verified: false, exists: false },
      wallet: { verified: false, exists: false },
    },
  });

  // Debounced refresh to prevent excessive Firestore reads
  const refreshCredentialsDebounced = useCallback(
    debounce(async (uid: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const credentials = await getUserCredentials(uid);
        const missing = getMissingCredentials(credentials);
        const verificationStatus = getCredentialVerificationStatus(credentials);
        setState(prev => ({
          ...prev,
          loading: false,
          credentials,
          missingCredentials: missing,
          verificationStatus,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to refresh credentials',
        }));
      }
    }, 300),
    []
  );

  const refreshCredentials = useCallback(async (uid: string) => {
    refreshCredentialsDebounced(uid);
  }, [refreshCredentialsDebounced]);

  // Memoize missing credentials calculation
  const missingCredentialsMemo = useMemo(() => {
    return getMissingCredentials(state.credentials);
  }, [state.credentials]);

  // Memoize verification status
  const verificationStatusMemo = useMemo(() => {
    return getCredentialVerificationStatus(state.credentials);
  }, [state.credentials]);

  const linkEmail = useCallback(async (
    user: FirebaseUser,
    email: string,
    password?: string
  ): Promise<boolean> => {
    try {
      // Rate limiting check
      const rateLimitKey = `${user.uid}:link_email`;
      if (!credentialLinkingLimiter.isAllowed(rateLimitKey)) {
        const resetTime = credentialLinkingLimiter.getResetTime(rateLimitKey);
        throw new Error(`Too many requests. Please try again in ${Math.ceil(resetTime / 1000)} seconds.`);
      }

      setState(prev => ({ ...prev, loading: true, error: null, success: false }));
      const result = await linkEmailCredential(user, email, password);
      
      if (result.success) {
        await refreshCredentials(user.uid);
        await logAuditEvent(user.uid, 'credential_linked', {
          credentialType: 'email',
          metadata: { email },
        });
        setState(prev => ({ ...prev, loading: false, success: true }));
        return true;
      } else {
        setState(prev => ({ ...prev, loading: false, error: result.error || 'Failed to link email' }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to link email',
      }));
      return false;
    }
  }, [refreshCredentials]);

  const linkPhone = useCallback(async (
    user: FirebaseUser,
    phoneNumber: string,
    verificationId: string,
    otpCode: string
  ): Promise<boolean> => {
    try {
      // Rate limiting check
      const rateLimitKey = `${user.uid}:link_phone`;
      if (!credentialLinkingLimiter.isAllowed(rateLimitKey)) {
        const resetTime = credentialLinkingLimiter.getResetTime(rateLimitKey);
        throw new Error(`Too many requests. Please try again in ${Math.ceil(resetTime / 1000)} seconds.`);
      }

      setState(prev => ({ ...prev, loading: true, error: null, success: false }));
      const result = await linkPhoneCredential(user, phoneNumber, verificationId, otpCode);
      
      if (result.success) {
        await refreshCredentials(user.uid);
        await logAuditEvent(user.uid, 'credential_linked', {
          credentialType: 'phone',
          metadata: { phone: phoneNumber },
        });
        setState(prev => ({ ...prev, loading: false, success: true }));
        return true;
      } else {
        setState(prev => ({ ...prev, loading: false, error: result.error || 'Failed to link phone' }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to link phone',
      }));
      return false;
    }
  }, [refreshCredentials]);

  const linkWallet = useCallback(async (
    user: FirebaseUser,
    walletAddress: string
  ): Promise<boolean> => {
    try {
      // Rate limiting check
      const rateLimitKey = `${user.uid}:link_wallet`;
      if (!credentialLinkingLimiter.isAllowed(rateLimitKey)) {
        const resetTime = credentialLinkingLimiter.getResetTime(rateLimitKey);
        throw new Error(`Too many requests. Please try again in ${Math.ceil(resetTime / 1000)} seconds.`);
      }

      setState(prev => ({ ...prev, loading: true, error: null, success: false }));
      const result = await linkWalletCredential(user, walletAddress);
      
      if (result.success) {
        await refreshCredentials(user.uid);
        await logAuditEvent(user.uid, 'credential_linked', {
          credentialType: 'wallet',
          metadata: { walletAddress },
        });
        setState(prev => ({ ...prev, loading: false, success: true }));
        return true;
      } else {
        setState(prev => ({ ...prev, loading: false, error: result.error || 'Failed to link wallet' }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to link wallet',
      }));
      return false;
    }
  }, [refreshCredentials]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      credentials: null,
      missingCredentials: ['email', 'phone', 'wallet'],
      verificationStatus: {
        email: { verified: false, exists: false },
        phone: { verified: false, exists: false },
        wallet: { verified: false, exists: false },
      },
    });
  }, []);

  return {
    state: {
      ...state,
      missingCredentials: missingCredentialsMemo,
      verificationStatus: verificationStatusMemo,
    },
    linkEmail,
    linkPhone,
    linkWallet,
    refreshCredentials,
    reset,
  };
};

