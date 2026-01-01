/**
 * @file UI Package for Escrow Platform
 * @description Atomic Design System with gold-themed UI components, motion and 3D effects
 */

// Design Tokens
export * from './tokens';

// Atomic Components
export * from './atoms';

// Molecular Components
export * from './molecules';

// Organism Components
export * from './organisms';

// Template Components
export * from './templates';

// Form System
export * from './forms';

// Dashboard Components
export * from './dashboard';

// Utilities
export * from './utils/cn';

// Theme and utilities
export * from './theme';

// Legacy components - enhanced implementations
export { 
  GoldCard, 
  GoldButton, 
  GoldInput, 
  ThemeProvider, 
  DashboardShell 
} from './placeholder';

// Auth-specific components
export { AuthLayout } from './AuthLayout';
export { AuthCard } from './AuthCard';
export { default as AuthForm } from './components/modals/AuthForm';
export { TextInput } from './TextInput';
export { PasswordInput } from './PasswordInput';
export { Checkbox } from './Checkbox';
export { Button as LegacyButton } from './Button';
export { InlineError } from './InlineError';
export { FooterCTA } from './FooterCTA';
export { Spinner as LegacySpinner } from './Spinner';

// Additional components to be implemented
export const GoldModal = () => 'GoldModal - Coming Soon';
export const GoldTooltip = () => 'GoldTooltip - Coming Soon';
export const GoldSnackbar = () => 'GoldSnackbar - Coming Soon';
export const GoldTabs = () => 'GoldTabs - Coming Soon';
export const GoldToggle = () => 'GoldToggle - Coming Soon';
export const DepthLoader = () => 'DepthLoader - Coming Soon';
export const ThemeToggle = () => 'ThemeToggle - Coming Soon';
export const GoldNotificationCenter = () => 'GoldNotificationCenter - Coming Soon';
export const GoldCommandMenu = () => 'GoldCommandMenu - Coming Soon';
export const GoldStatusTicker = () => 'GoldStatusTicker - Coming Soon'; 