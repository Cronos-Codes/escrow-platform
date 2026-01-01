import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './theme';

interface GoldButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string; // ARIA support
}

const GoldButton: React.FC<GoldButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  ariaLabel,
}) => {
  const theme = useTheme();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const baseClasses = `
    relative overflow-hidden rounded-lg font-medium
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-gold/50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
  `;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-gold to-gold-dark
      text-black font-semibold
      shadow-lg shadow-gold/25
      hover:shadow-xl hover:shadow-gold/30
      active:shadow-md
      hover:from-gold-dark hover:to-gold
    `,
    secondary: `
      bg-gradient-to-r from-gray/10 to-gray/5
      text-gold border border-gold/30
      backdrop-blur-md
      hover:bg-gradient-to-r hover:from-gold/10 hover:to-gold/5
      bg-white/80 border-gold/40
    `,
    outline: `
      bg-transparent border-2 border-gold
      text-gold
      hover:bg-gold hover:text-black
      transition-colors duration-200
    `,
    ghost: `
      bg-transparent text-gold
      hover:bg-gold/10
      transition-colors duration-200
    `,
  };

  const buttonVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.9,
      y: 10,
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      }
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create ripple effect
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);

    onClick?.();
  };

  return (
    <motion.button
      type={type}
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${className}
      `}
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      whileHover={!disabled && !loading ? "hover" : undefined}
      whileTap={!disabled && !loading ? "tap" : undefined}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      tabIndex={0}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        {children}
      </div>

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            initial={{
              width: 0,
              height: 0,
              x: ripple.x,
              y: ripple.y,
              opacity: 1,
            }}
            animate={{
              width: 300,
              height: 300,
              x: ripple.x - 150,
              y: ripple.y - 150,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </motion.button>
  );
};

export default GoldButton; 