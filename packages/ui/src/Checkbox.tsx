import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  className,
  name,
  id,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className={`flex items-start space-x-3 ${className || ''}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
          className="sr-only"
        />
        
        <motion.div
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer
            ${checked 
              ? 'bg-yellow-500 border-yellow-500' 
              : 'bg-white/10 border-white/30'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-yellow-500/50'}
            transition-colors duration-200
          `}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={() => !disabled && onChange?.(!checked)}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                className="w-3 h-3 text-black"
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {label && (
        <label
          htmlFor={id}
          className={`
            text-sm text-white/90 cursor-pointer select-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      {error && (
        <motion.p
          className="mt-1 text-sm text-red-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}; 