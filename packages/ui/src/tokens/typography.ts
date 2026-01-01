/**
 * Design Tokens - Typography
 * Centralized typography system with font families, sizes, weights, and line heights
 */
export const typography = {
  // Font families
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'sans-serif',
    ],
    mono: [
      'JetBrains Mono',
      'Fira Code',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
    display: [
      'Cal Sans',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
  },
  // Font sizes with corresponding line heights
  fontSize: {
    xs: {
      size: '0.75rem', // 12px
      lineHeight: '1rem', // 16px
    },
    sm: {
      size: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
    },
    base: {
      size: '1rem', // 16px
      lineHeight: '1.5rem', // 24px
    },
    lg: {
      size: '1.125rem', // 18px
      lineHeight: '1.75rem', // 28px
    },
    xl: {
      size: '1.25rem', // 20px
      lineHeight: '1.75rem', // 28px
    },
    '2xl': {
      size: '1.5rem', // 24px
      lineHeight: '2rem', // 32px
    },
    '3xl': {
      size: '1.875rem', // 30px
      lineHeight: '2.25rem', // 36px
    },
    '4xl': {
      size: '2.25rem', // 36px
      lineHeight: '2.5rem', // 40px
    },
    '5xl': {
      size: '3rem', // 48px
      lineHeight: '1',
    },
    '6xl': {
      size: '3.75rem', // 60px
      lineHeight: '1',
    },
    '7xl': {
      size: '4.5rem', // 72px
      lineHeight: '1',
    },
    '8xl': {
      size: '6rem', // 96px
      lineHeight: '1',
    },
    '9xl': {
      size: '8rem', // 128px
      lineHeight: '1',
    },
  },
  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;