/**
 * @file Multi-Path Login Service
 * @description Handles login with email, phone, or wallet credentials
 */

import {
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from './firebase-config';
import { findUserByCredential } from './credentialLinking';

export interface MultiPathLoginResult {
  success: boolean;
  userCredential?: UserCredential;
  error?: string;
  isNewUser?: boolean;
}

/**
 * Login with email and password
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<MultiPathLoginResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      userCredential,
      isNewUser: false,
    };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return {
        success: false,
        error: 'No account found with this email. Please sign up first.',
      };
    }
    return {
      success: false,
      error: error.message || 'Failed to login with email',
    };
  }
}

/**
 * Login with phone number and OTP
 */
export async function loginWithPhone(
  phoneNumber: string,
  verificationId: string,
  otpCode: string
): Promise<MultiPathLoginResult> {
  try {
    // Check if user exists by phone
    const userId = await findUserByCredential('phone', phoneNumber);
    
    // Create credential
    const credential = PhoneAuthProvider.credential(verificationId, otpCode);
    
    // Sign in
    const userCredential = await signInWithCredential(auth, credential);
    
    return {
      success: true,
      userCredential,
      isNewUser: !userId,
    };
  } catch (error: any) {
    if (error.code === 'auth/invalid-verification-code') {
      return {
        success: false,
        error: 'Invalid verification code',
      };
    }
    return {
      success: false,
      error: error.message || 'Failed to login with phone',
    };
  }
}

/**
 * Login with wallet address
 * Note: Wallet login requires signing a message for authentication
 */
export async function loginWithWallet(
  walletAddress: string,
  signature?: string
): Promise<MultiPathLoginResult> {
  try {
    // Find user by wallet address
    const userId = await findUserByCredential('wallet', walletAddress);
    
    if (!userId) {
      // New user - create account
      // In a real implementation, you'd verify the signature here
      // For now, we'll create a custom token or use a different auth method
      return {
        success: false,
        error: 'Wallet authentication requires signature verification. Please use the wallet connect flow.',
        isNewUser: true,
      };
    }

    // Get user document
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return {
        success: false,
        error: 'User account not found',
      };
    }

    // For wallet login, we need to create a custom token or use Firebase Admin SDK
    // This is a simplified version - in production, you'd verify the signature
    // and create a custom token server-side
    
    return {
      success: false,
      error: 'Wallet login requires server-side signature verification. Please use the wallet connect flow.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to login with wallet',
    };
  }
}

/**
 * Auto-detect login method based on input
 */
export function detectLoginMethod(input: string): 'email' | 'phone' | 'wallet' | null {
  // Email pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(input)) {
    return 'email';
  }

  // Phone pattern (E.164)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (phoneRegex.test(input.replace(/\s/g, ''))) {
    return 'phone';
  }

  // Wallet address pattern (Ethereum)
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  if (walletRegex.test(input)) {
    return 'wallet';
  }

  return null;
}


