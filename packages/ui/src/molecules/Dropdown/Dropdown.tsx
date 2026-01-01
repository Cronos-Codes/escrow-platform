import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { cn } from '../../utils/cn';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  /**
   * Array of dropdown options
   */
  options: DropdownOption[];
  /**
   * Currently selected value
   */
  value?: string;
  /**
   * Default selected value
   */
  defaultValue?: string;
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void;
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean;
  /**
   * Size of the dropdown
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the dropdown takes full width
   */
  fullWidth?: boolean;
  /**
   * Additional CSS classes for the trigger button
   */
  className?: string;
  /**
   * Additional CSS classes for the dropdown menu
   */
  menuClassName?: string;
  /**
   * Label for the dropdown
   */
  label?: string;
  /**
   * Error message
   */
  error?: string;
}

const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = 'Select an option',
      disabled = false,
      size = 'md',
      fullWidth = false,
      className,
      menuClassName,
      label,
      error,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : internalValue;

    // Find selected option
    const selectedOption = options.find(option => option.value === selectedValue);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [isOpen]);

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleSelect = (optionValue: string) => {
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          setIsOpen(!isOpen);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            // Focus first option
            const firstOption = dropdownRef.current?.querySelector('[role="option"]') as HTMLElement;
            firstOption?.focus();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            // Focus last option
            const options = dropdownRef.current?.querySelectorAll('[role="option"]');
            const lastOption = options?.[options.length - 1] as HTMLElement;
            lastOption?.focus();
          }
          break;
      }
    };

    const handleOptionKeyDown = (event: React.KeyboardEvent, optionValue: string) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleSelect(optionValue);
          break;
        case 'ArrowDown':
          event.preventDefault();
          const nextOption = (event.target as HTMLElement).nextElementSibling as HTMLElement;
          nextOption?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          const prevOption = (event.target as HTMLElement).previousElementSibling as HTMLElement;
          prevOption?.focus();
          break;
        case 'Escape':
          setIsOpen(false);
          (ref as React.RefObject<HTMLButtonElement>)?.current?.focus();
          break;
      }
    };

    const dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={dropdownId}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div ref={dropdownRef} className="relative">
          <Button
            ref={ref}
            id={dropdownId}
            type="button"
            variant="outline"
            size={size}
            fullWidth={fullWidth}
            disabled={disabled}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className={cn(
              'justify-between',
              error && 'border-red-300 focus-visible:ring-red-500',
              className
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={label ? `${dropdownId}-label` : undefined}
            {...props}
          >
            <span className="flex items-center">
              {selectedOption?.icon && (
                <span className="mr-2 flex-shrink-0">{selectedOption.icon}</span>
              )}
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <Icon
              name="chevron-down"
              size="sm"
              className={cn(
                'ml-2 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </Button>

          {isOpen && (
            <div
              className={cn(
                'absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg',
                'max-h-60 overflow-auto',
                menuClassName
              )}
              role="listbox"
              aria-labelledby={dropdownId}
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  role="option"
                  tabIndex={option.disabled ? -1 : 0}
                  aria-selected={option.value === selectedValue}
                  className={cn(
                    'flex cursor-pointer items-center px-3 py-2 text-sm',
                    'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                    option.disabled && 'cursor-not-allowed opacity-50',
                    option.value === selectedValue && 'bg-blue-50 text-blue-600'
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  onKeyDown={(e) => !option.disabled && handleOptionKeyDown(e, option.value)}
                >
                  {option.icon && (
                    <span className="mr-2 flex-shrink-0">{option.icon}</span>
                  )}
                  {option.label}
                  {option.value === selectedValue && (
                    <Icon name="check" size="sm" className="ml-auto text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export { Dropdown };