import React from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormFieldProps } from '../../FormField';
import { Dropdown, DropdownOption } from '../../../molecules/Dropdown';

export interface SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<FormFieldProps<TFieldValues, TName>, 'children'> {
  /**
   * Options for the select field
   */
  options: DropdownOption[];
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether multiple selections are allowed
   */
  multiple?: boolean;
  /**
   * Whether the options can be searched/filtered
   */
  searchable?: boolean;
  /**
   * Whether new options can be created
   */
  creatable?: boolean;
  /**
   * Size of the select field
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the select takes full width
   */
  fullWidth?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Callback when options are searched (for async loading)
   */
  onSearch?: (query: string) => void;
  /**
   * Callback when a new option is created
   */
  onCreate?: (value: string) => void;
  /**
   * Maximum number of selections (for multiple)
   */
  maxSelections?: number;
  /**
   * Custom option renderer
   */
  renderOption?: (option: DropdownOption, isSelected: boolean) => React.ReactNode;
  /**
   * Custom value renderer (for selected values)
   */
  renderValue?: (option: DropdownOption) => React.ReactNode;
}

export function SelectField<
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
  placeholder = 'Select an option',
  multiple = false,
  searchable = false,
  creatable = false,
  size = 'md',
  fullWidth = false,
  loading = false,
  onSearch,
  onCreate,
  maxSelections,
  renderOption,
  renderValue,
}: SelectFieldProps<TFieldValues, TName>) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredOptions, setFilteredOptions] = React.useState(options);

  // Filter options based on search query
  React.useEffect(() => {
    if (!searchable || !searchQuery) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add create option if creatable and no exact match
    if (creatable && searchQuery && !options.some(opt => 
      opt.label.toLowerCase() === searchQuery.toLowerCase() ||
      opt.value.toLowerCase() === searchQuery.toLowerCase()
    )) {
      filtered.unshift({
        value: `__create__${searchQuery}`,
        label: `Create "${searchQuery}"`,
        icon: <span className="text-blue-600">+</span>,
      });
    }

    setFilteredOptions(filtered);
  }, [options, searchQuery, searchable, creatable]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
      disabled={disabled}
      rules={rules}
      className={className}
    >
      {(fieldProps) => {
        const handleChange = (value: string) => {
          // Handle create option
          if (value.startsWith('__create__')) {
            const newValue = value.replace('__create__', '');
            onCreate?.(newValue);
            return;
          }

          if (multiple) {
            const currentValues = Array.isArray(fieldProps.value) ? fieldProps.value : [];
            
            if (currentValues.includes(value)) {
              // Remove if already selected
              const newValues = currentValues.filter(v => v !== value);
              fieldProps.onChange(newValues);
            } else {
              // Add if not at max selections
              if (!maxSelections || currentValues.length < maxSelections) {
                fieldProps.onChange([...currentValues, value]);
              }
            }
          } else {
            fieldProps.onChange(value);
          }
        };

        const getSelectedOptions = () => {
          if (multiple) {
            const values = Array.isArray(fieldProps.value) ? fieldProps.value : [];
            return options.filter(option => values.includes(option.value));
          } else {
            return options.find(option => option.value === fieldProps.value);
          }
        };

        const renderSelectedValue = () => {
          if (multiple) {
            const selectedOptions = getSelectedOptions() as DropdownOption[];
            if (selectedOptions.length === 0) return placeholder;
            
            if (selectedOptions.length === 1) {
              return renderValue ? renderValue(selectedOptions[0]) : selectedOptions[0].label;
            }
            
            return `${selectedOptions.length} selected`;
          } else {
            const selectedOption = getSelectedOptions() as DropdownOption | undefined;
            if (!selectedOption) return placeholder;
            
            return renderValue ? renderValue(selectedOption) : selectedOption.label;
          }
        };

        return (
          <div className="relative">
            {searchable ? (
              <div className="relative">
                <input
                  type="text"
                  id={fieldProps.id}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onBlur={fieldProps.onBlur}
                  onFocus={fieldProps.onFocus}
                  disabled={fieldProps.disabled || loading}
                  placeholder={placeholder}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-invalid={fieldProps['aria-invalid']}
                  aria-describedby={fieldProps['aria-describedby']}
                  aria-required={fieldProps['aria-required']}
                />
                
                {/* Dropdown with filtered options */}
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="max-h-60 overflow-auto py-1">
                    {filteredOptions.map((option) => {
                      const isSelected = multiple
                        ? Array.isArray(fieldProps.value) && fieldProps.value.includes(option.value)
                        : fieldProps.value === option.value;

                      return (
                        <div
                          key={option.value}
                          onClick={() => handleChange(option.value)}
                          className={`flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-gray-100 ${
                            isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                          } ${option.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          {renderOption ? renderOption(option, isSelected) : (
                            <>
                              {option.icon && <span className="mr-2">{option.icon}</span>}
                              {option.label}
                              {isSelected && <span className="ml-auto">✓</span>}
                            </>
                          )}
                        </div>
                      );
                    })}
                    
                    {filteredOptions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No options found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Dropdown
                options={filteredOptions}
                value={multiple ? undefined : fieldProps.value}
                onChange={handleChange}
                placeholder={String(renderSelectedValue())}
                disabled={fieldProps.disabled || loading}
                size={size}
                fullWidth={fullWidth}
                error={fieldProps.error}
              />
            )}

            {/* Selected values display for multiple selection */}
            {multiple && Array.isArray(fieldProps.value) && fieldProps.value.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {fieldProps.value.map((value: string) => {
                  const option = options.find(opt => opt.value === value);
                  if (!option) return null;

                  return (
                    <span
                      key={value}
                      className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {option.label}
                      <button
                        type="button"
                        onClick={() => handleChange(value)}
                        className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                        aria-label={`Remove ${option.label}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Max selections warning */}
            {multiple && maxSelections && Array.isArray(fieldProps.value) && fieldProps.value.length >= maxSelections && (
              <p className="mt-1 text-xs text-amber-600">
                Maximum {maxSelections} selections allowed
              </p>
            )}
          </div>
        );
      }}
    </FormField>
  );
}