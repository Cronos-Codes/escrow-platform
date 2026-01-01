import React, { createContext, useContext, useCallback, useEffect } from 'react';
import {
  useForm,
  FormProvider as RHFFormProvider,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface FormContextValue<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  submitCount: number;
  onSubmit: (data: T) => void | Promise<void>;
  onError?: (errors: any) => void;
  reset: () => void;
  clearErrors: () => void;
  setFieldValue: (name: keyof T, value: any) => void;
  getFieldValue: (name: keyof T) => any;
  validateField: (name: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  trackAnalyticsEvent: (event: Omit<FormAnalyticsEvent, 'timestamp'>) => void;
}

const FormContext = createContext<FormContextValue<any> | null>(null);

export interface FormProviderProps<T extends FieldValues = FieldValues> {
  /**
   * Zod schema for form validation
   */
  schema?: z.ZodSchema<T>;
  /**
   * Default values for the form
   */
  defaultValues?: DefaultValues<T>;
  /**
   * Form submission handler
   */
  onSubmit: SubmitHandler<T>;
  /**
   * Error handler for form submission
   */
  onError?: SubmitErrorHandler<T>;
  /**
   * Callback when form values change
   */
  onChange?: (values: T) => void;
  /**
   * Auto-save configuration
   */
  autoSave?: {
    enabled: boolean;
    debounceMs?: number;
    onSave?: (values: T) => void | Promise<void>;
  };
  /**
   * Form validation mode
   */
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  /**
   * Whether to reset form after successful submission
   */
  resetOnSubmit?: boolean;
  /**
   * Form analytics configuration
   */
  analytics?: {
    trackFieldInteractions?: boolean;
    trackCompletionTime?: boolean;
    trackAbandonmentRate?: boolean;
    onAnalyticsEvent?: (event: FormAnalyticsEvent) => void;
  };
  /**
   * Children components
   */
  children: React.ReactNode;
  /**
   * Additional form configuration
   */
  formConfig?: {
    shouldFocusError?: boolean;
    shouldUnregister?: boolean;
    shouldUseNativeValidation?: boolean;
  };
}

export interface FormAnalyticsEvent {
  type: 'field_focus' | 'field_blur' | 'field_change' | 'form_submit' | 'form_error' | 'form_abandon';
  fieldName?: string;
  value?: any;
  timestamp: number;
  formId?: string;
}

export function FormProvider<T extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onError,
  onChange,
  autoSave,
  mode = 'onChange',
  resetOnSubmit = false,
  analytics,
  children,
  formConfig = {},
}: FormProviderProps<T>) {
  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode,
    shouldFocusError: formConfig.shouldFocusError ?? true,
    shouldUnregister: formConfig.shouldUnregister ?? false,
    shouldUseNativeValidation: formConfig.shouldUseNativeValidation ?? false,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty, isValid, errors, submitCount },
    reset,
    clearErrors,
    setValue,
    getValues,
    trigger,
    watch,
  } = form;

  // Auto-save functionality
  const [autoSaveTimer, setAutoSaveTimer] = React.useState<NodeJS.Timeout | null>(null);

  const handleAutoSave = useCallback(
    (values: T) => {
      if (!autoSave?.enabled || !autoSave.onSave) return;

      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      const timer = setTimeout(() => {
        autoSave.onSave!(values);
        trackAnalyticsEvent({ type: 'field_change' });
      }, autoSave.debounceMs || 1000);

      setAutoSaveTimer(timer);
    },
    [autoSave, autoSaveTimer]
  );

  // Watch form values for changes
  const watchedValues = watch();

  useEffect(() => {
    if (onChange) {
      onChange(watchedValues);
    }
    if (autoSave?.enabled) {
      handleAutoSave(watchedValues);
    }
  }, [watchedValues, onChange, handleAutoSave, autoSave?.enabled]);

  // Analytics tracking
  const trackAnalyticsEvent = useCallback(
    (event: Omit<FormAnalyticsEvent, 'timestamp'>) => {
      if (analytics?.onAnalyticsEvent) {
        analytics.onAnalyticsEvent({
          ...event,
          timestamp: Date.now(),
        });
      }
    },
    [analytics]
  );

  // Form submission handler
  const handleFormSubmit = useCallback(
    async (data: T) => {
      try {
        trackAnalyticsEvent({ type: 'form_submit' });
        await onSubmit(data);
        if (resetOnSubmit) {
          reset();
        }
      } catch (error) {
        trackAnalyticsEvent({ type: 'form_error' });
        throw error;
      }
    },
    [onSubmit, resetOnSubmit, reset, trackAnalyticsEvent]
  );

  const handleFormError = useCallback(
    (errors: any) => {
      trackAnalyticsEvent({ type: 'form_error' });
      onError?.(errors);
    },
    [onError, trackAnalyticsEvent]
  );

  // Helper functions
  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setValue(name as any, value, { shouldDirty: true, shouldValidate: true });
    },
    [setValue]
  );

  const getFieldValue = useCallback(
    (name: keyof T) => {
      return getValues(name as any);
    },
    [getValues]
  );

  const validateField = useCallback(
    async (name: keyof T) => {
      const result = await trigger(name as any);
      return result;
    },
    [trigger]
  );

  const validateForm = useCallback(async () => {
    const result = await trigger();
    return result;
  }, [trigger]);

  // Convert errors to simple string format
  const formErrors = React.useMemo(() => {
    const errorMap: Record<string, string> = {};
    Object.entries(errors).forEach(([key, error]) => {
      const anyErr = error as any;
      if (anyErr?.message) {
        errorMap[key] = String(anyErr.message);
      }
    });
    return errorMap;
  }, [errors]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // Form abandonment tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty && analytics?.trackAbandonmentRate) {
        trackAnalyticsEvent({ type: 'form_abandon' });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, analytics?.trackAbandonmentRate, trackAnalyticsEvent]);

  const contextValue = {
    form,
    isSubmitting,
    isDirty,
    isValid,
    errors: formErrors,
    submitCount,
    onSubmit: (data: T) => handleSubmit(handleFormSubmit, handleFormError)(),
    onError: handleFormError,
    reset,
    clearErrors,
    setFieldValue,
    getFieldValue,
    validateField,
    validateForm,
    trackAnalyticsEvent,
  } as FormContextValue<T>;

  return (
    <FormContext.Provider value={contextValue}>
      <RHFFormProvider {...form}>
        {children}
      </RHFFormProvider>
    </FormContext.Provider>
  );
}

export function useFormContext<T extends FieldValues = FieldValues>(): FormContextValue<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context as FormContextValue<T>;
}

export function useFieldAnalytics(fieldName: string) {
  const { trackAnalyticsEvent } = useFormContext();

  const trackFieldEvent = useCallback(
    (type: 'field_focus' | 'field_blur' | 'field_change', value?: any) => {
      trackAnalyticsEvent({ type, fieldName, value });
    },
    [trackAnalyticsEvent, fieldName]
  );

  return { trackFieldEvent };
}