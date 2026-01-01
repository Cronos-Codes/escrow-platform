import React, { useState, useCallback } from 'react';
import { Input } from '../../atoms/Input';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import { cn } from '../../utils/cn';

export interface SearchBoxProps {
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  /**
   * Initial search value
   */
  defaultValue?: string;
  /**
   * Controlled search value
   */
  value?: string;
  /**
   * Callback when search value changes
   */
  onChange?: (value: string) => void;
  /**
   * Callback when search is submitted
   */
  onSearch?: (value: string) => void;
  /**
   * Callback when search is cleared
   */
  onClear?: () => void;
  /**
   * Whether to show the search button
   */
  showSearchButton?: boolean;
  /**
   * Whether to show the clear button
   */
  showClearButton?: boolean;
  /**
   * Size of the search box
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the search box is disabled
   */
  disabled?: boolean;
  /**
   * Whether the search box is loading
   */
  loading?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Debounce delay in milliseconds
   */
  debounceMs?: number;
}

const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  (
    {
      placeholder = 'Search...',
      defaultValue = '',
      value,
      onChange,
      onSearch,
      onClear,
      showSearchButton = false,
      showClearButton = true,
      size = 'md',
      disabled = false,
      loading = false,
      className,
      debounceMs = 300,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const isControlled = value !== undefined;
    const searchValue = isControlled ? value : internalValue;

    const debouncedOnChange = useCallback(
      (newValue: string) => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
          onChange?.(newValue);
        }, debounceMs);

        setDebounceTimer(timer);
      },
      [onChange, debounceMs, debounceTimer]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (!isControlled) {
        setInternalValue(newValue);
      }

      if (onChange) {
        debouncedOnChange(newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch?.(searchValue);
      }
    };

    const handleClear = () => {
      const newValue = '';
      
      if (!isControlled) {
        setInternalValue(newValue);
      }
      
      onChange?.(newValue);
      onClear?.();
    };

    const handleSearchClick = () => {
      onSearch?.(searchValue);
    };

    const showClear = showClearButton && searchValue.length > 0 && !loading;

    return (
      <div className={cn('relative flex items-center', className)}>
        <Input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          size={size}
          disabled={disabled}
          leftIcon={
            loading ? (
              <Icon name="search" size="sm" className="animate-pulse" />
            ) : (
              <Icon name="search" size="sm" />
            )
          }
          rightIcon={
            showClear ? (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                aria-label="Clear search"
              >
                <Icon name="x-mark" size="sm" />
              </button>
            ) : undefined
          }
          className={cn(
            showSearchButton && 'rounded-r-none border-r-0',
            'pr-10'
          )}
          {...props}
        />
        {showSearchButton && (
          <Button
            type="button"
            onClick={handleSearchClick}
            disabled={disabled || loading}
            size={size}
            className="rounded-l-none border-l-0"
            aria-label="Search"
          >
            {loading ? (
              <Icon name="search" size="sm" className="animate-pulse" />
            ) : (
              <Icon name="search" size="sm" />
            )}
          </Button>
        )}
      </div>
    );
  }
);

SearchBox.displayName = 'SearchBox';

export { SearchBox };