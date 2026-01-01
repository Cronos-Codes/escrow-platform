import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextInput } from './TextInput';

interface PasswordInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  success?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  showStrengthIndicator?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  autoComplete?: string;
  name?: string;
  id?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder = 'Enter your password',
  value,
  onChange,
  error,
  success = false,
  required = false,
  autoFocus = false,
  className,
  disabled = false,
  showStrengthIndicator = true,
  onBlur,
  onFocus,
  autoComplete,
  name,
  id,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthMap = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' },
    ];

    return { score, ...strengthMap[Math.min(score - 1, 4)] };
  };

  const strength = getPasswordStrength(value || '');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <TextInput
          label={label}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          error={error}
          success={success}
          required={required}
          autoFocus={autoFocus}
          className={className}
          disabled={disabled}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          autoComplete={autoComplete}
          name={name}
          id={id}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        
        {/* Password visibility toggle */}
        <motion.button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {showPassword ? (
              <motion.svg
                key="eye-off"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </motion.svg>
            ) : (
              <motion.svg
                key="eye"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Password strength indicator */}
      {showStrengthIndicator && value && (
        <motion.div
          className="mt-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${strength.color} transition-all duration-300`}
                initial={{ width: 0 }}
                animate={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-white/60 min-w-[60px]">
              {strength.label}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}; 