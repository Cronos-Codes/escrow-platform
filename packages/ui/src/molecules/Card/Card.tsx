import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        outline: 'border-border',
        elevated: 'border-border shadow-md',
        ghost: 'border-transparent shadow-none',
        gold: 'border-gold-200 bg-gradient-to-br from-gold-50 to-gold-100',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4 gap-4',
        md: 'p-6 gap-6', 
        lg: 'p-8 gap-8',
      },
      hover: {
        none: '',
        lift: 'transition-all duration-200 hover:shadow-md hover:-translate-y-1',
        glow: 'transition-all duration-200 hover:shadow-lg hover:border-primary/50',
        scale: 'transition-all duration-200 hover:scale-[1.02]',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'none',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Whether the card is clickable
   */
  clickable?: boolean;
  /**
   * Whether the card is selected
   */
  selected?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      hover,
      clickable = false,
      selected = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          cardVariants({ variant, padding, hover }),
          clickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          selected && 'ring-2 ring-primary border-primary',
          className
        )}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? 'button' : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Enhanced Card sub-components with slash-admin patterns
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn(
      '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-title"
    className={cn('leading-none font-semibold text-lg', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-description"
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-action"
    className={cn(
      'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      className
    )}
    {...props}
  />
));
CardAction.displayName = 'CardAction';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn('px-6', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  cardVariants,
};