/**
 * @file Authentication Package for Escrow Platform
 * @description Handles OTP, wallet login, and role-based access control
 */

export interface User {
  id: string;
  email?: string;
  phone?: string;
  walletAddress?: string;
  role: 'buyer' | 'seller' | 'broker' | 'admin' | 'arbiter' | 'sponsor';
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: number;
  updatedAt: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export class AuthService {
  // TODO: Implement auth logic in Phase 1
  // - Phone OTP verification
  // - WalletConnect integration
  // - Role-based routing
  // - KYC/AML compliance
  
  public placeholder(): string {
    return 'Auth Service - To be implemented in Phase 1';
  }
}

// Core auth hooks
export { useAuth } from './useAuth';
export { usePhoneOtp } from './usePhoneOtp';
export { useEmailOtp } from './useEmailOtp';
export { useWalletLogin } from './useWalletLogin';
export { useLogout } from './useLogout';
export { useTokenRefresh } from './useTokenRefresh';
export { useEmailVerification } from './useEmailVerification';
export { useOtpResend } from './useOtpResend';
export { useVerificationStatus } from './useVerificationStatus';

// Credential linking
export { useCredentialLinking } from './useCredentialLinking';
export { useCredentialRemoval } from './useCredentialRemoval';
export * from './credentialLinking';
export * from './credentialRemoval';

// Utilities
export * from './utils/debounce';
export * from './utils/rateLimiter';
export * from './utils/auditLogger';

// Multi-factor and device trust
export { useTotpSetup } from './useTotpSetup';
export { useTrustedDevices } from './useTrustedDevices';
export { useTwoFactorAuth } from './useTwoFactorAuth';
export { useBiometricAuth } from './useBiometricAuth';

// Multi-path login
export * from './multiPathLogin';

// OAuth and SSO (stubs)
export { useOAuthLogin } from './useOAuthLogin';

// Role utilities
export { UserRole, hasRole, hasPermission, getUserPermissions } from './roleUtils';

// Firebase configuration
export { auth, db } from './firebase-config';

// Types
export type { 
  PhoneOtpState, 
  PhoneOtpResult,
  EmailOtpState,
  EmailOtpResult,
  WalletLoginState,
  WalletLoginResult,
  LogoutResult,
  TokenRefreshResult,
  EmailVerificationState,
  EmailVerificationResult,
  VerificationStatus,
  UseVerificationStatusResult,
  OtpResendState,
  OtpResendResult,
  TotpSetupState,
  TotpSetupResult,
  TrustedDevice,
  TrustedDevicesState,
  TrustedDevicesResult,
  OAuthProvider,
  OAuthConfig,
  OAuthState,
  OAuthResult
} from './types';

export const placeholder = () => {
  console.log('Auth package placeholder - Authentication to be implemented in Phase 1');
};

export { useKycStatus } from './useKycStatus'; 