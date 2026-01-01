/**
 * Dashboard Configuration Constants
 * Centralized configuration values for the dashboard components
 */

// Layout dimensions
export const DRAWER_WIDTH = 260;
export const DRAWER_WIDTH_LARGE = 280;

// Chart dimensions
export const DEFAULT_CHART_HEIGHT = 320;
export const CHART_MARGIN = { top: 10, right: 30, left: 0, bottom: 0 };

// Animation delays
export const ANIMATION_DELAY_BASE = 0.1;
export const ANIMATION_DURATION = 0.5;

// Pagination
export const DEFAULT_MAX_TRANSACTIONS = 5;
export const DEFAULT_MAX_ESCROWS = 4;

// Refresh intervals (in milliseconds)
export const WALLET_BALANCE_REFRESH_INTERVAL = 30000; // 30 seconds
export const DASHBOARD_AUTO_REFRESH_INTERVAL = 60000; // 1 minute

// Currency formatting
export const DEFAULT_CURRENCY = 'USD';
export const CURRENCY_MIN_FRACTION_DIGITS = 2;
export const CURRENCY_MAX_FRACTION_DIGITS = 2;

// Date formatting
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

// KPI Card colors
export const KPI_COLORS = {
  wallet: '#4CAF50',
  escrows: '#2196F3',
  transactions: '#FF9800',
  disputes: '#F44336',
} as const;

// Status colors
export const STATUS_COLORS = {
  completed: 'success',
  active: 'info',
  pending: 'warning',
  failed: 'error',
  default: 'default',
} as const;

// Timeframe options
export const TIMEFRAME_OPTIONS = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
] as const;

// KYC Level colors
export const KYC_COLORS = {
  premium: '#4CAF50',
  verified: '#2196F3',
  basic: '#FF9800',
} as const;

// Export formats
export const EXPORT_FORMATS = ['pdf', 'csv'] as const;
export type ExportFormat = typeof EXPORT_FORMATS[number];

// Notification badge max count
export const NOTIFICATION_MAX_BADGE_COUNT = 99;
