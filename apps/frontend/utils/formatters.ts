/**
 * Shared formatting utilities for the dashboard
 */

import { DEFAULT_CURRENCY, CURRENCY_MIN_FRACTION_DIGITS, CURRENCY_MAX_FRACTION_DIGITS, DATE_FORMAT_OPTIONS } from '../config/dashboard-constants';

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @param options - Additional Intl.NumberFormat options
 */
export const formatCurrency = (
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: CURRENCY_MIN_FRACTION_DIGITS,
    maximumFractionDigits: CURRENCY_MAX_FRACTION_DIGITS,
    ...options,
  }).format(amount);
};

/**
 * Format a date string to a localized date
 * @param dateString - ISO date string or timestamp
 * @param options - Custom date format options
 */
export const formatDate = (
  dateString: string | number,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(dateString).toLocaleDateString('en-US', options || DATE_FORMAT_OPTIONS);
};

/**
 * Format a date to relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string or timestamp
 */
export const formatRelativeTime = (dateString: string | number): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Format a percentage value
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a large number with abbreviations (K, M, B)
 * @param value - The number to format
 */
export const formatCompactNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
};

/**
 * Truncate text with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Mask sensitive data (e.g., wallet addresses, emails)
 * @param value - The value to mask
 * @param visibleChars - Number of characters to show at start and end
 */
export const maskSensitiveData = (value: string, visibleChars: number = 4): string => {
  if (value.length <= visibleChars * 2) return value;
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  return `${start}...${end}`;
};
