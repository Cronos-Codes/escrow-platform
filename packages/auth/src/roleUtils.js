export var UserRole;
(function (UserRole) {
    UserRole["BUYER"] = "buyer";
    UserRole["SELLER"] = "seller";
    UserRole["BROKER"] = "broker";
    UserRole["SPONSOR"] = "sponsor";
    UserRole["ARBITER"] = "arbiter";
    UserRole["ADMIN"] = "admin";
})(UserRole || (UserRole = {}));
export const ROLE_PERMISSIONS = {
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
export const hasRole = (user, role) => {
    if (!user)
        return false;
    return user.role === role;
};
export const hasAnyRole = (user, roles) => {
    if (!user)
        return false;
    return roles.includes(user.role);
};
export const hasPermission = (user, permission) => {
    if (!user)
        return false;
    const userRole = user.role;
    return ROLE_PERMISSIONS[userRole]?.[permission] ?? false;
};
export const getUserPermissions = (user) => {
    if (!user)
        return null;
    const userRole = user.role;
    return ROLE_PERMISSIONS[userRole] ?? null;
};
export const isAdmin = (user) => hasRole(user, UserRole.ADMIN);
export const isArbiter = (user) => hasRole(user, UserRole.ARBITER);
export const isBroker = (user) => hasRole(user, UserRole.BROKER);
export const isSponsor = (user) => hasRole(user, UserRole.SPONSOR);
