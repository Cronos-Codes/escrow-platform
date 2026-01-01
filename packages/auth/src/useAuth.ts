import { useState, useCallback, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';
import { UserRole } from './roleUtils';
import { z } from 'zod';
import { useLogout } from './useLogout';
import { getUserCredentials } from './credentialLinking';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export interface AuthUser {
  uid: string;
  email: string | null;
  phone?: string | null;
  walletAddress?: string | null;
  displayName?: string;
  role: UserRole;
  kycStatus: 'pending' | 'verified' | 'rejected';
  authMethods?: ('email' | 'phone' | 'wallet')[];
  createdAt: number;
  updatedAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    agreeToTerms: boolean;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: (onLoggedOut?: () => void) => Promise<void>;
  clearError: () => void;
}

export interface UseAuthResult extends AuthState, AuthActions {}

export const useAuth = (): UseAuthResult => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Development auth toggle: when true, bypass Firebase and use a mock user
  const isDevAuth = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEV_AUTH === 'true';

  const buildMockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
    uid: `dev-${Date.now()}`,
    email: overrides?.email ?? 'dev.user@example.com',
    displayName: overrides?.displayName ?? 'Dev User',
    role: overrides?.role ?? UserRole.BUYER,
    kycStatus: overrides?.kycStatus ?? 'verified',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const { logout: logoutWithCallback } = useLogout();

  // Listen to auth state changes (skipped in dev-auth mode)
  useEffect(() => {
    if (isDevAuth) {
      // In dev mode, restore session from localStorage if available
      try {
        const stored = window.localStorage.getItem('dev_auth_user');
        if (stored) {
          const parsed: AuthUser = JSON.parse(stored);
          setState(prev => ({ ...prev, user: parsed, loading: false, isAuthenticated: true, error: null }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, loading: false }));
      }
      return () => undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as AuthUser;
            // Sync with Firebase Auth data
            const syncedUser: AuthUser = {
              ...userData,
              email: firebaseUser.email || userData.email,
              phone: firebaseUser.phoneNumber || userData.phone,
              displayName: firebaseUser.displayName || userData.displayName,
            };
            
            // Update if needed
            if (syncedUser.email !== userData.email || syncedUser.phone !== userData.phone) {
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                email: syncedUser.email,
                phone: syncedUser.phone,
                updatedAt: Date.now(),
              });
            }
            
            setState(prev => ({
              ...prev,
              user: syncedUser,
              loading: false,
              isAuthenticated: true,
              error: null,
            }));
          } else {
            // User document doesn't exist, create it
            // Get credentials to determine auth methods
            const credentials = await getUserCredentials(firebaseUser.uid);
            const authMethods: ('email' | 'phone' | 'wallet')[] = [];
            if (firebaseUser.email) authMethods.push('email');
            if (firebaseUser.phoneNumber) authMethods.push('phone');
            if (credentials?.walletAddress) authMethods.push('wallet');
            
            const newUser: AuthUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              phone: firebaseUser.phoneNumber || null,
              walletAddress: credentials?.walletAddress || null,
              displayName: firebaseUser.displayName || undefined,
              role: UserRole.BUYER, // Default role
              kycStatus: 'pending',
              authMethods: authMethods.length > 0 ? authMethods : undefined,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
              authMethods: authMethods,
            });
            
            setState(prev => ({
              ...prev,
              user: newUser,
              loading: false,
              isAuthenticated: true,
              error: null,
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to load user data',
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          loading: false,
          isAuthenticated: false,
          error: null,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate input
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      if (isDevAuth) {
        const mock = buildMockUser({ email });
        try { window.localStorage.setItem('dev_auth_user', JSON.stringify(mock)); } catch {}
        setState(prev => ({ ...prev, user: mock, loading: false, isAuthenticated: true, error: null }));
        return;
      }

      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // Auth state listener will handle the rest
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          errorMessage = 'No account found with this email';
        } else if (error.message.includes('wrong-password')) {
          errorMessage = 'Incorrect password';
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please try again later';
        } else if (error.message.includes('user-disabled')) {
          errorMessage = 'This account has been disabled';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const signup = useCallback(async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    agreeToTerms: boolean;
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate input
      const validation = signupSchema.safeParse(data);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      if (isDevAuth) {
        const mock = buildMockUser({
          email: data.email,
          displayName: `${data.firstName} ${data.lastName}`,
          role: data.role,
        });
        try { window.localStorage.setItem('dev_auth_user', JSON.stringify(mock)); } catch {}
        setState(prev => ({ ...prev, user: mock, loading: false, isAuthenticated: true, error: null }));
        return;
      }

      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Create user document in Firestore
      const newUser: AuthUser = {
        uid: userCredential.user.uid,
        email: data.email,
        displayName: `${data.firstName} ${data.lastName}`,
        role: data.role,
        kycStatus: 'pending',
        authMethods: ['email'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...newUser,
        authMethods: ['email'],
      });

      // Auth state listener will handle the rest
    } catch (error) {
      let errorMessage = 'Signup failed';
      
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          errorMessage = 'An account with this email already exists';
        } else if (error.message.includes('weak-password')) {
          errorMessage = 'Password is too weak';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Invalid email address';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate input
      const validation = resetPasswordSchema.safeParse({ email });
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));
    } catch (error) {
      let errorMessage = 'Failed to send reset email';
      
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          errorMessage = 'No account found with this email';
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = 'Too many requests. Please try again later';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const logout = useCallback(async (onLoggedOut?: () => void) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    if (isDevAuth) {
      try { window.localStorage.removeItem('dev_auth_user'); } catch {}
      setState(prev => ({ ...prev, loading: false, user: null, isAuthenticated: false }));
      if (onLoggedOut) onLoggedOut();
      return;
    }
    await logoutWithCallback(onLoggedOut);
    setState(prev => ({ ...prev, loading: false, user: null, isAuthenticated: false }));
  }, [logoutWithCallback, isDevAuth]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    signup,
    resetPassword,
    logout,
    clearError,
  };
}; 