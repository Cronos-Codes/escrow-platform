import { UserCredential } from 'firebase/auth';
export interface PhoneOtpState {
    loading: boolean;
    error: string | null;
    success: boolean;
    verificationId: string | null;
}
export interface PhoneOtpResult {
    state: PhoneOtpState;
    sendOtp: (phoneNumber: string) => Promise<void>;
    verifyOtp: (otpCode: string) => Promise<UserCredential | null>;
    reset: () => void;
}
export declare const usePhoneOtp: () => PhoneOtpResult;
