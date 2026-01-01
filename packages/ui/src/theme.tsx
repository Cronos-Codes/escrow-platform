/**
 * Gold Escrow Platform Theme Configuration
 * @description Design tokens and theme utilities for the escrow platform
 */

import React, { createContext, useContext } from 'react';

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
  };
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
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
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Gold Escrow Platform Theme
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
      sans: ['Inter', 'system-ui', 'sans-serif'],
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
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
};

// Theme Context
const ThemeContext = createContext<Theme>(goldTheme);

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode; theme?: Theme }> = ({ 
  children, 
  theme = goldTheme 
}) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme Hook
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// CSS Variables for theme
export const cssVariables = {
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
  '--color-success': goldTheme.colors.success,
  '--color-warning': goldTheme.colors.warning,
  '--color-error': goldTheme.colors.error,
  '--color-info': goldTheme.colors.info,
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
  const fontSize = goldTheme.typography.fontSize[type];
  const fontWeight = weight ? goldTheme.typography.fontWeight[weight] : goldTheme.typography.fontWeight.normal;
  
  return {
    fontSize,
    fontWeight,
    fontFamily: goldTheme.typography.fontFamily.sans.join(', '),
  };
};

// Export default theme
export default goldTheme; 