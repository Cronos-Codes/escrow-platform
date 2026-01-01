export interface TokenRefreshResult {
    refreshToken: () => Promise<string | null>;
    isRefreshing: boolean;
}
export declare const useTokenRefresh: () => TokenRefreshResult;
