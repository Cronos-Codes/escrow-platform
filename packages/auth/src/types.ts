// Phone OTP Types
export interface PhoneOtpState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface PhoneOtpResult {
  state: PhoneOtpState;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
}

// Email OTP Types
export interface EmailOtpState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface EmailOtpResult {
  state: EmailOtpState;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
}

// Wallet Login Types
export interface WalletLoginState {
  loading: boolean;
  error: string | null;
  success: boolean;
  address: string | null;
}

export interface WalletLoginResult {
  state: WalletLoginState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

// Logout Types
export interface LogoutResult {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

// Token Refresh Types
export interface TokenRefreshResult {
  refreshToken: () => Promise<string | null>;
  isRefreshing: boolean;
}

// Email Verification Types
export interface EmailVerificationState {
  loading: boolean;
  error: string | null;
  success: boolean;
  isVerified: boolean;
}

export interface EmailVerificationResult {
  state: EmailVerificationState;
  sendVerificationEmail: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
}

// OTP Resend Types
export interface OtpResendState {
  canResend: boolean;
  countdown: number;
  loading: boolean;
  error: string | null;
}

export interface OtpResendResult {
  state: OtpResendState;
  resendOtp: () => Promise<void>;
  resetTimer: () => void;
}

// TOTP Setup Types
export interface TotpSetupState {
  loading: boolean;
  error: string | null;
  success: boolean;
  qrCodeUrl: string | null;
  secretKey: string | null;
  isEnabled: boolean;
}

export interface TotpSetupResult {
  state: TotpSetupState;
  generateSecret: () => Promise<void>;
  verifyCode: (code: string) => Promise<boolean>;
  enableTotp: () => Promise<void>;
  disableTotp: () => Promise<void>;
}

// Trusted Devices Types
export interface TrustedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  lastUsed: Date;
  isCurrent: boolean;
}

export interface TrustedDevicesState {
  loading: boolean;
  error: string | null;
  devices: TrustedDevice[];
  currentDevice: TrustedDevice | null;
}

export interface TrustedDevicesResult {
  state: TrustedDevicesState;
  getDevices: () => Promise<void>;
  addDevice: (deviceInfo: Partial<TrustedDevice>) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  trustCurrentDevice: () => Promise<void>;
}

// OAuth Types
export type OAuthProvider = 'google' | 'github' | 'linkedin' | 'microsoft' | 'saml';

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  redirectUri: string;
  scope?: string[];
}

export interface OAuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface OAuthResult {
  state: OAuthState;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  handleOAuthCallback: (code: string, state: string) => Promise<void>;
  logoutFromOAuth: () => Promise<void>;
}

// Verification Status Types
export interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  walletConnected: boolean;
  hasAnyVerification: boolean;
  canSkipSecondFactor: boolean;
}

export interface UseVerificationStatusResult {
  verificationStatus: VerificationStatus;
  checkAllVerificationStatus: () => Promise<void>;
  refreshVerificationStatus: () => Promise<void>;
} 