import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center',
    'rounded-md text-sm font-medium',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-95',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-blue-600 text-white shadow-sm',
          'hover:bg-blue-700 hover:shadow-md',
          'focus-visible:ring-blue-500',
          'active:bg-blue-800',
        ],
        secondary: [
          'bg-gray-100 text-gray-900 shadow-sm',
          'hover:bg-gray-200 hover:shadow-md',
          'focus-visible:ring-gray-500',
          'active:bg-gray-300',
        ],
        outline: [
          'border border-gray-300 bg-white text-gray-700 shadow-sm',
          'hover:bg-gray-50 hover:border-gray-400 hover:shadow-md',
          'focus-visible:ring-gray-500',
          'active:bg-gray-100',
        ],
        ghost: [
          'text-gray-700',
          'hover:bg-gray-100',
          'focus-visible:ring-gray-500',
          'active:bg-gray-200',
        ],
        destructive: [
          'bg-red-600 text-white shadow-sm',
          'hover:bg-red-700 hover:shadow-md',
          'focus-visible:ring-red-500',
          'active:bg-red-800',
        ],
        success: [
          'bg-green-600 text-white shadow-sm',
          'hover:bg-green-700 hover:shadow-md',
          'focus-visible:ring-green-500',
          'active:bg-green-800',
        ],
        warning: [
          'bg-yellow-600 text-white shadow-sm',
          'hover:bg-yellow-700 hover:shadow-md',
          'focus-visible:ring-yellow-500',
          'active:bg-yellow-800',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-base',
        xl: 'h-12 px-8 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * If true, the button will show a loading spinner
   */
  loading?: boolean;
  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };