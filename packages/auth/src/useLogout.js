import { useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase-config';
export const useLogout = () => {
    const logout = useCallback(async (onLoggedOut) => {
        try {
            // Sign out from Firebase
            await signOut(auth);
            // Clear local storage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('emailForSignIn');
            // Clear session storage
            sessionStorage.clear();
            // Clear any application state (to be integrated with state management)
            // TODO: Clear Redux/Zustand state when implemented
            // Call the callback to open AuthModal or handle post-logout UI
            if (onLoggedOut)
                onLoggedOut();
        }
        catch (error) {
            console.error('Logout failed:', error);
            // Still call the callback even if logout fails
            if (onLoggedOut)
                onLoggedOut();
        }
    }, []);
    return {
        logout,
        isLoggingOut: false, // TODO: Add loading state when integrated with state management
    };
};
