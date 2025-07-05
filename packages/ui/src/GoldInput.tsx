import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './theme';

interface GoldInputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
}

const GoldInput: React.FC<GoldInputProps> = ({
  label,
  placeholder,
  type = 'text',
  value = '',
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  autoFocus = false,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setHasValue(!!inputRef.current?.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHasValue(!!newValue);
    onChange?.(newValue);
  };

  const baseClasses = `
    relative w-full
    transition-all duration-300 ease-out
  `;

  const inputClasses = `
    w-full px-4 py-3 rounded-lg
    bg-transparent border-2
    text-base font-medium
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-gold/50
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder-transparent
    ${error 
      ? 'border-error focus:border-error' 
      : isFocused 
        ? 'border-gold' 
        : 'border-gray-300'
    }
    ${theme === 'dark' 
      ? 'text-white placeholder-gray-400' 
      : 'text-black placeholder-gray-500'
    }
  `;

  const labelClasses = `
    absolute left-4 transition-all duration-200 ease-out pointer-events-none
    ${isFocused || hasValue 
      ? 'text-xs text-gold -top-2 bg-white px-2' 
      : 'text-base text-gray-500 top-3'
    }
    ${theme === 'dark' && (isFocused || hasValue) ? 'bg-black' : ''}
  `;

  const inputVariants = {
    initial: { 
      opacity: 0, 
      y: 10,
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    },
    focus: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      }
    }
  };

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      variants={inputVariants}
      initial="initial"
      animate="animate"
      whileFocus="focus"
    >
      {/* Input container */}
      <div className="relative">
        {/* Label */}
        {label && (
          <motion.label
            className={labelClasses}
            animate={{
              y: isFocused || hasValue ? -8 : 0,
              scale: isFocused || hasValue ? 0.85 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </motion.label>
        )}

        {/* Input field */}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={inputClasses}
        />

        {/* Focus indicator */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-gold/50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Error indicator */}
        {error && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          className="mt-2 text-sm text-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}

      {/* Shimmer effect on focus */}
      {isFocused && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent rounded-lg pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
};

export default GoldInput; 