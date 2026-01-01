/**
 * @file Credential Removal Service
 * @description Handles removal of linked credentials with proper verification
 */

import { 
  unlink,
  reauthenticateWithCredential,
  EmailAuthProvider,
  PhoneAuthProvider,
  User as FirebaseUser,
  AuthCredential
} from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';
import { logAuditEvent } from './utils/auditLogger';

export interface CredentialRemovalResult {
  success: boolean;
  error?: string;
}

/**
 * Remove email credential from user account
 * Requires reauthentication for security
 */
export async function removeEmailCredential(
  user: FirebaseUser,
  password: string
): Promise<CredentialRemovalResult> {
  try {
    if (!user.email) {
      return {
        success: false,
        error: 'No email credential to remove',
      };
    }

    // Reauthenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Unlink email (requires at least one other auth method)
    await unlink(user, 'password');

    // Update Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const authMethods = (data.authMethods || []).filter((m: string) => m !== 'email');
      
      await updateDoc(userDocRef, {
        email: null,
        emailVerified: false,
        authMethods,
        updatedAt: Date.now(),
      });
    }

    await logAuditEvent(user.uid, 'credential_unlinked', {
      credentialType: 'email',
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove email credential',
    };
  }
}

/**
 * Remove phone credential from user account
 * Requires reauthentication via another method
 */
export async function removePhoneCredential(
  user: FirebaseUser,
  reauthCredential: AuthCredential
): Promise<CredentialRemovalResult> {
  try {
    if (!user.phoneNumber) {
      return {
        success: false,
        error: 'No phone credential to remove',
      };
    }

    // Reauthenticate user with another method
    await reauthenticateWithCredential(user, reauthCredential);

    // Unlink phone
    await unlink(user, 'phone');

    // Update Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const authMethods = (data.authMethods || []).filter((m: string) => m !== 'phone');
      
      await updateDoc(userDocRef, {
        phone: null,
        phoneVerified: false,
        authMethods,
        updatedAt: Date.now(),
      });
    }

    await logAuditEvent(user.uid, 'credential_unlinked', {
      credentialType: 'phone',
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove phone credential',
    };
  }
}

/**
 * Remove wallet credential from user account
 * Requires reauthentication via another method
 */
export async function removeWalletCredential(
  user: FirebaseUser,
  reauthCredential: AuthCredential
): Promise<CredentialRemovalResult> {
  try {
    // Reauthenticate user with another method
    await reauthenticateWithCredential(user, reauthCredential);

    // Update Firestore (wallet is not a Firebase Auth provider, so we just remove from Firestore)
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const authMethods = (data.authMethods || []).filter((m: string) => m !== 'wallet');
      
      // Ensure user has at least one auth method
      if (authMethods.length === 0) {
        return {
          success: false,
          error: 'Cannot remove last authentication method',
        };
      }
      
      await updateDoc(userDocRef, {
        walletAddress: null,
        walletVerified: false,
        authMethods,
        updatedAt: Date.now(),
      });
    }

    await logAuditEvent(user.uid, 'credential_unlinked', {
      credentialType: 'wallet',
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove wallet credential',
    };
  }
}


