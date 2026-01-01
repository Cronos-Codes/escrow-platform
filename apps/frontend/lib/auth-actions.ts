import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import type { BuiltInProviderType } from 'next-auth/providers';

export const signIn = async (
  provider?: BuiltInProviderType,
  options?: {
    callbackUrl?: string;
    email?: string;
  }
) => {
  return nextAuthSignIn(provider, options);
};

export const signOut = async (options?: { callbackUrl?: string }) => {
  return nextAuthSignOut(options);
};

// Helper function to check if NextAuth is available
export const isNextAuthAvailable = () => {
  return typeof window !== 'undefined' && 'next-auth' in window;
};
