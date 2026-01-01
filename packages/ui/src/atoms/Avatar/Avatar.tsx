import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const avatarImageVariants = cva('aspect-square h-full w-full object-cover');

const avatarFallbackVariants = cva(
  'flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /**
   * The image source URL
   */
  src?: string;
  /**
   * Alternative text for the image
   */
  alt?: string;
  /**
   * Fallback content when image fails to load or is not provided
   */
  fallback?: React.ReactNode;
  /**
   * Name to generate initials from (used if no fallback provided)
   */
  name?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, name, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Reset error state when src changes
    React.useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
    }, [src]);

    // Generate initials from name
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const showImage = src && !imageError && imageLoaded;
    const showFallback = !src || imageError || !imageLoaded;

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src && (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className={cn(
              avatarImageVariants(),
              showImage ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        {showFallback && (
          <div className={cn(avatarFallbackVariants({ size }))}>
            {fallback || (name ? getInitials(name) : '?')}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar, avatarVariants };