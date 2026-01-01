import { UserRole } from '@escrow/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string;
  role: UserRole;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: number;
  updatedAt: number;
}

export const getDashboardRoute = (user: AuthUser | null): string => {
  if (!user) {
    return '/';
  }

  switch (user.role) {
    case UserRole.ADMIN:
      return '/admin/panel';
    case UserRole.ARBITER:
      return '/admin/panel'; // Arbiters can access admin panel for dispute management
    case UserRole.BROKER:
      return '/dashboard'; // Brokers get the main dashboard with analytics
    case UserRole.SPONSOR:
      return '/admin/panel'; // Sponsors access admin panel for gas sponsorship
    case UserRole.SELLER:
      return '/dashboard'; // Sellers get the main dashboard
    case UserRole.BUYER:
      return '/dashboard'; // Buyers get the main dashboard
    default:
      return '/dashboard';
  }
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.ARBITER:
      return 'Arbiter';
    case UserRole.BROKER:
      return 'Broker';
    case UserRole.SPONSOR:
      return 'Gas Sponsor';
    case UserRole.SELLER:
      return 'Seller';
    case UserRole.BUYER:
      return 'Buyer';
    default:
      return 'User';
  }
};

export const getWelcomeMessage = (user: AuthUser | null): string => {
  if (!user) {
    return 'Welcome to Gold Escrow';
  }

  const roleName = getRoleDisplayName(user.role);
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  
  return `Welcome back, ${displayName}! You are logged in as a ${roleName}.`;
};
