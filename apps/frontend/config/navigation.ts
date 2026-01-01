import { UserRole } from '@escrow/auth';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  tooltip?: string;
  quickAction?: boolean;
  requiresAuth?: boolean;
  roles?: UserRole[];
  children?: NavItem[];
  external?: boolean;
  disabled?: boolean;
}

export interface NavigationConfig {
  [key: string]: NavItem[];
}

// Main navigation configuration
export const NAVIGATION_CONFIG: NavigationConfig = {
  guest: [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Features', href: '/features' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  user: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Active Escrows', href: '/escrows/active', icon: 'escrow' },
    { label: 'Past Transactions', href: '/transactions', icon: 'history' },
    { label: 'Disputes', href: '/disputes', icon: 'dispute' },
    { label: 'Paymaster', href: '/paymaster', icon: 'paymaster', roles: [UserRole.SPONSOR] },
    { label: 'Profile', href: '/profile', icon: 'profile' },
  ],
  broker: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Broker Tools', href: '/broker/tools', icon: 'tools' },
    { label: 'Assigned Escrows', href: '/broker/escrows', icon: 'escrow' },
    { label: 'Commission Tracker', href: '/broker/commissions', icon: 'commission' },
    { label: 'Client Management', href: '/broker/clients', icon: 'users' },
    { label: 'Profile', href: '/profile', icon: 'profile' },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Admin Panel', href: '/admin/panel', icon: 'admin' },
    { label: 'User Management', href: '/admin/users', icon: 'users' },
    { label: 'Escrow Oversight', href: '/admin/escrows', icon: 'oversight' },
    { label: 'Dispute Assignment', href: '/admin/disputes', icon: 'disputes' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
    { label: 'System Settings', href: '/admin/settings', icon: 'settings' },
    { label: 'Profile', href: '/profile', icon: 'profile' },
  ],
  arbiter: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Active Disputes', href: '/arbiter/disputes', icon: 'dispute' },
    { label: 'Dispute History', href: '/arbiter/history', icon: 'history' },
    { label: 'Arbitration Tools', href: '/arbiter/tools', icon: 'tools' },
    { label: 'Profile', href: '/profile', icon: 'profile' },
  ],
  sponsor: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Paymaster', href: '/paymaster', icon: 'paymaster' },
    { label: 'Gas Analytics', href: '/sponsor/analytics', icon: 'analytics' },
    { label: 'Settings', href: '/sponsor/settings', icon: 'settings' },
    { label: 'Profile', href: '/profile', icon: 'profile' },
  ],
};

// Quick actions configuration
export const QUICK_ACTIONS_CONFIG: NavigationConfig = {
  user: [
    { label: 'Create Escrow', href: '/escrow/create', quickAction: true, icon: 'plus' },
    { label: 'Join Escrow', href: '/escrow/join', quickAction: true, icon: 'join' },
    { label: 'View Balance', href: '/wallet', quickAction: true, icon: 'wallet' },
  ],
  broker: [
    { label: 'Create Escrow', href: '/escrow/create', quickAction: true, icon: 'plus' },
    { label: 'Assign Arbitrator', href: '/admin/assign-arbitrator', quickAction: true, icon: 'assign' },
    { label: 'View Commissions', href: '/broker/commissions', quickAction: true, icon: 'commission' },
  ],
  admin: [
    { label: 'Force Release', href: '/admin/force-release', quickAction: true, icon: 'force' },
    { label: 'Cancel Escrow', href: '/admin/cancel-escrow', quickAction: true, icon: 'cancel' },
    { label: 'Assign Arbitrator', href: '/admin/assign-arbitrator', quickAction: true, icon: 'assign' },
    { label: 'System Health', href: '/admin/health', quickAction: true, icon: 'health' },
  ],
  arbiter: [
    { label: 'Review Dispute', href: '/arbiter/review', quickAction: true, icon: 'review' },
    { label: 'Make Decision', href: '/arbiter/decision', quickAction: true, icon: 'decision' },
  ],
  sponsor: [
    { label: 'Top Up Balance', href: '/paymaster/topup', quickAction: true, icon: 'topup' },
    { label: 'Adjust Limits', href: '/paymaster/limits', quickAction: true, icon: 'limits' },
  ],
};

// Footer navigation configuration
export const FOOTER_NAVIGATION: NavigationConfig = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  product: [
    { label: 'Features', href: '/features' },
    { label: 'API', href: '/api', external: true },
    { label: 'Documentation', href: '/docs', external: true },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Community', href: '/community' },
    { label: 'Status', href: '/status' },
    { label: 'Security', href: '/security' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
    { label: 'Cookie Policy', href: '/legal/cookies' },
    { label: 'GDPR', href: '/legal/gdpr' },
  ],
};

// Utility functions for navigation
export const getNavigationForRole = (role: string): NavItem[] => {
  return NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.guest;
};

export const getQuickActionsForRole = (role: string): NavItem[] => {
  return QUICK_ACTIONS_CONFIG[role] || [];
};

export const filterNavigationByRole = (items: NavItem[], userRole: string): NavItem[] => {
  return items.filter(item => {
    // If no specific roles are required, show to all
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    
    // Check if user has any of the required roles
    return item.roles.includes(userRole as UserRole);
  });
};

export const isNavigationItemActive = (item: NavItem, currentPath: string): boolean => {
  if (item.href === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(item.href);
};

export const getNavigationWithBadges = (items: NavItem[], badges: Record<string, string>): NavItem[] => {
  return items.map(item => ({
    ...item,
    badge: badges[item.href] || item.badge,
  }));
};
