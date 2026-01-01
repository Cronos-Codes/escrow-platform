/**
 * Responsive utility functions for Gold Escrow Platform
 */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Get responsive class names based on breakpoint
 */
export const getResponsiveClasses = (
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string => {
  const classes = [base];
  if (sm) classes.push(`sm:${sm}`);
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  if (xl) classes.push(`xl:${xl}`);
  return classes.join(' ');
};

/**
 * Get responsive spacing values
 */
export const getResponsiveSpacing = (
  mobile: number | string,
  tablet?: number | string,
  desktop?: number | string
): string => {
  if (typeof mobile === 'number') mobile = `${mobile * 0.25}rem`;
  if (tablet && typeof tablet === 'number') tablet = `${tablet * 0.25}rem`;
  if (desktop && typeof desktop === 'number') desktop = `${desktop * 0.25}rem`;
  
  return tablet && desktop
    ? `${mobile} md:${tablet} lg:${desktop}`
    : tablet
    ? `${mobile} md:${tablet}`
    : mobile;
};

/**
 * Get responsive font sizes
 */
export const getResponsiveFontSize = (
  mobile: string,
  tablet?: string,
  desktop?: string
): string => {
  return tablet && desktop
    ? `text-${mobile} md:text-${tablet} lg:text-${desktop}`
    : tablet
    ? `text-${mobile} md:text-${tablet}`
    : `text-${mobile}`;
};

/**
 * Check if current viewport matches breakpoint
 */
export const matchesBreakpoint = (breakpoint: Breakpoint, width?: number): boolean => {
  const viewportWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 0);
  return viewportWidth >= breakpoints[breakpoint];
};

/**
 * Get grid columns configuration
 */
export const getGridColumns = (
  mobile: number = 1,
  tablet?: number,
  desktop?: number
): string => {
  const cols = [`grid-cols-${mobile}`];
  if (tablet) cols.push(`md:grid-cols-${tablet}`);
  if (desktop) cols.push(`lg:grid-cols-${desktop}`);
  return cols.join(' ');
};

/**
 * Responsive padding/margin helpers
 */
export const responsivePadding = {
  mobile: 'px-4 py-6',
  tablet: 'md:px-6 md:py-8',
  desktop: 'lg:px-8 lg:py-12',
  all: 'px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12',
};

export const responsiveMargin = {
  mobile: 'mx-4 my-6',
  tablet: 'md:mx-6 md:my-8',
  desktop: 'lg:mx-8 lg:my-12',
  all: 'mx-4 my-6 md:mx-6 md:my-8 lg:mx-8 lg:my-12',
};

/**
 * Get container max-width classes
 */
export const getContainerWidth = (maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'xl'): string => {
  const widths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  };
  return `w-full ${widths[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8`;
};

/**
 * Touch-friendly size helpers
 */
export const touchTarget = {
  min: 'min-w-[44px] min-h-[44px]',
  small: 'w-11 h-11',
  medium: 'w-12 h-12',
  large: 'w-14 h-14',
};



