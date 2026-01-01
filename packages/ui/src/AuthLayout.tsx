import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  logo,
  className,
}) => {
  return (
    <div className={`min-h-screen relative ${className || ''}`} style={{ background: 'linear-gradient(135deg, #1C2A39 0%, #0F1419 100%)' }}>
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </div>

        {/* Main content */}
        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Logo and header */}
          {(logo || title || subtitle) && (
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {logo && (
                <motion.div
                  className="mb-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {logo}
                </motion.div>
              )}
              
              {title && (
                <motion.h1
                  className="text-4xl font-bold text-white mb-2"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                >
                  {title}
                </motion.h1>
              )}
              
              {subtitle && (
                <motion.p
                  className="text-white/70 text-lg"
                  style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
                >
                  {subtitle}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Auth content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}; 