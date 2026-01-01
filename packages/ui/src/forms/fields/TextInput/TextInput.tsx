import React from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormFieldProps } from '../../FormField';
import { Input, InputProps } from '../../../atoms/Input';
import { cn } from '../../../utils/cn';

export interface TextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<FormFieldProps<TFieldValues, TName>, 'children'>,
    Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'id'> {
  /**
   * Input type
   */
  type?: 'text' | 'email' | 'tel' | 'url' | 'search';
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Maximum length
   */
  maxLength?: number;
  /**
   * Minimum length
   */
  minLength?: number;
  /**
   * Input pattern for validation
   */
  pattern?: string;
  /**
   * Whether to show character count
   */
  showCharacterCount?: boolean;
  /**
   * Auto-complete attribute
   */
  autoComplete?: string;
  /**
   * Whether to auto-focus the input
   */
  autoFocus?: boolean;
  /**
   * Input mode for mobile keyboards
   */
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search';
}

export function TextInput<
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
  type = 'text',
  placeholder,
  maxLength,
  minLength,
  pattern,
  showCharacterCount = false,
  autoComplete,
  autoFocus,
  inputMode,
  size,
  leftIcon,
  rightIcon,
  ...props
}: TextInputProps<TFieldValues, TName>) {
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
      {(fieldProps) => (
        <div className="relative">
          <Input
            {...props}
            type={type}
            id={fieldProps.id}
            name={fieldProps.name}
            value={fieldProps.value || ''}
            onChange={(e) => fieldProps.onChange(e.target.value)}
            onBlur={fieldProps.onBlur}
            onFocus={fieldProps.onFocus}
            disabled={fieldProps.disabled}
            required={fieldProps.required}
            placeholder={placeholder}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            inputMode={inputMode}
            size={size}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            error={fieldProps.error}
            aria-invalid={fieldProps['aria-invalid']}
            aria-describedby={fieldProps['aria-describedby']}
            aria-required={fieldProps['aria-required']}
            className={cn(
              fieldProps.hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
          />
          
          {showCharacterCount && maxLength && (
            <div className="mt-1 text-right">
              <span
                className={cn(
                  'text-xs',
                  (fieldProps.value?.length || 0) > maxLength * 0.9
                    ? 'text-red-600'
                    : 'text-gray-500'
                )}
              >
                {fieldProps.value?.length || 0}/{maxLength}
              </span>
            </div>
          )}
        </div>
      )}
    </FormField>
  );
}