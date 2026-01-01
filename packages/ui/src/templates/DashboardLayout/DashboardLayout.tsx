import React, { useState } from 'react';
import { Header } from '../../organisms/Header';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { cn } from '../../utils/cn';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface DashboardLayoutProps {
  /**
   * Header configuration
   */
  header?: {
    logo?: React.ReactNode;
    navigation?: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
      active?: boolean;
    }>;
    showSearch?: boolean;
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
    user?: {
      name: string;
      email?: string;
      avatar?: string;
    };
    userMenuItems?: Array<{
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
    }>;
    showNotifications?: boolean;
    notificationCount?: number;
    onNotificationClick?: () => void;
  };
  /**
   * Sidebar configuration
   */
  sidebar?: {
    items: SidebarItem[];
    collapsible?: boolean;
    defaultCollapsed?: boolean;
  };
  /**
   * Main content
   */
  children: React.ReactNode;
  /**
   * Footer content
   */
  footer?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show the sidebar
   */
  showSidebar?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  header,
  sidebar,
  children,
  footer,
  className,
  showSidebar = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    sidebar?.defaultCollapsed || false
  );

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div key={item.id}>
        <div
          className={cn(
            'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
            item.active && 'bg-blue-50 text-blue-700',
            !item.active && 'text-gray-700',
            level > 0 && 'ml-4'
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <div
            className="flex flex-1 items-center cursor-pointer"
            onClick={hasChildren ? () => setIsExpanded(!isExpanded) : item.onClick}
          >
            {item.icon && (
              <span className="mr-3 flex-shrink-0">{item.icon}</span>
            )}
            {(!isSidebarCollapsed || level > 0) && (
              <span className="flex-1">{item.label}</span>
            )}
            {item.badge && (!isSidebarCollapsed || level > 0) && (
              <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (!isSidebarCollapsed || level > 0) && (
            <Icon
              name="chevron-down"
              size="sm"
              className={cn(
                'transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </div>
        {hasChildren && isExpanded && (!isSidebarCollapsed || level > 0) && (
          <div className="mt-1">
            {item.children?.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex h-screen bg-gray-50', className)}>
      {/* Sidebar */}
      {showSidebar && sidebar && (
        <>
          {/* Desktop Sidebar */}
          <div
            className={cn(
              'hidden lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white',
              isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
              'transition-all duration-300'
            )}
          >
            {/* Sidebar Header */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              {!isSidebarCollapsed && sidebar.collapsible && (
                <div className="text-lg font-semibold text-gray-900">Menu</div>
              )}
              {sidebar.collapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSidebarToggle}
                  aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <Icon
                    name={isSidebarCollapsed ? 'chevron-right' : 'chevron-left'}
                    size="sm"
                  />
                </Button>
              )}
            </div>

            {/* Sidebar Content */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
              {sidebar.items.map((item) => renderSidebarItem(item))}
            </nav>
          </div>

          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-gray-600 bg-opacity-75"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
                {/* Mobile Sidebar Header */}
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
                  <div className="text-lg font-semibold text-gray-900">Menu</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <Icon name="x-mark" size="sm" />
                  </Button>
                </div>

                {/* Mobile Sidebar Content */}
                <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                  {sidebar.items.map((item) => renderSidebarItem(item))}
                </nav>
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        {header && (
          <Header
            {...header}
            onMobileMenuToggle={handleMobileMenuToggle}
            isMobileMenuOpen={isMobileMenuOpen}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </main>

        {/* Footer */}
        {footer && (
          <footer className="border-t border-gray-200 bg-white px-4 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export { DashboardLayout };