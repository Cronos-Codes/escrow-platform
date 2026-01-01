import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@escrow/auth';
import { UserRole } from '@escrow/auth';
import { Button } from '@escrow/ui';
import { EnhancedAuthCard } from '../auth/EnhancedAuthCard';
import { useDeviceOptimization, useAnimationConfig, useTouchConfig } from '../../hooks/useDeviceOptimization';
import {
  NAVIGATION_CONFIG,
  QUICK_ACTIONS_CONFIG,
  getNavigationForRole,
  getQuickActionsForRole,
  filterNavigationByRole,
  isNavigationItemActive,
  type NavItem,
} from '../../config/navigation';

// Luxury Icons with premium styling
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Luxury diamond icon for premium features
const DiamondIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L15.09 8.26L22 9L15.09 9.74L12 16L8.91 9.74L2 9L8.91 8.26L12 2Z" />
  </svg>
);

// Notification interface
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'premium';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
  metadata?: {
    escrowId?: string;
    userId?: string;
    amount?: string;
    status?: string;
  };
}

// Mock notifications based on user role
const generateMockNotifications = (userRole: string): Notification[] => {
  const baseNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Escrow Completed',
      message: 'Escrow #ESC-2024-002 has been successfully completed',
      timestamp: new Date(Date.now() - 7200000),
      read: false,
      metadata: {
        escrowId: 'ESC-2024-002',
        amount: '50,000 USDC',
        status: 'completed'
      }
    },
    {
      id: '2',
      type: 'premium',
      title: 'VIP Transaction',
      message: 'High-value transaction processed with premium security',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      metadata: {
        escrowId: 'ESC-2024-003',
        amount: '250,000 USDC',
        status: 'premium'
      }
    }
  ];

  // Role-specific notifications
  if (userRole === UserRole.ADMIN) {
    baseNotifications.unshift(
      {
        id: '3',
        type: 'warning',
        title: 'New Dispute Filed',
        message: 'Dispute #ESC-2024-001 requires attention',
        timestamp: new Date(),
        read: false,
        action: { label: 'Review', href: '/admin/disputes/ESC-2024-001' },
        metadata: {
          escrowId: 'ESC-2024-001',
          userId: 'user123',
          status: 'disputed'
        }
      },
      {
        id: '4',
        type: 'error',
        title: 'Paymaster Balance Low',
        message: 'Paymaster balance is below threshold',
        timestamp: new Date(Date.now() - 1800000),
        read: false,
        action: { label: 'Top Up', href: '/paymaster/topup' },
        metadata: {
          amount: '1,000 USDC',
          status: 'low_balance'
        }
      }
    );
  }

  if (userRole === UserRole.BROKER) {
    baseNotifications.unshift(
      {
        id: '5',
        type: 'premium',
        title: 'Commission Earned',
        message: 'You earned 2.5% commission on ESC-2024-004',
        timestamp: new Date(Date.now() - 900000),
        read: false,
        action: { label: 'View Details', href: '/broker/commissions' },
        metadata: {
          escrowId: 'ESC-2024-004',
          amount: '1,250 USDC',
          status: 'commission_earned'
        }
      }
    );
  }

  if (userRole === UserRole.SPONSOR) {
    baseNotifications.unshift(
      {
        id: '6',
        type: 'warning',
        title: 'Gas Sponsorship Limit',
        message: 'You are approaching your daily gas sponsorship limit',
        timestamp: new Date(Date.now() - 300000),
        read: false,
        action: { label: 'Adjust Limits', href: '/paymaster/settings' },
        metadata: {
          amount: '0.5 ETH',
          status: 'limit_warning'
        }
      }
    );
  }

  return baseNotifications;
};

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const touchConfig = useTouchConfig();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine user role and navigation items
  const userRole = user?.role || 'guest';
  const isGuest = !user;
  const isAdmin = userRole === UserRole.ADMIN;
  const isBroker = userRole === UserRole.BROKER;
  const isUser = [UserRole.BUYER, UserRole.SELLER].includes(userRole as UserRole);

  // Get navigation items for current role
  const navigationItems = getNavigationForRole(userRole);
  const quickActions = getQuickActionsForRole(userRole);

  // Filter navigation items by role permissions
  const filteredNavigationItems = filterNavigationByRole(navigationItems, userRole);
  const filteredQuickActions = filterNavigationByRole(quickActions, userRole);

  // Check if current route is active
  const isActiveRoute = useCallback((href: string) => {
    return isNavigationItemActive({ href } as NavItem, router.pathname);
  }, [router.pathname]);

  // Handle notification dismissal
  const dismissNotification = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [notifications]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    setIsProfileDropdownOpen(false);
    router.push('/');
  }, [logout, router]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      const mockNotifications = generateMockNotifications(user.role);
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Simulate real-time updates for admin users
  useEffect(() => {
    if (!user || user.role !== UserRole.ADMIN) return;

    const interval = setInterval(() => {
      // Randomly add new notifications for demo purposes
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const newNotificationTypes = [
          {
            type: 'warning' as const,
            title: 'New Dispute Filed',
            message: `Dispute #ESC-${Date.now().toString().slice(-6)} requires attention`,
          },
          {
            type: 'info' as const,
            title: 'Escrow Created',
            message: `New escrow #ESC-${Date.now().toString().slice(-6)} has been created`,
          },
          {
            type: 'success' as const,
            title: 'Transaction Completed',
            message: `Transaction #TXN-${Date.now().toString().slice(-6)} completed successfully`,
          }
        ];

        const randomNotification = newNotificationTypes[Math.floor(Math.random() * newNotificationTypes.length)];
        const newNotification: Notification = {
          ...randomNotification,
          id: `notification-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          read: false,
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Luxury animation variants
  const mobileMenuVariants = {
    closed: { opacity: 0, x: '100%' },
    open: { opacity: 1, x: 0 },
  };

  const dropdownVariants = {
    closed: { opacity: 0, y: -10, scale: 0.95 },
    open: { opacity: 1, y: 0, scale: 1 },
  };

  const notificationVariants = {
    closed: { opacity: 0, y: -10, scale: 0.95 },
    open: { opacity: 1, y: 0, scale: 1 },
  };

  const logoVariants = {
    hover: { 
      scale: 1.05,
      rotate: [0, -2, 2, 0],
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      {/* Luxury Navbar with premium styling */}
      <nav className={`w-full bg-gradient-to-r from-black/98 via-gray-900/95 to-black/98 shadow-2xl z-50 ${className} ${
        device.isLowEnd ? '' : 'backdrop-blur-xl'
      }`}
           style={{
             background: 'linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(17,17,17,0.95) 50%, rgba(0,0,0,0.98) 100%)',
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 215, 0, 0.1)',
             paddingTop: 'env(safe-area-inset-top)',
             borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
           }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${device.isMobile ? 'h-16' : 'h-20'}`}>
            {/* Luxury Logo with premium animations */}
            <motion.div
              variants={logoVariants}
              whileHover="hover"
              className="flex items-center space-x-4"
            >
              <Link href="/" className={`flex items-center space-x-2 sm:space-x-3 group ${device.supportsTouch ? 'touch-manipulation' : ''}`}>
                <motion.div 
                  className={`relative ${device.isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-gold via-yellow-400 to-gold ${device.isMobile ? 'rounded-xl' : 'rounded-2xl'} flex items-center justify-center font-bold text-black ${device.isMobile ? 'text-xl' : 'text-2xl'} shadow-2xl overflow-hidden`}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                    boxShadow: '0 10px 30px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}
                  whileHover={touchConfig.enableHover ? { 
                    rotate: 5, 
                    scale: 1.1,
                    boxShadow: '0 15px 40px rgba(255, 215, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  } : {}}
                  transition={{ type: "spring", ...animationConfig.springConfig }}
                >
                  <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">G</span>
                  {/* Luxury shine effect */}
                  {!device.isLowEnd && (
                    <>
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-2xl"
                        animate={{ 
                          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      />
                      {/* Enhanced ambient glow around logo with pulsing effect */}
                      <motion.div 
                        className="absolute inset-0 rounded-2xl -z-10"
                        animate={{
                          opacity: [0.3, 0.5, 0.3],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{ 
                          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.15) 50%, transparent 100%)',
                          filter: 'blur(10px)'
                        }} 
                      />
                    </>
                  )}
                </motion.div>
                <div className="flex flex-col">
                  <span className={`${device.isMobile ? 'text-lg sm:text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent tracking-wider ${touchConfig.enableHover ? 'group-hover:from-yellow-300 group-hover:to-gold' : ''} transition-all duration-500`}>
                    Gold Escrow
                  </span>
                  {!device.isMobile && (
                    <span className="text-xs text-gold/70 font-medium tracking-widest uppercase">PREMIUM PLATFORM</span>
                  )}
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation with luxury styling */}
            <div className="hidden md:flex items-center space-x-2">
              {filteredNavigationItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-500 group ${
                      isActiveRoute(item.href)
                        ? 'text-gold'
                        : 'text-gray-300 hover:text-gold'
                    }`}
                    style={{
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {item.label}
                    {/* Enhanced golden underline animation - slides in/out on hover */}
                    {isActiveRoute(item.href) ? (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{ 
                          boxShadow: '0 0 12px rgba(255, 215, 0, 0.6), 0 0 6px rgba(255, 215, 0, 0.4)',
                          background: 'linear-gradient(to right, transparent, #D4AF37, #FFD700, #D4AF37, transparent)'
                        }}
                      />
                    ) : (
                      <motion.div
                        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-gold to-yellow-500 w-0"
                        whileHover={touchConfig.enableHover ? { width: '100%' } : {}}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{
                          boxShadow: '0 0 8px rgba(255, 215, 0, 0.4)'
                        }}
                      />
                    )}
                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                        style={{ boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                    {/* Luxury hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Section with premium styling */}
            <div className="flex items-center space-x-3">
              {/* Quick Actions for authenticated users */}
              {!isGuest && filteredQuickActions.length > 0 && (
                <div className="hidden lg:flex items-center space-x-3">
                  {filteredQuickActions.map((action, index) => (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={action.href}
                        className="px-4 py-2 bg-gradient-to-r from-gold/20 to-yellow-500/20 text-gold rounded-xl font-semibold hover:from-gold/30 hover:to-yellow-500/30 transition-all duration-500 border border-gold/30 hover:border-gold/50 shadow-lg hover:shadow-xl"
                        style={{
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
                        }}
                      >
                        <span className="flex items-center space-x-2">
                          <DiamondIcon />
                          <span>{action.label}</span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Luxury Notifications */}
              {!isGuest && (
                <div className="relative">
                  <motion.button
                    whileHover={touchConfig.enableHover ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`relative ${device.isMobile ? 'p-2.5' : 'p-3'} rounded-xl text-gold ${touchConfig.enableHover ? 'hover:bg-gradient-to-r hover:from-gold/20 hover:to-yellow-500/20 hover:border-gold/40' : 'active:bg-gradient-to-r active:from-gold/20 active:to-yellow-500/20'} transition-all duration-500 border border-gold/20 min-w-touch min-h-touch ${device.supportsTouch ? 'touch-manipulation' : ''}`}
                    style={{
                      backdropFilter: device.isLowEnd ? 'none' : 'blur(10px)',
                      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.15)'
                    }}
                    aria-label="Notifications"
                  >
                    <BellIcon />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                        style={{ boxShadow: '0 4px 15px rgba(239, 68, 68, 0.6)' }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </motion.span>
                    )}
                  </motion.button>

                  {/* Luxury Notifications Dropdown */}
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        variants={notificationVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`absolute right-0 mt-3 ${device.isMobile ? 'w-[calc(100vw-2rem)] max-w-sm' : 'w-96'} bg-black/95 border border-gold/30 rounded-2xl shadow-2xl z-50 ${
                          device.isLowEnd ? '' : 'backdrop-blur-xl'
                        }`}
                        style={{
                          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(17,17,17,0.95) 100%)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 215, 0, 0.2)'
                        }}
                      >
                        <div className="p-6 border-b border-gold/20">
                          <h3 className="text-gold font-bold text-lg flex items-center space-x-2">
                            <DiamondIcon />
                            <span>Notifications</span>
                          </h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 border-b border-gold/10 hover:bg-gradient-to-r hover:from-gold/5 hover:to-yellow-500/5 transition-all duration-300"
                              >
                                <div className="flex items-start space-x-4">
                                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                    notification.type === 'success' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                    notification.type === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-orange-600' :
                                    notification.type === 'error' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                    notification.type === 'premium' ? 'bg-gradient-to-r from-gold to-yellow-500' :
                                    'bg-gradient-to-r from-blue-400 to-blue-600'
                                  }`} 
                                  style={{ boxShadow: '0 0 10px currentColor' }}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-white">{notification.title}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {notification.timestamp.toLocaleTimeString()}
                                    </p>
                                    {notification.action && (
                                      <Link
                                        href={notification.action.href}
                                        className="text-xs text-gold hover:text-yellow-400 mt-3 inline-block font-semibold"
                                        onClick={() => dismissNotification(notification.id)}
                                      >
                                        {notification.action.label}
                                      </Link>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => dismissNotification(notification.id)}
                                    className="text-gray-500 hover:text-white transition-colors text-lg"
                                  >
                                    ×
                                  </button>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="p-6 text-center text-gray-400">
                              <DiamondIcon />
                              <p className="mt-2">No notifications</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Luxury Auth Section */}
              {loading ? (
                <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              ) : user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-3 p-3 rounded-xl text-gold hover:bg-gradient-to-r hover:from-gold/20 hover:to-yellow-500/20 transition-all duration-500 border border-gold/20 hover:border-gold/40"
                    style={{
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.15)'
                    }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-gold via-yellow-400 to-gold rounded-xl flex items-center justify-center text-black font-bold text-lg shadow-lg"
                         style={{
                           background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                           boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)'
                         }}>
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold">{user.email}</span>
                    <motion.div
                      animate={{ rotate: isProfileDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon />
                    </motion.div>
                  </motion.button>

                  {/* Luxury Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`absolute right-0 mt-3 ${device.isMobile ? 'w-[calc(100vw-2rem)] max-w-xs' : 'w-64'} bg-black/95 border border-gold/30 rounded-2xl shadow-2xl z-50 ${
                          device.isLowEnd ? '' : 'backdrop-blur-xl'
                        }`}
                        style={{
                          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(17,17,17,0.95) 100%)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 215, 0, 0.2)'
                        }}
                      >
                        <div className="p-6 border-b border-gold/20">
                          <p className="text-white font-semibold">{user.email}</p>
                          <p className="text-xs text-gold capitalize font-medium">{user.role}</p>
                        </div>
                        <div className="p-3">
                          <Link
                            href="/profile"
                            className="block w-full text-left px-4 py-3 text-gray-300 hover:text-gold hover:bg-gradient-to-r hover:from-gold/10 hover:to-yellow-500/10 rounded-xl transition-all duration-300 font-medium"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Profile Settings
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin/panel"
                              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-gold hover:bg-gradient-to-r hover:from-gold/10 hover:to-yellow-500/10 rounded-xl transition-all duration-300 font-medium"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 rounded-xl transition-all duration-300 font-medium"
                          >
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={touchConfig.enableHover ? { scale: 1.05, y: -2 } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAuthModalOpen(true)}
                  className={`${device.isMobile ? 'px-6 py-2.5 text-sm' : 'px-8 py-3'} bg-gradient-to-r from-gold via-yellow-400 to-gold text-black font-bold rounded-xl shadow-2xl ${touchConfig.enableHover ? 'hover:shadow-3xl hover:-translate-y-1' : 'active:shadow-3xl active:-translate-y-0.5'} transition-all duration-500 transform min-h-touch ${device.supportsTouch ? 'touch-manipulation' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                    boxShadow: '0 15px 35px rgba(255, 215, 0, 0.4)'
                  }}
                >
                  <span className={device.isMobile ? 'text-sm' : ''}>Login / Sign Up</span>
                </motion.button>
              )}

              {/* Luxury Mobile Menu Button */}
              <motion.button
                whileHover={touchConfig.enableHover ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden ${device.isMobile ? 'p-2.5' : 'p-3'} rounded-xl text-gold ${touchConfig.enableHover ? 'hover:bg-gradient-to-r hover:from-gold/20 hover:to-yellow-500/20 hover:border-gold/40' : 'active:bg-gradient-to-r active:from-gold/20 active:to-yellow-500/20'} transition-all duration-500 border border-gold/20 min-w-touch min-h-touch touch-manipulation`}
                style={{
                  backdropFilter: device.isLowEnd ? 'none' : 'blur(10px)',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.15)'
                }}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CloseIcon />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MenuIcon />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Luxury Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", ...animationConfig.springConfig }}
              className={`md:hidden fixed top-${device.isMobile ? '16' : '20'} left-0 right-0 bottom-0 bg-black/95 border-t border-gold/30 z-50 overflow-y-auto ${
                device.isLowEnd ? '' : 'backdrop-blur-xl'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(17,17,17,0.95) 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-3 sm:space-y-4">
                {filteredNavigationItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={`block px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-500 min-h-touch flex items-center ${
                        isActiveRoute(item.href)
                          ? 'text-gold bg-gradient-to-r from-gold/20 to-yellow-500/20 border border-gold/30'
                          : 'text-gray-300 active:text-gold active:bg-gradient-to-r active:from-gold/10 active:to-yellow-500/10 active:border active:border-gold/20'
                      } ${device.supportsTouch ? 'touch-manipulation' : 'hover:text-gold hover:bg-gradient-to-r hover:from-gold/10 hover:to-yellow-500/10 hover:border hover:border-gold/20'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        backdropFilter: device.isLowEnd ? 'none' : 'blur(10px)',
                        boxShadow: isActiveRoute(item.href) 
                          ? '0 10px 30px rgba(255, 215, 0, 0.3)' 
                          : '0 4px 15px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {item.label}
                      {item.badge && (
                        <span className="ml-3 px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Quick Actions in Mobile */}
                {!isGuest && filteredQuickActions.length > 0 && (
                  <div className="pt-6 border-t border-gold/20">
                    <h3 className="px-6 text-sm font-bold text-gold mb-4 flex items-center space-x-2">
                      <DiamondIcon />
                      <span>Quick Actions</span>
                    </h3>
                    <div className="space-y-3">
                      {filteredQuickActions.map((action, index) => (
                        <motion.div
                          key={action.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index + filteredNavigationItems.length) * 0.1 }}
                        >
                          <Link
                            href={action.href}
                            className="block px-6 py-4 bg-gradient-to-r from-gold/20 to-yellow-500/20 text-gold rounded-xl font-semibold hover:from-gold/30 hover:to-yellow-500/30 transition-all duration-500 border border-gold/30"
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                              backdropFilter: 'blur(10px)',
                              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
                            }}
                          >
                            <span className="flex items-center space-x-3">
                              <DiamondIcon />
                              <span>{action.label}</span>
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Luxury Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsAuthModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <EnhancedAuthCard />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside handlers */}
      {(isNotificationsOpen || isProfileDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsNotificationsOpen(false);
            setIsProfileDropdownOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;
