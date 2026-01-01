import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase-config';

// Add type for window.ethereum
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletAuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
  address: string | null;
  isNewUser: boolean;
}

export interface WalletAuthResult {
  state: WalletAuthState;
  connectWallet: () => Promise<void>;
  reset: () => void;
}

export const useWalletAuth = (): WalletAuthResult => {
  const [state, setState] = useState<WalletAuthState>({
    loading: false,
    error: null,
    success: false,
    address: null,
    isNewUser: false,
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      address: null,
      isNewUser: false,
    });
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      if (!window.ethereum) throw new Error('MetaMask or wallet extension not found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      // Check Firestore for user
      const userDoc = await getDoc(doc(db, 'users', address));
      let isNewUser = false;
      if (!userDoc.exists()) {
        // Create user entry
        await setDoc(doc(db, 'users', address), {
          walletAddress: address,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          authMethod: 'wallet',
        });
        isNewUser = true;
      }
      setState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        address,
        isNewUser,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  }, []);

  return {
    state,
    connectWallet,
    reset,
  };
}; 