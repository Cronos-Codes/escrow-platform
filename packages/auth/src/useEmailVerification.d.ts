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
export declare const useEmailVerification: () => EmailVerificationResult;
