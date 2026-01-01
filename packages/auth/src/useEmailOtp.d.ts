import { UserCredential } from 'firebase/auth';
export interface EmailOtpState {
    loading: boolean;
    error: string | null;
    success: boolean;
    emailSent: boolean;
}
export interface EmailOtpResult {
    state: EmailOtpState;
    sendEmailLink: (email: string) => Promise<void>;
    verifyEmailLink: () => Promise<UserCredential | null>;
    reset: () => void;
}
export declare const useEmailOtp: () => EmailOtpResult;
