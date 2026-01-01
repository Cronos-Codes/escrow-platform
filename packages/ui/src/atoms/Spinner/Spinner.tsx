import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const spinnerVariants = cva('animate-spin rounded-full border-2 border-current', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      default: 'border-gray-300 border-t-gray-900',
      primary: 'border-blue-200 border-t-blue-600',
      secondary: 'border-gray-200 border-t-gray-600',
      success: 'border-green-200 border-t-green-600',
      warning: 'border-yellow-200 border-t-yellow-600',
      error: 'border-red-200 border-t-red-600',
      white: 'border-white/30 border-t-white',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Accessible label for the spinner
   */
  'aria-label'?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label={ariaLabel || 'Loading'}
        {...props}
      >
        <span className="sr-only">{ariaLabel || 'Loading...'}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };