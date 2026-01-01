/**
 * @file Credential Linking Service
 * @description Handles linking email, phone, and wallet credentials to user accounts
 */

import { 
  linkWithCredential, 
  linkWithPhoneNumber,
  linkWithRedirect,
  User as FirebaseUser,
  UserCredential,
  PhoneAuthProvider,
  EmailAuthProvider,
  AuthCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from './firebase-config';

export interface UserCredentials {
  email?: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  walletAddress?: string;
  walletVerified?: boolean;
  authMethods: ('email' | 'phone' | 'wallet')[];
}

export interface CredentialVerificationStatus {
  email: { verified: boolean; exists: boolean };
  phone: { verified: boolean; exists: boolean };
  wallet: { verified: boolean; exists: boolean };
}

export interface CredentialLinkingResult {
  success: boolean;
  error?: string;
  user?: FirebaseUser;
}

/**
 * Find user by credential (email, phone, or wallet)
 */
export async function findUserByCredential(
  type: 'email' | 'phone' | 'wallet',
  value: string
): Promise<string | null> {
  try {
    if (type === 'email') {
      // Firebase Auth handles email lookup
      // We'll check Firestore for wallet/phone
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', value));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }
    } else if (type === 'phone') {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', value));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }
    } else if (type === 'wallet') {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('walletAddress', '==', value.toLowerCase()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding user by credential:', error);
    return null;
  }
}

/**
 * Link email credential to existing user
 */
export async function linkEmailCredential(
  user: FirebaseUser,
  email: string,
  password?: string
): Promise<CredentialLinkingResult> {
  try {
    // If user already has email, update it
    if (user.email && user.email !== email) {
      // User wants to change email - would need email verification flow
      return {
        success: false,
        error: 'Email change requires verification. Please use account settings.',
      };
    }

    // Update Firestore user document
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    const updateData: Partial<UserCredentials> = {
      email,
      emailVerified: user.emailVerified || false,
    };

    if (userDoc.exists()) {
      const existingData = userDoc.data();
      const authMethods = existingData.authMethods || [];
      if (!authMethods.includes('email')) {
        authMethods.push('email');
      }
      updateData.authMethods = authMethods;
      await updateDoc(userDocRef, updateData);
    } else {
      await setDoc(userDocRef, {
        ...updateData,
        authMethods: ['email'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to link email credential',
    };
  }
}

/**
 * Link phone credential to existing user
 */
export async function linkPhoneCredential(
  user: FirebaseUser,
  phoneNumber: string,
  verificationId: string,
  otpCode: string
): Promise<CredentialLinkingResult> {
  try {
    // Create phone credential
    const credential = PhoneAuthProvider.credential(verificationId, otpCode);
    
    // Link credential to user
    await linkWithCredential(user, credential);

    // Update Firestore user document
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    const updateData: Partial<UserCredentials> = {
      phone: phoneNumber,
      phoneVerified: true,
    };

    if (userDoc.exists()) {
      const existingData = userDoc.data();
      const authMethods = existingData.authMethods || [];
      if (!authMethods.includes('phone')) {
        authMethods.push('phone');
      }
      updateData.authMethods = authMethods;
      await updateDoc(userDocRef, updateData);
    } else {
      await setDoc(userDocRef, {
        ...updateData,
        authMethods: ['phone'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to link phone credential',
    };
  }
}

/**
 * Link wallet credential to existing user
 */
export async function linkWalletCredential(
  user: FirebaseUser,
  walletAddress: string
): Promise<CredentialLinkingResult> {
  try {
    // Check if wallet is already linked to another account
    const existingUserId = await findUserByCredential('wallet', walletAddress);
    if (existingUserId && existingUserId !== user.uid) {
      return {
        success: false,
        error: 'This wallet is already linked to another account',
      };
    }

    // Update Firestore user document
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    const updateData: Partial<UserCredentials> = {
      walletAddress: walletAddress.toLowerCase(),
      walletVerified: true,
    };

    if (userDoc.exists()) {
      const existingData = userDoc.data();
      const authMethods = existingData.authMethods || [];
      if (!authMethods.includes('wallet')) {
        authMethods.push('wallet');
      }
      updateData.authMethods = authMethods;
      await updateDoc(userDocRef, updateData);
    } else {
      await setDoc(userDocRef, {
        ...updateData,
        authMethods: ['wallet'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to link wallet credential',
    };
  }
}

/**
 * Get user credentials from Firestore
 */
export async function getUserCredentials(uid: string): Promise<UserCredentials | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      email: data.email,
      emailVerified: data.emailVerified || false,
      phone: data.phone,
      phoneVerified: data.phoneVerified || false,
      walletAddress: data.walletAddress,
      walletVerified: data.walletVerified || false,
      authMethods: data.authMethods || [],
    };
  } catch (error) {
    console.error('Error getting user credentials:', error);
    return null;
  }
}

/**
 * Check if user has all credentials linked
 */
export function hasAllCredentials(credentials: UserCredentials | null): boolean {
  if (!credentials) return false;
  return !!(
    credentials.email &&
    credentials.phone &&
    credentials.walletAddress
  );
}

/**
 * Get missing credentials
 */
export function getMissingCredentials(credentials: UserCredentials | null): Array<'email' | 'phone' | 'wallet'> {
  const missing: Array<'email' | 'phone' | 'wallet'> = [];
  if (!credentials) {
    return ['email', 'phone', 'wallet'];
  }
  if (!credentials.email) missing.push('email');
  if (!credentials.phone) missing.push('phone');
  if (!credentials.walletAddress) missing.push('wallet');
  return missing;
}

/**
 * Get verification status for all credentials
 */
export function getCredentialVerificationStatus(
  credentials: UserCredentials | null
): CredentialVerificationStatus {
  if (!credentials) {
    return {
      email: { verified: false, exists: false },
      phone: { verified: false, exists: false },
      wallet: { verified: false, exists: false },
    };
  }

  return {
    email: {
      verified: credentials.emailVerified || false,
      exists: !!credentials.email,
    },
    phone: {
      verified: credentials.phoneVerified || false,
      exists: !!credentials.phone,
    },
    wallet: {
      verified: credentials.walletVerified || false,
      exists: !!credentials.walletAddress,
    },
  };
}

