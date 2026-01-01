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
export declare const useOtpResend: () => OtpResendResult;
