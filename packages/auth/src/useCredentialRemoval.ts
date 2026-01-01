/**
 * @file useCredentialRemoval Hook
 * @description React hook for removing linked credentials
 */

import { useState, useCallback } from 'react';
import { User as FirebaseUser, EmailAuthProvider, AuthCredential } from 'firebase/auth';
import {
  removeEmailCredential,
  removePhoneCredential,
  removeWalletCredential,
} from './credentialRemoval';

export interface CredentialRemovalState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface CredentialRemovalResult {
  state: CredentialRemovalState;
  removeEmail: (user: FirebaseUser, password: string) => Promise<boolean>;
  removePhone: (user: FirebaseUser, reauthCredential: AuthCredential) => Promise<boolean>;
  removeWallet: (user: FirebaseUser, reauthCredential: AuthCredential) => Promise<boolean>;
  reset: () => void;
}

export const useCredentialRemoval = (): CredentialRemovalResult => {
  const [state, setState] = useState<CredentialRemovalState>({
    loading: false,
    error: null,
    success: false,
  });

  const removeEmail = useCallback(async (
    user: FirebaseUser,
    password: string
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, success: false }));
      const result = await removeEmailCredential(user, password);
      
      if (result.success) {
        setState(prev => ({ ...prev, loading: false, success: true }));
        return true;
      } else {
        setState(prev => ({ ...prev, loading: false, error: result.error || 'Failed to remove email' }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to remove email',
      }));
      return false;
    }
  }, []);

  const removePhone = useCallback(async (
    user: FirebaseUser,
    reauthCredential: AuthCredential
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, success: false }));
      const result = await removePhoneCredential(user, reauthCredential);
      
      if (result.success) {
        setState(prev => ({ ...prev, loading: false, success: true }));
        return true;
      } else {
        setState(prev => ({ ...prev, loading: false, error: result.error || 'Failed to remove phone' }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to remove phone',
      }));
      return false;
    }
  }, []);

  const removeWallet = useCallback(async (
    user: FirebaseUser,
    reauthCredential: AuthCredential
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, success: false }));
      const result = await removeWalletCredential(user, reauthCredential);
      
      if (result.success) {
        setState(prev => ({ ...prev, loading: false, success: true }));
        return true;
      } else {
        setState(prev => ({ ...prev, loading: false, error: result.error || 'Failed to remove wallet' }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to remove wallet',
      }));
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    state,
    removeEmail,
    removePhone,
    removeWallet,
    reset,
  };
};


