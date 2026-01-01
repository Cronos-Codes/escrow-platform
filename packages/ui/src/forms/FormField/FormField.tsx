import React from 'react';
import { useController, FieldPath, FieldValues } from 'react-hook-form';
import { useFormContext, useFieldAnalytics } from '../FormProvider';
import { cn } from '../../utils/cn';

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /**
   * Field name (must match form schema)
   */
  name: TName;
  /**
   * Field label
   */
  label?: string;
  /**
   * Field description/helper text
   */
  description?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Custom validation rules
   */
  rules?: object;
  /**
   * Render function for the field
   */
  children: (props: FormFieldRenderProps<TFieldValues, TName>) => React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface FormFieldRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /**
   * Field value
   */
  value: any;
  /**
   * Change handler
   */
  onChange: (value: any) => void;
  /**
   * Blur handler
   */
  onBlur: () => void;
  /**
   * Focus handler
   */
  onFocus: () => void;
  /**
   * Field name
   */
  name: TName;
  /**
   * Whether the field has an error
   */
  hasError: boolean;
  /**
   * Error message
   */
  error?: string;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Field ID for accessibility
   */
  id: string;
  /**
   * ARIA attributes
   */
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  required = false,
  disabled = false,
  rules,
  children,
  className,
}: FormFieldProps<TFieldValues, TName>) {
  const { form } = useFormContext<TFieldValues>();
  const { trackFieldEvent } = useFieldAnalytics(name);

  const {
    field,
    fieldState: { error, isTouched },
  } = useController({
    name,
    control: form.control,
    rules,
    disabled,
  });

  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  const hasError = Boolean(error);

  const handleChange = (value: any) => {
    field.onChange(value);
    trackFieldEvent('field_change', value);
  };

  const handleBlur = () => {
    field.onBlur();
    trackFieldEvent('field_blur');
  };

  const handleFocus = () => {
    trackFieldEvent('field_focus');
  };

  const renderProps: FormFieldRenderProps<TFieldValues, TName> = {
    value: field.value,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    name: field.name,
    hasError,
    error: error?.message,
    disabled,
    required,
    id: fieldId,
    'aria-invalid': hasError,
    'aria-describedby': [
      error ? errorId : undefined,
      description ? descriptionId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined,
    'aria-required': required,
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium text-gray-700',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}

      {description && (
        <p id={descriptionId} className="text-sm text-gray-500">
          {description}
        </p>
      )}

      {children(renderProps)}

      {hasError && (
        <p
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error?.message}
        </p>
      )}
    </div>
  );
}

// Convenience hook for accessing field state
export function useFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(name: TName) {
  const { form } = useFormContext<TFieldValues>();
  const fieldState = form.getFieldState(name);
  const value = form.getValues(name);

  return {
    value,
    error: fieldState.error?.message,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
    isValidating: fieldState.isValidating,
    setValue: (value: any) => form.setValue(name, value),
    clearError: () => form.clearErrors(name),
    validate: () => form.trigger(name),
  };
}