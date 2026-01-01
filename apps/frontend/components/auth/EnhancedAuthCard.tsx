"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@escrow/auth';
import { FaTimes, FaShieldAlt, FaGem, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { SignupFlow } from './SignupFlow';
import { SigninFlow } from './SigninFlow';

interface EnhancedAuthCardProps {
  onClose?: () => void;
  onError?: (error: string) => void;
}

export const EnhancedAuthCard = ({ onClose, onError }: EnhancedAuthCardProps) => {
  const [activeMode, setActiveMode] = useState<'signup' | 'signin'>('signin');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const handleError = (error: string) => {
    console.error('Authentication Error:', error);
    onError?.(error);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.6 
      }}
      className="relative w-full max-w-lg mx-auto"
    >
      {/* Premium Glass Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/90 via-gray-900/95 to-black/90 backdrop-blur-xl border border-gold/30 shadow-2xl">
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.1),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,215,0,0.08),transparent_50%)]" />
        
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-gradient-to-r from-gold/20 to-yellow-500/20 backdrop-blur-sm border border-gold/30 hover:from-gold/30 hover:to-yellow-500/30 transition-all duration-300 group"
        >
          <FaTimes className="w-3 h-3 text-gold group-hover:text-yellow-300 transition-colors" />
        </motion.button>

        {/* Header */}
        <div className="relative z-10 p-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center shadow-lg">
                <FaShieldAlt className="w-5 h-5 text-black" />
              </div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent mb-1">
              Secure Authentication
            </h2>
            <p className="text-gray-300 text-xs">
              Multi-factor verification for maximum security
            </p>
          </motion.div>
        </div>

        {/* Mode Toggle */}
        <div className="relative z-10 px-6">
          <div className="relative">
            <div className="flex space-x-1 p-1 rounded-xl bg-black/40 backdrop-blur-sm border border-gold/20">
              {[
                { id: 'signin', label: 'Sign In', icon: FaSignInAlt },
                { id: 'signup', label: 'Sign Up', icon: FaUserPlus }
              ].map((mode) => (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveMode(mode.id as 'signin' | 'signup')}
                  className={`relative flex-1 py-2.5 px-4 rounded-lg text-xs font-medium transition-all duration-300 ${
                    activeMode === mode.id
                      ? 'text-black'
                      : 'text-gray-400 hover:text-gold'
                  }`}
                >
                  {activeMode === mode.id && (
                    <motion.div
                      layoutId="activeMode"
                      className="absolute inset-0 bg-gradient-to-r from-gold to-yellow-500 rounded-lg shadow-lg"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center space-x-1.5">
                    <mode.icon className="w-3 h-3" />
                    <span>{mode.label}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 p-6 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4 
              }}
              className="min-h-[320px]"
            >
              {activeMode === 'signup' && <SignupFlow onSuccess={onClose} onError={handleError} />}
              {activeMode === 'signin' && <SigninFlow onSuccess={onClose} onError={handleError} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium Footer */}
        <div className="relative z-10 p-4 pt-2 border-t border-gold/20">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <FaGem className="w-2.5 h-2.5 text-gold" />
            <span className="text-xs">Enterprise-grade multi-factor security</span>
          </div>
        </div>

        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/20 via-transparent to-gold/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </motion.div>
  );
};
