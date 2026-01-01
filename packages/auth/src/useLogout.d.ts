export interface LogoutResult {
    logout: (onLoggedOut?: () => void) => Promise<void>;
    isLoggingOut: boolean;
}
export declare const useLogout: () => LogoutResult;
