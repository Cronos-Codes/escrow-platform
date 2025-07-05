import { User } from './index';

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  BROKER = 'broker',
  SPONSOR = 'sponsor',
  ARBITER = 'arbiter',
  ADMIN = 'admin',
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

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.BUYER]: {
    canCreateDeals: true,
    canApproveDeals: false,
    canDisputeDeals: true,
    canArbitrate: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canSponsorGas: false,
  },
  [UserRole.SELLER]: {
    canCreateDeals: true,
    canApproveDeals: true,
    canDisputeDeals: true,
    canArbitrate: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canSponsorGas: false,
  },
  [UserRole.BROKER]: {
    canCreateDeals: true,
    canApproveDeals: true,
    canDisputeDeals: true,
    canArbitrate: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canSponsorGas: false,
  },
  [UserRole.SPONSOR]: {
    canCreateDeals: false,
    canApproveDeals: false,
    canDisputeDeals: false,
    canArbitrate: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canSponsorGas: true,
  },
  [UserRole.ARBITER]: {
    canCreateDeals: false,
    canApproveDeals: false,
    canDisputeDeals: false,
    canArbitrate: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canSponsorGas: false,
  },
  [UserRole.ADMIN]: {
    canCreateDeals: true,
    canApproveDeals: true,
    canDisputeDeals: true,
    canArbitrate: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canSponsorGas: true,
  },
};

export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;
  return user.role === role;
};

export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
};

export const hasPermission = (user: User | null, permission: keyof RolePermissions): boolean => {
  if (!user) return false;
  const userRole = user.role as UserRole;
  return ROLE_PERMISSIONS[userRole]?.[permission] ?? false;
};

export const getUserPermissions = (user: User | null): RolePermissions | null => {
  if (!user) return null;
  const userRole = user.role as UserRole;
  return ROLE_PERMISSIONS[userRole] ?? null;
};

export const isAdmin = (user: User | null): boolean => hasRole(user, UserRole.ADMIN);
export const isArbiter = (user: User | null): boolean => hasRole(user, UserRole.ARBITER);
export const isBroker = (user: User | null): boolean => hasRole(user, UserRole.BROKER);
export const isSponsor = (user: User | null): boolean => hasRole(user, UserRole.SPONSOR); 