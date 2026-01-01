import React from 'react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Avatar } from '../../atoms/Avatar';
import { SearchBox } from '../../molecules/SearchBox';
import { Dropdown } from '../../molecules/Dropdown';
import { cn } from '../../utils/cn';

export interface HeaderProps {
  /**
   * Logo or brand element
   */
  logo?: React.ReactNode;
  /**
   * Navigation items
   */
  navigation?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }>;
  /**
   * Whether to show search functionality
   */
  showSearch?: boolean;
  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;
  /**
   * Search callback
   */
  onSearch?: (query: string) => void;
  /**
   * User information
   */
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  /**
   * User menu items
   */
  userMenuItems?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
  /**
   * Whether to show notifications
   */
  showNotifications?: boolean;
  /**
   * Notification count
   */
  notificationCount?: number;
  /**
   * Notification click handler
   */
  onNotificationClick?: () => void;
  /**
   * Mobile menu toggle
   */
  onMobileMenuToggle?: () => void;
  /**
   * Whether mobile menu is open
   */
  isMobileMenuOpen?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the header is sticky
   */
  sticky?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  logo,
  navigation = [],
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
  user,
  userMenuItems = [],
  showNotifications = false,
  notificationCount = 0,
  onNotificationClick,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
  className,
  sticky = true,
}) => {
  const userDropdownOptions = userMenuItems.map((item, index) => ({
    value: index.toString(),
    label: item.label,
    icon: item.icon,
  }));

  const handleUserMenuSelect = (value: string) => {
    const index = parseInt(value, 10);
    userMenuItems[index]?.onClick();
  };

  return (
    <header
      className={cn(
        'border-b border-gray-200 bg-white',
        sticky && 'sticky top-0 z-40',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileMenuToggle}
                aria-label="Toggle mobile menu"
              >
                <Icon
                  name={isMobileMenuOpen ? 'x-mark' : 'chevron-down'}
                  size="md"
                />
              </Button>
            </div>

            {/* Logo */}
            {logo && <div className="flex-shrink-0">{logo}</div>}

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:space-x-8">
              {navigation.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={item.onClick}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors',
                    item.active
                      ? 'border-b-2 border-blue-500 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Center section - Search */}
          {showSearch && (
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <SearchBox
                placeholder={searchPlaceholder}
                onSearch={onSearch}
                size="sm"
              />
            </div>
          )}

          {/* Right section - Actions and User */}
          <div className="flex items-center space-x-4">
            {/* Mobile search button */}
            {showSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                aria-label="Search"
              >
                <Icon name="search" size="md" />
              </Button>
            )}

            {/* Notifications */}
            {showNotifications && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNotificationClick}
                  aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ''}`}
                >
                  <Icon name="information-circle" size="md" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* User Menu */}
            {user && (
              <div className="relative">
                <Dropdown
                  options={userDropdownOptions}
                  onChange={handleUserMenuSelect}
                  className="border-none shadow-none p-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 p-2"
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                  </div>
                  <Icon name="chevron-down" size="sm" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            {/* Mobile Search */}
            {showSearch && (
              <div className="mb-4">
                <SearchBox
                  placeholder={searchPlaceholder}
                  onSearch={onSearch}
                  size="sm"
                />
              </div>
            )}

            {/* Mobile Navigation Links */}
            <nav className="space-y-1">
              {navigation.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={item.onClick}
                  className={cn(
                    'block px-3 py-2 text-base font-medium rounded-md transition-colors',
                    item.active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export { Header };