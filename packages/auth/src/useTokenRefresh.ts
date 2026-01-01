import { useEffect, useCallback } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth } from './firebase-config';

export interface TokenRefreshResult {
  refreshToken: () => Promise<string | null>;
  isRefreshing: boolean;
}

export const useTokenRefresh = (): TokenRefreshResult => {
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      
      // Force token refresh
      const token = await user.getIdToken(true);
      
      // Store the new token
      localStorage.setItem('token', token);
      
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          // Get the current token
          const token = await user.getIdToken();
          
          // Store the token
          localStorage.setItem('token', token);
          
          // Check if token is about to expire (within 5 minutes)
          const decodedToken = await user.getIdTokenResult();
          const expirationTime = new Date(decodedToken.expirationTime);
          const currentTime = new Date();
          const timeUntilExpiry = expirationTime.getTime() - currentTime.getTime();
          
          // If token expires in less than 5 minutes, refresh it
          if (timeUntilExpiry < 5 * 60 * 1000) {
            await refreshToken();
          }
          
        } catch (error) {
          console.error('Token monitoring failed:', error);
        }
      } else {
        // User signed out, clear token
        localStorage.removeItem('token');
      }
    });

    return () => unsubscribe();
  }, [refreshToken]);

  return {
    refreshToken,
    isRefreshing: false, // TODO: Add loading state when integrated with state management
  };
}; 