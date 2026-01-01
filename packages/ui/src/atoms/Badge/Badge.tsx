import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  [
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80',
        secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80',
        destructive: 'border-transparent bg-red-500 text-gray-50 hover:bg-red-500/80',
        success: 'border-transparent bg-green-500 text-gray-50 hover:bg-green-500/80',
        warning: 'border-transparent bg-yellow-500 text-gray-50 hover:bg-yellow-500/80',
        info: 'border-transparent bg-blue-500 text-gray-50 hover:bg-blue-500/80',
        outline: 'text-gray-950 border-gray-200 hover:bg-gray-100',
        'outline-destructive': 'text-red-600 border-red-200 hover:bg-red-50',
        'outline-success': 'text-green-600 border-green-200 hover:bg-green-50',
        'outline-warning': 'text-yellow-600 border-yellow-200 hover:bg-yellow-50',
        'outline-info': 'text-blue-600 border-blue-200 hover:bg-blue-50',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before the badge text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after the badge text
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the badge can be dismissed
   */
  dismissible?: boolean;
  /**
   * Callback when the badge is dismissed
   */
  onDismiss?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      leftIcon,
      rightIcon,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {leftIcon && (
          <span className="mr-1 flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !dismissible && (
          <span className="ml-1 flex-shrink-0">{rightIcon}</span>
        )}
        {dismissible && (
          <button
            type="button"
            className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <svg
              className="h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };