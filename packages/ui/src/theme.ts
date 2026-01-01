/**
 * Gold Escrow Platform Theme Configuration
 * @description Design tokens and theme utilities for the escrow platform
 */

export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
  // Glassmorphism tokens
  glass: {
    bg: string;
    blur: string;
    border: string;
  };
  // Background gradients
  gradients: {
    primary: string;
    secondary: string;
    auth: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeTypography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    // Fluid typography
    fluid: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
    };
  };
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    glass: string;
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

// Gold Escrow Platform Theme with enhanced design tokens
export const goldTheme: Theme = {
  colors: {
    primary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    glass: {
      bg: 'rgba(255, 255, 255, 0.25)',
      blur: '16px',
      border: 'rgba(255, 255, 255, 0.6)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #D4AF37 0%, #1A73E8 100%)',
      secondary: 'linear-gradient(135deg, #1A73E8 0%, #D4AF37 100%)',
      auth: 'linear-gradient(135deg, #D4AF37 0%, #1A73E8 50%, #202124 100%)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      fluid: {
        h1: 'clamp(2rem, 5vw, 3.5rem)',
        h2: 'clamp(1.5rem, 4vw, 2.5rem)',
        h3: 'clamp(1.25rem, 3vw, 2rem)',
        h4: 'clamp(1rem, 2vw, 1.5rem)',
      },
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.6',
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '600ms',
    },
    easing: {
      ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// Simple useTheme hook that returns the theme
export const useTheme = (): Theme => {
  return goldTheme;
};

// Theme Provider component (simplified)
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};

// CSS Variables for theme
export const cssVariables = {
  // Primary colors
  '--color-primary-gold': '#D4AF37',
  '--color-primary-50': goldTheme.colors.primary[50],
  '--color-primary-100': goldTheme.colors.primary[100],
  '--color-primary-200': goldTheme.colors.primary[200],
  '--color-primary-300': goldTheme.colors.primary[300],
  '--color-primary-400': goldTheme.colors.primary[400],
  '--color-primary-500': goldTheme.colors.primary[500],
  '--color-primary-600': goldTheme.colors.primary[600],
  '--color-primary-700': goldTheme.colors.primary[700],
  '--color-primary-800': goldTheme.colors.primary[800],
  '--color-primary-900': goldTheme.colors.primary[900],
  
  // Secondary colors
  '--color-secondary': '#1A73E8',
  '--color-secondary-50': goldTheme.colors.secondary[50],
  '--color-secondary-100': goldTheme.colors.secondary[100],
  '--color-secondary-200': goldTheme.colors.secondary[200],
  '--color-secondary-300': goldTheme.colors.secondary[300],
  '--color-secondary-400': goldTheme.colors.secondary[400],
  '--color-secondary-500': goldTheme.colors.secondary[500],
  '--color-secondary-600': goldTheme.colors.secondary[600],
  '--color-secondary-700': goldTheme.colors.secondary[700],
  '--color-secondary-800': goldTheme.colors.secondary[800],
  '--color-secondary-900': goldTheme.colors.secondary[900],
  
  // Semantic colors
  '--color-success': goldTheme.colors.success,
  '--color-warning': goldTheme.colors.warning,
  '--color-error': goldTheme.colors.error,
  '--color-info': goldTheme.colors.info,
  
  // Background colors
  '--color-bg': '#F5F7FA',
  '--color-surface': '#FFFFFF',
  '--color-text': '#202124',
  
  // Glassmorphism tokens
  '--glass-bg': goldTheme.colors.glass.bg,
  '--glass-blur': goldTheme.colors.glass.blur,
  '--glass-border': goldTheme.colors.glass.border,
  
  // Gradients
  '--gradient-primary': goldTheme.colors.gradients.primary,
  '--gradient-secondary': goldTheme.colors.gradients.secondary,
  '--gradient-auth': goldTheme.colors.gradients.auth,
  
  // Typography
  '--font-family-sans': goldTheme.typography.fontFamily.sans.join(', '),
  '--font-family-serif': goldTheme.typography.fontFamily.serif.join(', '),
  '--font-family-mono': goldTheme.typography.fontFamily.mono.join(', '),
  
  // Fluid typography
  '--font-size-fluid-h1': goldTheme.typography.fontSize.fluid.h1,
  '--font-size-fluid-h2': goldTheme.typography.fontSize.fluid.h2,
  '--font-size-fluid-h3': goldTheme.typography.fontSize.fluid.h3,
  '--font-size-fluid-h4': goldTheme.typography.fontSize.fluid.h4,
  
  // Spacing
  '--spacing-xs': goldTheme.spacing.xs,
  '--spacing-sm': goldTheme.spacing.sm,
  '--spacing-md': goldTheme.spacing.md,
  '--spacing-lg': goldTheme.spacing.lg,
  '--spacing-xl': goldTheme.spacing.xl,
  '--spacing-2xl': goldTheme.spacing['2xl'],
  '--spacing-3xl': goldTheme.spacing['3xl'],
  
  // Border radius
  '--radius-none': goldTheme.borderRadius.none,
  '--radius-sm': goldTheme.borderRadius.sm,
  '--radius-md': goldTheme.borderRadius.md,
  '--radius-lg': goldTheme.borderRadius.lg,
  '--radius-xl': goldTheme.borderRadius.xl,
  '--radius-2xl': goldTheme.borderRadius['2xl'],
  '--radius-full': goldTheme.borderRadius.full,
  
  // Shadows
  '--shadow-sm': goldTheme.shadows.sm,
  '--shadow-md': goldTheme.shadows.md,
  '--shadow-lg': goldTheme.shadows.lg,
  '--shadow-xl': goldTheme.shadows.xl,
  '--shadow-2xl': goldTheme.shadows['2xl'],
  '--shadow-glass': goldTheme.shadows.glass,
  
  // Animation
  '--duration-fast': goldTheme.animation.duration.fast,
  '--duration-normal': goldTheme.animation.duration.normal,
  '--duration-slow': goldTheme.animation.duration.slow,
  '--easing-ease': goldTheme.animation.easing.ease,
  '--easing-ease-in': goldTheme.animation.easing.easeIn,
  '--easing-ease-out': goldTheme.animation.easing.easeOut,
  '--easing-ease-in-out': goldTheme.animation.easing.easeInOut,
};

// Utility functions
export const getThemeColor = (color: keyof ThemeColors, shade?: keyof ThemeColors['primary']) => {
  if (shade && color === 'primary') {
    return goldTheme.colors.primary[shade];
  }
  return goldTheme.colors[color];
};

export const getSpacing = (size: keyof ThemeSpacing) => {
  return goldTheme.spacing[size];
};

export const getTypography = (type: keyof ThemeTypography['fontSize'], weight?: keyof ThemeTypography['fontWeight']) => {
  return {
    fontSize: goldTheme.typography.fontSize[type],
    fontWeight: weight ? goldTheme.typography.fontWeight[weight] : goldTheme.typography.fontWeight.normal,
  };
};

// Apply CSS variables to document
export const applyTheme = () => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
};

// Export default theme
export default goldTheme; 