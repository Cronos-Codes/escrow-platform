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
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
    title: 'Risk',
    href: '/admin/risk',
    icon: AlertTriangle,
    roles: ['ADMIN', 'OPERATOR'],
  },
  {
    title: 'Audit',
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

export function BottomNavigation() {
  const pathname = usePathname();
  const { userRoles } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const filteredItems = navigationItems.filter(item =>
    item.roles.some(role => userRoles.includes(role as any))
  );

  // Show first 4 items + more button
  const visibleItems = filteredItems.slice(0, 4);
  const hiddenItems = filteredItems.slice(4);

  const getItemIcon = (item: typeof navigationItems[0]) => {
    const IconComponent = item.icon;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <>
      {/* Main Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 min-w-0 flex-1 rounded-lg transition-all duration-200 touch-manipulation',
                'hover:bg-muted active:scale-95',
                pathname === item.href 
                  ? 'bg-escrow-primary text-escrow-primary-foreground shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {getItemIcon(item)}
              <span className="text-xs font-medium mt-1 truncate max-w-full">
                {item.title}
              </span>
              {pathname === item.href && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-escrow-primary-foreground rounded-full" />
              )}
            </Link>
          ))}
          
          {/* More Button */}
          {hiddenItems.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                'flex flex-col items-center justify-center p-2 min-w-0 flex-1 rounded-lg transition-all duration-200 touch-manipulation',
                'hover:bg-muted active:scale-95',
                showMore ? 'bg-escrow-primary text-escrow-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs font-medium mt-1">More</span>
            </button>
          )}
        </div>
      </nav>

      {/* More Items Popup */}
      {showMore && hiddenItems.length > 0 && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMore(false)}
          />
          
          {/* Popup Menu */}
          <div className="fixed bottom-20 left-4 right-4 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
              <div className="text-sm font-medium text-muted-foreground px-3 py-2 border-b border-border">
                More Options
              </div>
              {hiddenItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors touch-manipulation',
                    'hover:bg-muted active:bg-muted/80',
                    pathname === item.href 
                      ? 'bg-escrow-primary text-escrow-primary-foreground' 
                      : 'text-foreground'
                  )}
                  onClick={() => setShowMore(false)}
                >
                  {getItemIcon(item)}
                  <span className="font-medium">{item.title}</span>
                  {pathname === item.href && (
                    <div className="ml-auto w-2 h-2 bg-escrow-primary-foreground rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}


