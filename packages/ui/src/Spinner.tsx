import React from 'react';
import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'yellow' | 'blue' | 'gray';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'white',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    white: 'border-white',
    yellow: 'border-yellow-500',
    blue: 'border-blue-500',
    gray: 'border-gray-500',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full ${className || ''}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}; 