/**
 * @file useBiometricAuth Hook
 * @description Handles WebAuthn/biometric authentication
 */

import React, { useState, useCallback } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase-config';

export interface BiometricAuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
  isSupported: boolean;
  isRegistered: boolean;
}

export interface BiometricAuthResult {
  state: BiometricAuthState;
  register: (uid: string) => Promise<boolean>;
  authenticate: () => Promise<boolean>;
  reset: () => void;
}

/**
 * Check if WebAuthn is supported in the browser
 */
function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' &&
    'PublicKeyCredential' in window &&
    typeof PublicKeyCredential !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'credentials' in navigator;
}

export const useBiometricAuth = (): BiometricAuthResult => {
  const [state, setState] = useState<BiometricAuthState>({
    loading: false,
    error: null,
    success: false,
    isSupported: false,
    isRegistered: false,
  });

  // Check support on mount
  React.useEffect(() => {
    setState(prev => ({ ...prev, isSupported: isWebAuthnSupported() }));
  }, []);

  const register = useCallback(async (uid: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!isWebAuthnSupported()) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Escrow Platform',
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(uid),
            name: uid,
            displayName: uid,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Prefer platform authenticators (biometrics)
            userVerification: 'preferred',
          },
          timeout: 60000,
          attestation: 'direct',
        },
      }) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Store credential ID in Firestore
      const credentialId = Array.from(new Uint8Array(credential.rawId))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      await setDoc(doc(db, 'users', uid), {
        biometricEnabled: true,
        biometricCredentialId: credentialId,
        updatedAt: Date.now(),
      }, { merge: true });

      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        isRegistered: true,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to register biometric',
      }));
      return false;
    }
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!isWebAuthnSupported()) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Get credential ID from Firestore (in production, this would be fetched server-side)
      // For now, we'll use a simplified approach
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'preferred',
        },
      }) as PublicKeyCredential | null;

      if (!assertion) {
        throw new Error('Biometric authentication failed');
      }

      // In production, you'd verify the assertion server-side
      // For now, we'll just check if it was successful

      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Biometric authentication failed',
      }));
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      isSupported: isWebAuthnSupported(),
      isRegistered: false,
    });
  }, []);

  return {
    state,
    register,
    authenticate,
    reset,
  };
};

