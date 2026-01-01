import { useState, useCallback, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';
import { UserRole } from './roleUtils';
import { z } from 'zod';
import { useLogout } from './useLogout';
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
export const useAuth = () => {
    const [state, setState] = useState({
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false,
    });
    const { logout: logoutWithCallback } = useLogout();
    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get user data from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setState(prev => ({
                            ...prev,
                            user: userData,
                            loading: false,
                            isAuthenticated: true,
                            error: null,
                        }));
                    }
                    else {
                        // User document doesn't exist, create it
                        const newUser = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || undefined,
                            role: UserRole.BUYER, // Default role
                            kycStatus: 'pending',
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                        };
                        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
                        setState(prev => ({
                            ...prev,
                            user: newUser,
                            loading: false,
                            isAuthenticated: true,
                            error: null,
                        }));
                    }
                }
                catch (error) {
                    console.error('Error fetching user data:', error);
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: 'Failed to load user data',
                    }));
                }
            }
            else {
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
    const login = useCallback(async (email, password) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            // Validate input
            const validation = loginSchema.safeParse({ email, password });
            if (!validation.success) {
                throw new Error(validation.error.errors[0].message);
            }
            // Sign in with Firebase
            await signInWithEmailAndPassword(auth, email, password);
            // Auth state listener will handle the rest
        }
        catch (error) {
            let errorMessage = 'Login failed';
            if (error instanceof Error) {
                if (error.message.includes('user-not-found')) {
                    errorMessage = 'No account found with this email';
                }
                else if (error.message.includes('wrong-password')) {
                    errorMessage = 'Incorrect password';
                }
                else if (error.message.includes('too-many-requests')) {
                    errorMessage = 'Too many failed attempts. Please try again later';
                }
                else if (error.message.includes('user-disabled')) {
                    errorMessage = 'This account has been disabled';
                }
                else {
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
    const signup = useCallback(async (data) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            // Validate input
            const validation = signupSchema.safeParse(data);
            if (!validation.success) {
                throw new Error(validation.error.errors[0].message);
            }
            // Create user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            // Create user document in Firestore
            const newUser = {
                uid: userCredential.user.uid,
                email: data.email,
                displayName: `${data.firstName} ${data.lastName}`,
                role: data.role,
                kycStatus: 'pending',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
            // Auth state listener will handle the rest
        }
        catch (error) {
            let errorMessage = 'Signup failed';
            if (error instanceof Error) {
                if (error.message.includes('email-already-in-use')) {
                    errorMessage = 'An account with this email already exists';
                }
                else if (error.message.includes('weak-password')) {
                    errorMessage = 'Password is too weak';
                }
                else if (error.message.includes('invalid-email')) {
                    errorMessage = 'Invalid email address';
                }
                else {
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
    const resetPassword = useCallback(async (email) => {
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
        }
        catch (error) {
            let errorMessage = 'Failed to send reset email';
            if (error instanceof Error) {
                if (error.message.includes('user-not-found')) {
                    errorMessage = 'No account found with this email';
                }
                else if (error.message.includes('too-many-requests')) {
                    errorMessage = 'Too many requests. Please try again later';
                }
                else {
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
    const logout = useCallback(async (onLoggedOut) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        await logoutWithCallback(onLoggedOut);
        setState(prev => ({ ...prev, loading: false, user: null, isAuthenticated: false }));
    }, [logoutWithCallback]);
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
