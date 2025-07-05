import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './theme';

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  className?: string;
}

const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  sidebarContent,
  headerContent,
  className = '',
}) => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }
    }
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${className}`}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Mobile overlay */}
            {isMobile && (
              <motion.div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <motion.aside
              className={`
                fixed lg:relative z-50 w-80 h-full
                bg-gradient-to-b from-black/90 to-gray-900/90
                border-r border-gold/20 backdrop-blur-xl
                ${theme === 'dark' 
                  ? 'bg-black/80 border-gold/20' 
                  : 'bg-white/90 border-gold/30'
                }
              `}
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between p-6 border-b border-gold/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-sm">G</span>
                  </div>
                  <span className="text-xl font-bold text-gold">Gold Escrow</span>
                </div>
                
                {/* Close button for mobile */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gold/10 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sidebar content */}
              <div className="flex-1 overflow-y-auto p-4">
                {sidebarContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          className={`
            h-16 px-6 flex items-center justify-between
            bg-gradient-to-r from-black/80 to-gray-900/80
            border-b border-gold/20 backdrop-blur-lg
            ${theme === 'dark' 
              ? 'bg-black/60 border-gold/20' 
              : 'bg-white/80 border-gold/30'
            }
          `}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Left side - Menu button and breadcrumb */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gold/10 transition-colors"
            >
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gold">Dashboard</h1>
            </div>
          </div>

          {/* Right side - Header content */}
          <div className="flex items-center space-x-4">
            {headerContent}
            
            {/* Theme toggle */}
            <button
              onClick={() => {/* Theme toggle will be implemented */}}
              className="p-2 rounded-lg hover:bg-gold/10 transition-colors"
            >
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </motion.header>

        {/* Main content */}
        <motion.main
          className="flex-1 overflow-y-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardShell; 