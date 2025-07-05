import React from 'react';
import { motion } from 'framer-motion';
import { User, UserRole, hasPermission } from '@escrow/auth';

interface DashboardShellProps {
  children: React.ReactNode;
  user: User;
  role: UserRole;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, user, role }) => {
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      roles: [UserRole.BUYER, UserRole.SELLER, UserRole.BROKER, UserRole.SPONSOR, UserRole.ARBITER, UserRole.ADMIN],
    },
    {
      name: 'Deals',
      href: '/deals',
      icon: '🤝',
      roles: [UserRole.BUYER, UserRole.SELLER, UserRole.BROKER, UserRole.ADMIN],
    },
    {
      name: 'Disputes',
      href: '/disputes',
      icon: '⚖️',
      roles: [UserRole.BUYER, UserRole.SELLER, UserRole.BROKER, UserRole.ARBITER, UserRole.ADMIN],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: '📈',
      roles: [UserRole.BROKER, UserRole.SPONSOR, UserRole.ARBITER, UserRole.ADMIN],
    },
    {
      name: 'Gas Sponsorship',
      href: '/sponsorship',
      icon: '⛽',
      roles: [UserRole.SPONSOR, UserRole.ADMIN],
    },
    {
      name: 'User Management',
      href: '/users',
      icon: '👥',
      roles: [UserRole.ADMIN],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: '⚙️',
      roles: [UserRole.BUYER, UserRole.SELLER, UserRole.BROKER, UserRole.SPONSOR, UserRole.ARBITER, UserRole.ADMIN],
    },
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 flex items-center"
              >
                <span className="text-2xl mr-2">🔒</span>
                <span className="text-xl font-bold text-gray-900">Escrow Platform</span>
              </motion.div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user.email || user.phone}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">User menu</span>
                <span className="text-xl">👤</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-64 bg-white shadow-sm border-r border-gray-200"
        >
          <nav className="mt-8">
            <div className="px-4 space-y-1">
              {filteredNavigation.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  whileHover={{ x: 4 }}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </motion.a>
              ))}
            </div>
          </nav>
        </motion.aside>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 p-8"
        >
          {children}
        </motion.main>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white border-t border-gray-200 py-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 Escrow Platform. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-gray-700">Privacy</a>
              <a href="/terms" className="hover:text-gray-700">Terms</a>
              <a href="/support" className="hover:text-gray-700">Support</a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}; 