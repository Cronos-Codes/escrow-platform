'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Simple user type for now
interface User {
  uid: string;
  email: string;
}

type UserRole = 'ADMIN' | 'OPERATOR' | 'ARBITER' | 'SUPPORT';

interface AuthContextType {
  user: User | null;
  userRoles: UserRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, simulate a logged-in admin user
    const mockUser: User = {
      uid: 'admin-123',
      email: 'admin@goldescrow.com',
    };
    
    const mockRoles: UserRole[] = ['ADMIN'];
    
    // Simulate loading
    setTimeout(() => {
      setUser(mockUser);
      setUserRoles(mockRoles);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSignOut = async () => {
    setUser(null);
    setUserRoles([]);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user || userRoles.length === 0) return false;
    return roles.some(role => userRoles.includes(role));
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return hasRole(roles);
  };

  const value: AuthContextType = {
    user,
    userRoles,
    loading,
    signOut: handleSignOut,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
