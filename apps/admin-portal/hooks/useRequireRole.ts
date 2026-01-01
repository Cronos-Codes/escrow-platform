'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
type UserRole = 'ADMIN' | 'OPERATOR' | 'ARBITER' | 'SUPPORT';

export function useRequireRole(requiredRoles: UserRole[], redirectTo = '/unauthorized') {
  const { user, userRoles, loading, hasAnyRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!user) {
      // User not authenticated, redirect to login
      router.push('/login');
      return;
    }

    if (!hasAnyRole(requiredRoles)) {
      // User doesn't have required roles, redirect to unauthorized
      router.push(redirectTo);
      return;
    }
  }, [user, userRoles, loading, hasAnyRole, requiredRoles, router, redirectTo]);

  return {
    user,
    userRoles,
    loading,
    hasAccess: user && hasAnyRole(requiredRoles),
  };
}

// Convenience hooks for specific role requirements
export function useRequireAdmin() {
  return useRequireRole(['ADMIN']);
}

export function useRequireOperator() {
  return useRequireRole(['ADMIN', 'OPERATOR']);
}

export function useRequireArbiter() {
  return useRequireRole(['ADMIN', 'OPERATOR', 'ARBITER']);
}

export function useRequireSupport() {
  return useRequireRole(['ADMIN', 'OPERATOR', 'ARBITER', 'SUPPORT']);
}
