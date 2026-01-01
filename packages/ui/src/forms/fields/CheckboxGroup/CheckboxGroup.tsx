import React from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormFieldProps } from '../../FormField';
import { cn } from '../../../utils/cn';

export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface CheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<FormFieldProps<TFieldValues, TName>, 'children'> {
  /**
   * Checkbox options
   */
  options: CheckboxOption[];
  /**
   * Layout direction
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * Number of columns (for grid layout)
   */
  columns?: number;
  /**
   * Size of checkboxes
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Maximum number of selections
   */
  maxSelections?: number;
  /**
   * Minimum number of selections
   */
  minSelections?: number;
  /**
   * Whether to show "Select All" option
   */
  showSelectAll?: boolean;
  /**
   * Custom checkbox renderer
   */
  renderCheckbox?: (option: CheckboxOption, isChecked: boolean, isDisabled: boolean) => React.ReactNode;
}

export function CheckboxGroup<
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
  options,
  direction = 'vertical',
  columns,
  size = 'md',
  maxSelections,
  minSelections,
  showSelectAll = false,
  renderCheckbox,
}: CheckboxGroupProps<TFieldValues, TName>) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
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
        validate: (value: string[]) => {
          const selectedCount = Array.isArray(value) ? value.length : 0;
          
          if (required && selectedCount === 0) {
            return 'Please select at least one option';
          }
          
          if (minSelections && selectedCount < minSelections) {
            return `Please select at least ${minSelections} option${minSelections > 1 ? 's' : ''}`;
          }
          
          if (maxSelections && selectedCount > maxSelections) {
            return `Please select no more than ${maxSelections} option${maxSelections > 1 ? 's' : ''}`;
          }
          
          return true;
        },
      }}
      className={className}
    >
      {(fieldProps) => {
        const selectedValues = Array.isArray(fieldProps.value) ? fieldProps.value : [];

        const handleChange = (optionValue: string, checked: boolean) => {
          let newValues: string[];
          
          if (checked) {
            // Add value if not at max selections
            if (!maxSelections || selectedValues.length < maxSelections) {
              newValues = [...selectedValues, optionValue];
            } else {
              return; // Don't add if at max
            }
          } else {
            // Remove value
            newValues = selectedValues.filter(v => v !== optionValue);
          }
          
          fieldProps.onChange(newValues);
        };

        const handleSelectAll = (checked: boolean) => {
          if (checked) {
            const allValues = options
              .filter(option => !option.disabled)
              .map(option => option.value);
            fieldProps.onChange(allValues);
          } else {
            fieldProps.onChange([]);
          }
        };

        const isAllSelected = options.length > 0 && 
          options.filter(option => !option.disabled).every(option => 
            selectedValues.includes(option.value)
          );

        const isSomeSelected = selectedValues.length > 0 && !isAllSelected;

        const gridClasses = columns ? {
          1: 'grid-cols-1',
          2: 'grid-cols-2',
          3: 'grid-cols-3',
          4: 'grid-cols-4',
          5: 'grid-cols-5',
          6: 'grid-cols-6',
        }[columns] : '';

        const containerClasses = cn(
          'space-y-3',
          direction === 'horizontal' && !columns && 'flex flex-wrap gap-4 space-y-0',
          columns && `grid gap-4 ${gridClasses}`
        );

        return (
          <div
            role="group"
            aria-labelledby={fieldProps.id}
            aria-invalid={fieldProps['aria-invalid']}
            aria-describedby={fieldProps['aria-describedby']}
          >
            {/* Select All Option */}
            {showSelectAll && (
              <div className="mb-4 border-b border-gray-200 pb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={fieldProps.disabled}
                    className={cn(
                      sizeClasses[size],
                      'rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                      fieldProps.disabled && 'cursor-not-allowed opacity-50'
                    )}
                  />
                  <span className={cn('ml-2 font-medium text-gray-900', textSizeClasses[size])}>
                    Select All
                  </span>
                </label>
              </div>
            )}

            {/* Options */}
            <div className={containerClasses}>
              {options.map((option) => {
                const isChecked = selectedValues.includes(option.value);
                const isDisabled = fieldProps.disabled || option.disabled;
                const canSelect = !maxSelections || selectedValues.length < maxSelections || isChecked;

                if (renderCheckbox) {
                  return (
                    <div key={option.value}>
                      {renderCheckbox(option, Boolean(isChecked), Boolean(isDisabled))}
                    </div>
                  );
                }

                return (
                  <div key={option.value} className="relative">
                    <label
                      className={cn(
                        'flex items-start',
                        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleChange(option.value, e.target.checked)}
                        disabled={isDisabled || !canSelect}
                        className={cn(
                          sizeClasses[size],
                          'mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                          isDisabled && 'cursor-not-allowed opacity-50',
                          !canSelect && !isChecked && 'cursor-not-allowed opacity-50'
                        )}
                        aria-describedby={option.description ? `${option.value}-description` : undefined}
                      />
                      
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          {option.icon && (
                            <span className="mr-2 flex-shrink-0">{option.icon}</span>
                          )}
                          <span
                            className={cn(
                              'font-medium text-gray-900',
                              textSizeClasses[size],
                              isDisabled && 'text-gray-500'
                            )}
                          >
                            {option.label}
                          </span>
                        </div>
                        
                        {option.description && (
                          <p
                            id={`${option.value}-description`}
                            className={cn(
                              'mt-1 text-gray-500',
                              size === 'sm' ? 'text-xs' : 'text-sm'
                            )}
                          >
                            {option.description}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Selection count and limits */}
            {(maxSelections || minSelections) && (
              <div className="mt-2 text-sm text-gray-500">
                {selectedValues.length} selected
                {maxSelections && ` (max ${maxSelections})`}
                {minSelections && ` (min ${minSelections})`}
              </div>
            )}
          </div>
        );
      }}
    </FormField>
  );
}