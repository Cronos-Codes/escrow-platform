import { useState, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase-config';
import { findUserByCredential, linkWalletCredential } from './credentialLinking';
import { User as FirebaseUser } from 'firebase/auth';

// Lazy load ethers.js for better code splitting
let ethersPromise: Promise<typeof import('ethers')> | null = null;
const loadEthers = async () => {
  if (!ethersPromise) {
    ethersPromise = import('ethers');
  }
  return ethersPromise;
};

// Add type for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletLoginState {
  loading: boolean;
  error: string | null;
  success: boolean;
  walletAddress: string | null;
  isConnected: boolean;
  isNewUser: boolean;
}

export interface WalletLoginResult {
  state: WalletLoginState;
  connectWallet: (currentUser?: FirebaseUser | null) => Promise<{ walletAddress: string; isNewUser: boolean } | null>;
  disconnectWallet: () => void;
  reset: () => void;
}

export const useWalletLogin = (): WalletLoginResult => {
  const [state, setState] = useState<WalletLoginState>({
    loading: false,
    error: null,
    success: false,
    walletAddress: null,
    isConnected: false,
    isNewUser: false,
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      walletAddress: null,
      isConnected: false,
      isNewUser: false,
    });
  }, []);

  const connectWallet = useCallback(async (
    currentUser?: FirebaseUser | null
  ): Promise<{ walletAddress: string; isNewUser: boolean } | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!window.ethereum) {
        throw new Error('MetaMask or wallet extension not found. Please install a Web3 wallet.');
      }

      // Lazy load ethers.js
      const ethers = await loadEthers();

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const walletAddress = accounts[0].toLowerCase();
      
      // Check if wallet is already linked to a user
      const existingUserId = await findUserByCredential('wallet', walletAddress);
      let isNewUser = !existingUserId;

      // If user is already logged in, link wallet to their account
      if (currentUser && currentUser.uid) {
        const linkResult = await linkWalletCredential(currentUser, walletAddress);
        if (!linkResult.success) {
          throw new Error(linkResult.error || 'Failed to link wallet to account');
        }
        isNewUser = false;
      } else if (!existingUserId) {
        // New user - create user document with wallet
        await setDoc(doc(db, 'users', walletAddress), {
          walletAddress,
          authMethods: ['wallet'],
          role: 'buyer',
          kycStatus: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        walletAddress,
        isConnected: true,
        isNewUser,
      }));

      return { walletAddress, isNewUser };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState(prev => ({
      ...prev,
      walletAddress: null,
      isConnected: false,
      isNewUser: false,
    }));
  }, []);

  return {
    state,
    connectWallet,
    disconnectWallet,
    reset,
  };
}; 