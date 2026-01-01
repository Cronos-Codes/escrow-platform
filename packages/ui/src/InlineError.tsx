import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InlineErrorProps {
  error?: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ error, className }) => {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          className={`p-3 bg-red-500/10 border border-red-500/20 rounded-lg ${className || ''}`}
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-red-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 