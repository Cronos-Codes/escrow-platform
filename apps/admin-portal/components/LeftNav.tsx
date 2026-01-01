'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Gavel, 
  CreditCard, 
  AlertTriangle, 
  FileText, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { cn } from '@/lib/utils';

interface LeftNavProps {
  isOpen: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'OPERATOR', 'ARBITER', 'SUPPORT'],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['ADMIN', 'OPERATOR'],
  },
  {
    title: 'Escrows',
    href: '/admin/escrows',
    icon: Shield,
    roles: ['ADMIN', 'OPERATOR', 'ARBITER'],
  },
  {
    title: 'Disputes',
    href: '/admin/disputes',
    icon: Gavel,
    roles: ['ADMIN', 'OPERATOR', 'ARBITER'],
  },
  {
    title: 'Paymaster',
    href: '/admin/paymaster',
    icon: CreditCard,
    roles: ['ADMIN', 'OPERATOR'],
  },
  {
    title: 'Risk Center',
    href: '/admin/risk',
    icon: AlertTriangle,
    roles: ['ADMIN', 'OPERATOR'],
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit',
    icon: FileText,
    roles: ['ADMIN', 'OPERATOR', 'ARBITER', 'SUPPORT'],
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

export function LeftNav({ isOpen, isMobile = false, isTablet = false, onClose }: LeftNavProps) {
  const pathname = usePathname();
  const { userRoles } = useAuth();

  const filteredItems = navigationItems.filter(item =>
    item.roles.some(role => userRoles.includes(role as any))
  );

  // Mobile/Tablet overlay navigation
  if (isMobile || isTablet) {
    return (
      <nav className={cn(
        'fixed left-0 top-16 h-full bg-card border-r border-border z-40 transition-all duration-300 ease-in-out',
        isOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64',
        isMobile ? 'shadow-2xl' : 'shadow-lg'
      )}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Close button for mobile */}
          {isMobile && (
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors hover:bg-muted touch-manipulation',
                  pathname === item.href 
                    ? 'bg-escrow-primary text-escrow-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={isMobile ? onClose : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.title}</span>
                {pathname === item.href && (
                  <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0" />
                )}
              </Link>
            ))}
          </div>

          {/* User Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="px-3 py-2">
              <div className="text-sm font-medium text-foreground mb-2">Your Roles</div>
              <div className="space-y-1">
                {userRoles.map((role) => (
                  <div
                    key={role}
                    className="text-xs px-2 py-1 bg-escrow-primary/10 text-escrow-primary rounded"
                  >
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Desktop navigation
  if (!isOpen) {
    return (
      <nav className="fixed left-0 top-16 h-full w-16 bg-card border-r border-border z-40">
        <div className="flex flex-col items-center py-4 space-y-2">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'p-3 rounded-lg transition-colors hover:bg-muted group relative',
                pathname === item.href ? 'bg-escrow-primary text-escrow-primary-foreground' : 'text-muted-foreground'
              )}
              title={item.title}
            >
              <item.icon className="h-5 w-5" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item.title}
              </div>
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed left-0 top-16 h-full w-64 bg-card border-r border-border z-40 overflow-y-auto">
      <div className="p-4">
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted',
                pathname === item.href 
                  ? 'bg-escrow-primary text-escrow-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
              {pathname === item.href && (
                <ChevronRight className="h-4 w-4 ml-auto" />
              )}
            </Link>
          ))}
        </div>

        {/* User Info */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-foreground">Your Roles</div>
            <div className="mt-2 space-y-1">
              {userRoles.map((role) => (
                <div
                  key={role}
                  className="text-xs px-2 py-1 bg-escrow-primary/10 text-escrow-primary rounded"
                >
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
