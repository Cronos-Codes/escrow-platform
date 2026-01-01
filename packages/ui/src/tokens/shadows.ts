/**
 * Design Tokens - Shadows
 * Centralized shadow system for depth and elevation
 */
export const shadows = {
  // Base shadows
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Elevation system - semantic shadows for different UI layers
export const elevation = {
  // Surface levels
  surface: shadows.none,
  raised: shadows.sm,
  overlay: shadows.md,
  modal: shadows.lg,
  popover: shadows.xl,
  tooltip: shadows.base,
  // Interactive states
  'button-rest': shadows.sm,
  'button-hover': shadows.md,
  'button-active': shadows.inner,
  'card-rest': shadows.sm,
  'card-hover': shadows.md,
  'card-active': shadows.base,
} as const;

export type Shadow = keyof typeof shadows;
export type Elevation = keyof typeof elevation;