"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaGitlab, FaGoogle, FaArrowRight } from 'react-icons/fa';
import { signIn } from '../../lib/auth-actions';

interface SignInButtonWithProviderProps {
  provider: 'google' | 'github' | 'gitlab';
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: FaGoogle,
    color: 'from-red-500 to-red-600',
    bgColor: 'from-red-500/20 to-red-600/20',
    borderColor: 'border-red-500/30',
    hoverColor: 'hover:from-red-500/30 hover:to-red-600/30'
  },
  github: {
    name: 'GitHub',
    icon: FaGithub,
    color: 'from-gray-700 to-gray-800',
    bgColor: 'from-gray-700/20 to-gray-800/20',
    borderColor: 'border-gray-700/30',
    hoverColor: 'hover:from-gray-700/30 hover:to-gray-800/30'
  },
  gitlab: {
    name: 'GitLab',
    icon: FaGitlab,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-500/20 to-orange-600/20',
    borderColor: 'border-orange-500/30',
    hoverColor: 'hover:from-orange-500/30 hover:to-orange-600/30'
  }
};

export const SignInButtonWithProvider: React.FC<SignInButtonWithProviderProps> = ({ provider }) => {
  const [isLoading, setIsLoading] = useState(false);
  const config = providerConfig[provider];
  const IconComponent = config.icon;

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn(provider);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleSignIn}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden bg-gradient-to-r ${config.bgColor} ${config.borderColor} ${config.hoverColor} backdrop-blur-sm`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-yellow-500/20 flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-gold" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gold group-hover:text-yellow-300 transition-colors">
              Continue with {config.name}
            </h4>
            <p className="text-sm text-gray-400">
              Secure OAuth authentication
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full"
            />
          ) : (
            <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
  );
};
