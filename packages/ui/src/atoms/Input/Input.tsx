import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  [
    'flex w-full rounded-md border px-3 py-2 text-sm',
    'transition-colors duration-200',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-gray-500',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-gray-300 bg-white',
          'hover:border-gray-400',
          'focus-visible:border-blue-500 focus-visible:ring-blue-500',
        ],
        error: [
          'border-red-300 bg-red-50',
          'hover:border-red-400',
          'focus-visible:border-red-500 focus-visible:ring-red-500',
        ],
        success: [
          'border-green-300 bg-green-50',
          'hover:border-green-400',
          'focus-visible:border-green-500 focus-visible:ring-green-500',
        ],
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type VariantOnly = Omit<VariantProps<typeof inputVariants>, 'size'> & {
  size?: 'sm' | 'md' | 'lg';
};

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantOnly {
  /**
   * Label for the input field
   */
  label?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Success message to display
   */
  success?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type = 'text',
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);
    
    // Determine variant based on state
    const effectiveVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: effectiveVariant, size: size as any }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : success
                ? `${inputId}-success`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {success && !error && (
          <p
            id={`${inputId}-success`}
            className="mt-1 text-sm text-green-600"
          >
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };