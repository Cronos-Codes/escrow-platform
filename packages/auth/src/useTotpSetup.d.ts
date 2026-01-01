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
export declare const useTotpSetup: () => TotpSetupResult;
