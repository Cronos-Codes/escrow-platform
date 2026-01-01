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
export declare class AuthService {
    placeholder(): string;
}
export { useAuth } from './useAuth';
export { usePhoneOtp } from './usePhoneOtp';
export { useEmailOtp } from './useEmailOtp';
export { useWalletLogin } from './useWalletLogin';
export { useLogout } from './useLogout';
export { useTokenRefresh } from './useTokenRefresh';
export { useEmailVerification } from './useEmailVerification';
export { useOtpResend } from './useOtpResend';
export { useTotpSetup } from './useTotpSetup';
export { useTrustedDevices } from './useTrustedDevices';
export { useOAuthLogin } from './useOAuthLogin';
export { UserRole, hasRole, hasPermission, getUserPermissions } from './roleUtils';
export { auth, db } from './firebase-config';
export type { PhoneOtpState, PhoneOtpResult, EmailOtpState, EmailOtpResult, WalletLoginState, WalletLoginResult, LogoutResult, TokenRefreshResult, EmailVerificationState, EmailVerificationResult, OtpResendState, OtpResendResult, TotpSetupState, TotpSetupResult, TrustedDevice, TrustedDevicesState, TrustedDevicesResult, OAuthProvider, OAuthConfig, OAuthState, OAuthResult } from './types';
export declare const placeholder: () => void;
export { useKycStatus } from './useKycStatus';
