import { User } from './index';
export declare enum UserRole {
    BUYER = "buyer",
    SELLER = "seller",
    BROKER = "broker",
    SPONSOR = "sponsor",
    ARBITER = "arbiter",
    ADMIN = "admin"
}
export interface RolePermissions {
    canCreateDeals: boolean;
    canApproveDeals: boolean;
    canDisputeDeals: boolean;
    canArbitrate: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canSponsorGas: boolean;
}
export declare const ROLE_PERMISSIONS: Record<UserRole, RolePermissions>;
export declare const hasRole: (user: User | null, role: UserRole) => boolean;
export declare const hasAnyRole: (user: User | null, roles: UserRole[]) => boolean;
export declare const hasPermission: (user: User | null, permission: keyof RolePermissions) => boolean;
export declare const getUserPermissions: (user: User | null) => RolePermissions | null;
export declare const isAdmin: (user: User | null) => boolean;
export declare const isArbiter: (user: User | null) => boolean;
export declare const isBroker: (user: User | null) => boolean;
export declare const isSponsor: (user: User | null) => boolean;
