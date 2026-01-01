/**
 * @file Auth Modal Context
 * @description React Context to reduce prop drilling in auth modal components
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthModalContextType {
  currentUser: FirebaseUser | null;
  isLinkingMode: boolean;
  setCurrentUser: (user: FirebaseUser | null) => void;
  setIsLinkingMode: (mode: boolean) => void;
  dismissedBanner: boolean;
  setDismissedBanner: (dismissed: boolean) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  return (
    <AuthModalContext.Provider
      value={{
        currentUser,
        isLinkingMode,
        setCurrentUser,
        setIsLinkingMode,
        dismissedBanner,
        setDismissedBanner,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModalContext = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModalContext must be used within AuthModalProvider');
  }
  return context;
};


