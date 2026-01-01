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
export interface LogoutResult {
    logout: () => Promise<void>;
    isLoggingOut: boolean;
}
export interface TokenRefreshResult {
    refreshToken: () => Promise<string | null>;
    isRefreshing: boolean;
}
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
