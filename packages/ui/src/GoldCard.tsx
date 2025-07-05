import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './theme';

interface GoldCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const GoldCard: React.FC<GoldCardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  disabled = false,
  loading = false,
}) => {
  const { theme } = useTheme();

  const baseClasses = `
    relative overflow-hidden rounded-xl border
    transition-all duration-300 ease-out
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
  `;

  const variantClasses = {
    default: `
      bg-gradient-to-br from-white/10 to-white/5
      border-gold/30 shadow-lg
      backdrop-blur-md
      ${theme === 'dark' 
        ? 'bg-black/20 border-gold/20' 
        : 'bg-white/80 border-gold/40'
      }
    `,
    elevated: `
      bg-gradient-to-br from-gold/10 to-gold/5
      border-gold/50 shadow-xl
      backdrop-blur-lg
      ${theme === 'dark' 
        ? 'bg-black/30 border-gold/30 shadow-gold/20' 
        : 'bg-white/90 border-gold/50 shadow-gold/10'
      }
    `,
    glass: `
      bg-gradient-to-br from-white/20 to-white/10
      border-white/20 shadow-2xl
      backdrop-blur-xl
      ${theme === 'dark' 
        ? 'bg-black/40 border-gold/10' 
        : 'bg-white/60 border-gold/20'
      }
    `,
  };

  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
      }
    }
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};

export default GoldCard; 