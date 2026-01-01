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
export declare const useOAuthLogin: () => OAuthResult;
export declare const getOAuthConfig: (provider: OAuthProvider) => OAuthConfig;
export declare const buildOAuthUrl: (config: OAuthConfig) => string;
