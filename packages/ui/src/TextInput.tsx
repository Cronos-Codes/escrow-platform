import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoldInput } from './placeholder';

interface TextInputProps {
  label?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  success?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  autoComplete?: string;
  name?: string;
  id?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success = false,
  required = false,
  autoFocus = false,
  className,
  disabled = false,
  icon,
  onBlur,
  onFocus,
  autoComplete,
  name,
  id,
}) => {
  return (
    <GoldInput
      label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
      success={success}
      required={required}
      autoFocus={autoFocus}
      className={className}
      disabled={disabled}
      icon={icon}
      onBlur={onBlur}
      onFocus={onFocus}
      autoComplete={autoComplete}
      name={name}
      id={id}
    />
  );
}; 