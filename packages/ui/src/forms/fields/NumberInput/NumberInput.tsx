import React from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormFieldProps } from '../../FormField';
import { Input } from '../../../atoms/Input';
import { Button } from '../../../atoms/Button';
import { Icon } from '../../../atoms/Icon';
import { cn } from '../../../utils/cn';

export interface NumberInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<FormFieldProps<TFieldValues, TName>, 'children'> {
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Step increment
   */
  step?: number;
  /**
   * Number of decimal places
   */
  precision?: number;
  /**
   * Whether to show increment/decrement buttons
   */
  showSteppers?: boolean;
  /**
   * Currency symbol or prefix
   */
  prefix?: string;
  /**
   * Suffix (e.g., %, units)
   */
  suffix?: string;
  /**
   * Whether to format the number with thousands separators
   */
  formatThousands?: boolean;
  /**
   * Size of the input
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Auto-focus the input
   */
  autoFocus?: boolean;
}

export function NumberInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  required,
  disabled,
  rules,
  className,
  placeholder,
  min,
  max,
  step = 1,
  precision = 0,
  showSteppers = false,
  prefix,
  suffix,
  formatThousands = false,
  size = 'md',
  autoFocus,
}: NumberInputProps<TFieldValues, TName>) {
  const formatNumber = (value: number | string): string => {
    if (value === '' || value === null || value === undefined) return '';
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';

    let formatted = num.toFixed(precision);
    
    if (formatThousands) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }

    return `${prefix || ''}${formatted}${suffix || ''}`;
  };

  const parseNumber = (value: string): number | '' => {
    if (!value) return '';
    
    // Remove prefix, suffix, and thousands separators
    let cleaned = value;
    if (prefix) cleaned = cleaned.replace(prefix, '');
    if (suffix) cleaned = cleaned.replace(suffix, '');
    cleaned = cleaned.replace(/,/g, '');
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? '' : num;
  };

  const validateRange = (value: number): boolean => {
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  };

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
      disabled={disabled}
      rules={{
        ...rules,
        validate: (value: any) => {
          if (value === '' || value === null || value === undefined) {
            return required ? 'This field is required' : true;
          }
          
          const num = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(num)) return 'Please enter a valid number';
          
          if (!validateRange(num)) {
            if (min !== undefined && max !== undefined) {
              return `Value must be between ${min} and ${max}`;
            } else if (min !== undefined) {
              return `Value must be at least ${min}`;
            } else if (max !== undefined) {
              return `Value must be at most ${max}`;
            }
          }
          
          return true;
        },
      }}
      className={className}
    >
      {(fieldProps) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const rawValue = e.target.value;
          const numericValue = parseNumber(rawValue);
          fieldProps.onChange(numericValue);
        };

        const handleIncrement = () => {
          const currentValue = typeof fieldProps.value === 'number' ? fieldProps.value : 0;
          const newValue = currentValue + step;
          if (max === undefined || newValue <= max) {
            fieldProps.onChange(newValue);
          }
        };

        const handleDecrement = () => {
          const currentValue = typeof fieldProps.value === 'number' ? fieldProps.value : 0;
          const newValue = currentValue - step;
          if (min === undefined || newValue >= min) {
            fieldProps.onChange(newValue);
          }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          // Allow: backspace, delete, tab, escape, enter, decimal point
          if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
              // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
              (e.keyCode === 65 && e.ctrlKey === true) ||
              (e.keyCode === 67 && e.ctrlKey === true) ||
              (e.keyCode === 86 && e.ctrlKey === true) ||
              (e.keyCode === 88 && e.ctrlKey === true) ||
              (e.keyCode === 90 && e.ctrlKey === true) ||
              // Allow: home, end, left, right, down, up
              (e.keyCode >= 35 && e.keyCode <= 40)) {
            return;
          }
          
          // Ensure that it is a number and stop the keypress
          if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
          }

          // Handle arrow keys for increment/decrement
          if (e.keyCode === 38) { // Up arrow
            e.preventDefault();
            handleIncrement();
          } else if (e.keyCode === 40) { // Down arrow
            e.preventDefault();
            handleDecrement();
          }
        };

        const displayValue = fieldProps.value !== '' && fieldProps.value !== null && fieldProps.value !== undefined
          ? formatNumber(fieldProps.value)
          : '';

        return (
          <div className="relative">
            <Input
              type="text"
              id={fieldProps.id}
              name={fieldProps.name}
              value={displayValue}
              onChange={handleChange}
              onBlur={fieldProps.onBlur}
              onFocus={fieldProps.onFocus}
              onKeyDown={handleKeyDown}
              disabled={fieldProps.disabled}
              required={fieldProps.required}
              placeholder={placeholder}
              autoFocus={autoFocus}
              size={size}
              error={fieldProps.error}
              aria-invalid={fieldProps['aria-invalid']}
              aria-describedby={fieldProps['aria-describedby']}
              aria-required={fieldProps['aria-required']}
              className={cn(
                showSteppers && 'pr-16',
                fieldProps.hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
            />
            
            {showSteppers && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleIncrement}
                  disabled={fieldProps.disabled || (max !== undefined && fieldProps.value >= max)}
                  className="h-4 w-6 p-0 hover:bg-gray-100"
                  aria-label="Increment"
                >
                  <Icon name="chevron-up" size="xs" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleDecrement}
                  disabled={fieldProps.disabled || (min !== undefined && fieldProps.value <= min)}
                  className="h-4 w-6 p-0 hover:bg-gray-100"
                  aria-label="Decrement"
                >
                  <Icon name="chevron-down" size="xs" />
                </Button>
              </div>
            )}
          </div>
        );
      }}
    </FormField>
  );
}