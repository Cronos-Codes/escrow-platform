import { useAuth } from './useAuth';

export const useAuthState = () => {
  // This wraps the main useAuth hook for modal usage
  const {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    resetPassword,
    logout,
    clearError,
  } = useAuth();

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    resetPassword,
    logout,
    clearError,
  };
}; 