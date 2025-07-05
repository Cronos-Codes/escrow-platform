import { useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase-config';

export interface LogoutResult {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

export const useLogout = (): LogoutResult => {
  const logout = useCallback(async () => {
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
      
      // Redirect to login page
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      window.location.href = '/login';
    }
  }, []);

  return {
    logout,
    isLoggingOut: false, // TODO: Add loading state when integrated with state management
  };
}; 