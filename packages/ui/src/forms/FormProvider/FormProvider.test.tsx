import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { FormProvider, useFormContext } from './FormProvider';
import { TextInput } from '../fields/TextInput';
import { Button } from '../../atoms/Button';

// Test schema
const testSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(18, 'Must be at least 18 years old'),
});

type TestFormData = z.infer<typeof testSchema>;

// Test component that uses the form context
function TestForm() {
  const { onSubmit, isSubmitting, errors } = useFormContext<TestFormData>();

  return (
    <form onSubmit={onSubmit}>
      <TextInput name="name" label="Name" />
      <TextInput name="email" label="Email" type="email" />
      <TextInput name="age" label="Age" />
      
      <Button type="submit" loading={isSubmitting}>
        Submit
      </Button>
      
      {Object.keys(errors).length > 0 && (
        <div data-testid="form-errors">
          {Object.entries(errors).map(([field, error]) => (
            <div key={field}>{field}: {error}</div>
          ))}
        </div>
      )}
    </form>
  );
}

describe('FormProvider', () => {
  const mockOnSubmit = vi.fn();
  const mockOnError = vi.fn();
  const mockOnChange = vi.fn();
  const mockAnalyticsEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders form with initial values', () => {
      const initialData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      render(
        <FormProvider
          schema={testSchema}
          defaultValues={initialData}
          onSubmit={mockOnSubmit}
        >
          <TestForm />
        </FormProvider>
      );

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    });

    it('calls onSubmit with form data when valid', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      render(
        <FormProvider
          schema={testSchema}
          defaultValues={validData}
          onSubmit={mockOnSubmit}
        >
          <TestForm />
        </FormProvider>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(validData);
      });
    });

    it('shows validation errors for invalid data', async () => {
      render(
        <FormProvider
          schema={testSchema}
          onSubmit={mockOnSubmit}
          onError={mockOnError}
        >
          <TestForm />
        </FormProvider>
      );

      // Fill in invalid data
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const ageInput = screen.getByLabelText(/age/i);

      fireEvent.change(nameInput, { target: { value: 'A' } }); // Too short
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } }); // Invalid format
      fireEvent.change(ageInput, { target: { value: '16' } }); // Too young

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
        expect(screen.getByText(/must be at least 18 years old/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form State Management', () => {
    it('tracks form state correctly', async () => {
      let formContext: any;

      function TestFormWithContext() {
        formContext = useFormContext();
        return <TestForm />;
      }

      render(
        <FormProvider
          schema={testSchema}
          onSubmit={mockOnSubmit}
        >
          <TestFormWithContext />
        </FormProvider>
      );

      // Initially form should not be dirty
      expect(formContext.isDirty).toBe(false);

      // Change a field
      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(formContext.isDirty).toBe(true);
      });
    });

    it('provides helper functions', async () => {
      let formContext: any;

      function TestFormWithHelpers() {
        formContext = useFormContext<TestFormData>();
        
        return (
          <div>
            <TestForm />
            <button
              type="button"
              onClick={() => formContext.setFieldValue('name', 'Test Name')}
            >
              Set Name
            </button>
            <button
              type="button"
              onClick={() => formContext.reset()}
            >
              Reset Form
            </button>
          </div>
        );
      }

      render(
        <FormProvider
          schema={testSchema}
          onSubmit={mockOnSubmit}
        >
          <TestFormWithHelpers />
        </FormProvider>
      );

      // Test setFieldValue
      const setNameButton = screen.getByRole('button', { name: /set name/i });
      fireEvent.click(setNameButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
      });

      // Test reset
      const resetButton = screen.getByRole('button', { name: /reset form/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.queryByDisplayValue('Test Name')).not.toBeInTheDocument();
      });
    });
  });

  describe('Auto-save Functionality', () => {
    it('calls auto-save callback after debounce', async () => {
      const mockAutoSave = vi.fn();

      render(
        <FormProvider
          schema={testSchema}
          onSubmit={mockOnSubmit}
          autoSave={{
            enabled: true,
            debounceMs: 100,
            onSave: mockAutoSave,
          }}
        >
          <TestForm />
        </FormProvider>
      );

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'John' } });

      // Auto-save should be called after debounce
      await waitFor(() => {
        expect(mockAutoSave).toHaveBeenCalled();
      }, { timeout: 200 });
    });
  });

  describe('Analytics Integration', () => {
    it('tracks form analytics events', async () => {
      render(
        <FormProvider
          schema={testSchema}
          onSubmit={mockOnSubmit}
          analytics={{
            trackFieldInteractions: true,
            onAnalyticsEvent: mockAnalyticsEvent,
          }}
        >
          <TestForm />
        </FormProvider>
      );

      const nameInput = screen.getByLabelText(/name/i);
      
      // Focus event
      fireEvent.focus(nameInput);
      expect(mockAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'field_focus',
          fieldName: 'name',
        })
      );

      // Change event
      fireEvent.change(nameInput, { target: { value: 'John' } });
      expect(mockAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'field_change',
          fieldName: 'name',
          value: 'John',
        })
      );

      // Blur event
      fireEvent.blur(nameInput);
      expect(mockAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'field_blur',
          fieldName: 'name',
        })
      );
    });

    it('tracks form submission events', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      render(
        <FormProvider
          schema={testSchema}
          defaultValues={validData}
          onSubmit={mockOnSubmit}
          analytics={{
            onAnalyticsEvent: mockAnalyticsEvent,
          }}
        >
          <TestForm />
        </FormProvider>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAnalyticsEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'form_submit',
          })
        );
      });
    });
  });

  describe('Data Persistence', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    it('persists form data to localStorage', async () => {
      const storageKey = 'test-form-data';

      render(
        <FormProvider
          schema={testSchema}
          onSubmit={mockOnSubmit}
          persistData={true}
          storageKey={storageKey}
        >
          <TestForm />
        </FormProvider>
      );

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'John' } });

      await waitFor(() => {
        const savedData = localStorage.getItem(storageKey);
        expect(savedData).toBeTruthy();
        const parsedData = JSON.parse(savedData!);
        expect(parsedData.name).toBe('John');
      });
    });

    it('restores form data from localStorage', () => {
      const storageKey = 'test-form-data';
      const savedData = { name: 'Saved Name', email: 'saved@example.com' };
      
      localStorage.setItem(storageKey, JSON.stringify(savedData));

      render(
        <FormProvider
          schema={testSchema}
          onSubmit={mockOnSubmit}
          persistData={true}
          storageKey={storageKey}
        >
          <TestForm />
        </FormProvider>
      );

      expect(screen.getByDisplayValue('Saved Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('saved@example.com')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles form submission errors', async () => {
      const mockOnSubmitWithError = vi.fn().mockRejectedValue(new Error('Submission failed'));

      render(
        <FormProvider
          schema={testSchema}
          defaultValues={{ name: 'John', email: 'john@example.com', age: 25 }}
          onSubmit={mockOnSubmitWithError}
          onError={mockOnError}
          analytics={{
            onAnalyticsEvent: mockAnalyticsEvent,
          }}
        >
          <TestForm />
        </FormProvider>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAnalyticsEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'form_error',
          })
        );
      });
    });

    it('throws error when useFormContext is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestForm />);
      }).toThrow('useFormContext must be used within a FormProvider');

      consoleSpy.mockRestore();
    });
  });
});