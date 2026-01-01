import React from 'react';
import { motion } from 'framer-motion';
import { GoldCard } from './placeholder';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'elevated' | 'glass' | 'solid';
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  className,
  padding = 'lg',
  variant = 'glass',
}) => {
  return (
    <GoldCard
      variant={variant}
      padding={padding}
      className={`w-full ${className || ''}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </GoldCard>
  );
}; 