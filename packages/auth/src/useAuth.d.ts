import { UserRole } from './roleUtils';
export interface AuthUser {
    uid: string;
    email: string | null;
    displayName?: string;
    role: UserRole;
    kycStatus: 'pending' | 'verified' | 'rejected';
    createdAt: number;
    updatedAt: number;
}
export interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}
export interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    signup: (data: {
        email: string;
        password: string;
        confirmPassword: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        agreeToTerms: boolean;
    }) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    logout: (onLoggedOut?: () => void) => Promise<void>;
    clearError: () => void;
}
export interface UseAuthResult extends AuthState, AuthActions {
}
export declare const useAuth: () => UseAuthResult;
