import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { z } from 'zod';
import { FormProvider } from './FormProvider';
import { TextInput } from '../fields/TextInput';
import { NumberInput } from '../fields/NumberInput';
import { SelectField } from '../fields/SelectField';
import { CheckboxGroup } from '../fields/CheckboxGroup';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';

const meta: Meta<typeof FormProvider> = {
  title: 'Forms/FormProvider',
  component: FormProvider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive form provider with React Hook Form integration, schema validation, auto-save, and analytics.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Contact Form Schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  priority: z.string().min(1, 'Please select a priority'),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const priorityOptions = [
  { value: 'low', label: 'Low Priority', icon: <Icon name="information-circle" size="sm" /> },
  { value: 'medium', label: 'Medium Priority', icon: <Icon name="exclamation-triangle" size="sm" /> },
  { value: 'high', label: 'High Priority', icon: <Icon name="exclamation-triangle" size="sm" /> },
  { value: 'urgent', label: 'Urgent', icon: <Icon name="exclamation-triangle" size="sm" /> },
];

const categoryOptions = [
  { value: 'technical', label: 'Technical Support', description: 'Issues with the platform or features' },
  { value: 'billing', label: 'Billing & Payments', description: 'Questions about charges or payments' },
  { value: 'account', label: 'Account Management', description: 'Profile, settings, and account issues' },
  { value: 'feature', label: 'Feature Request', description: 'Suggestions for new features' },
  { value: 'bug', label: 'Bug Report', description: 'Report a problem or error' },
  { value: 'other', label: 'Other', description: 'General inquiries and other topics' },
];

function ContactForm() {
  const handleSubmit = async (data: ContactFormData) => {
    console.log('Form submitted:', data);
    alert('Thank you for your message! We will get back to you soon.');
  };

  const handleFormChange = (data: Partial<ContactFormData>) => {
    console.log('Form changed:', data);
  };

  const handleAnalyticsEvent = (event: any) => {
    console.log('Analytics event:', event);
  };

  return (
    <FormProvider
      schema={contactSchema}
      onSubmit={handleSubmit}
      onChange={handleFormChange}
      mode="onChange"
      autoSave={{
        enabled: true,
        debounceMs: 1000,
        onSave: (data) => console.log('Auto-saving:', data),
      }}
      analytics={{
        trackFieldInteractions: true,
        trackCompletionTime: true,
        onAnalyticsEvent: handleAnalyticsEvent,
      }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
          <p className="mt-2 text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              required
              maxLength={100}
              showCharacterCount
            />
            
            <TextInput
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
              leftIcon={<Icon name="information-circle" size="sm" />}
            />
          </div>

          <SelectField
            name="priority"
            label="Priority Level"
            placeholder="Select priority level"
            options={priorityOptions}
            required
            fullWidth
          />

          <TextInput
            name="subject"
            label="Subject"
            placeholder="Brief description of your inquiry"
            required
            maxLength={200}
            showCharacterCount
          />

          <CheckboxGroup
            name="categories"
            label="Categories"
            description="Select all categories that apply to your inquiry"
            options={categoryOptions}
            required
            columns={2}
            maxSelections={3}
          />

          <TextInput
            name="message"
            label="Message"
            placeholder="Please provide details about your inquiry..."
            required
            maxLength={1000}
            showCharacterCount
          />

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" leftIcon={<Icon name="check" size="sm" />}>
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

// Registration Form Schema
const registrationSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  age: z.number().min(18, 'You must be at least 18 years old'),
  country: z.string().min(1, 'Please select your country'),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
];

const interestOptions = [
  { value: 'tech', label: 'Technology', description: 'Software and hardware' },
  { value: 'finance', label: 'Finance', description: 'Investment and trading' },
  { value: 'sports', label: 'Sports', description: 'Physical activities' },
  { value: 'travel', label: 'Travel', description: 'Exploring new places' },
  { value: 'food', label: 'Food', description: 'Cooking and dining' },
];

function RegistrationForm() {
  const handleSubmit = async (data: RegistrationFormData) => {
    console.log('Registration submitted:', data);
    alert('Account created successfully!');
  };

  return (
    <FormProvider
      schema={registrationSchema}
      onSubmit={handleSubmit}
      mode="onChange"
      resetOnSubmit={true}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">
            Join our platform and start your journey with us.
          </p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              name="username"
              label="Username"
              placeholder="Choose a username"
              required
              maxLength={20}
              showCharacterCount
            />
            
            <TextInput
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              name="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              required
            />
            
            <TextInput
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput
              name="age"
              label="Age"
              placeholder="Enter your age"
              required
              min={18}
              max={120}
              showSteppers
            />
            
            <SelectField
              name="country"
              label="Country"
              placeholder="Select your country"
              options={countryOptions}
              required
              fullWidth
            />
          </div>

          <CheckboxGroup
            name="interests"
            label="Interests"
            description="Select your areas of interest"
            options={interestOptions}
            required
            columns={2}
            showSelectAll
          />

          <CheckboxGroup
            name="agreeToTerms"
            options={[
              {
                value: 'true',
                label: 'I agree to the Terms of Service and Privacy Policy',
                description: 'Required to create an account',
              },
            ]}
            required
          />

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

export const ContactFormExample: Story = {
  render: () => <ContactForm />,
  parameters: {
    docs: {
      description: {
        story: 'A comprehensive contact form with validation, auto-save, and analytics tracking.',
      },
    },
  },
};

export const RegistrationFormExample: Story = {
  render: () => <RegistrationForm />,
  parameters: {
    docs: {
      description: {
        story: 'A user registration form with complex validation including password confirmation.',
      },
    },
  },
};

// Simple form for basic demonstration
function SimpleForm() {
  const simpleSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
  });

  return (
    <FormProvider
      schema={simpleSchema}
      onSubmit={(data) => console.log('Simple form:', data)}
    >
      <form className="space-y-4 max-w-md">
        <TextInput name="name" label="Name" required />
        <TextInput name="email" label="Email" type="email" required />
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}

export const SimpleFormExample: Story = {
  render: () => <SimpleForm />,
  parameters: {
    docs: {
      description: {
        story: 'A minimal form example showing basic usage of the FormProvider.',
      },
    },
  },
};

// Form with auto-save demonstration
function AutoSaveForm() {
  const [savedData, setSavedData] = React.useState<any>(null);

  const autoSaveSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
  });

  return (
    <div className="space-y-4">
      <FormProvider
        schema={autoSaveSchema}
        onSubmit={(data) => console.log('Final submit:', data)}
        autoSave={{
          enabled: true,
          debounceMs: 500,
          onSave: (data) => {
            setSavedData({ ...data, savedAt: new Date().toLocaleTimeString() });
          },
        }}
      >
        <form className="space-y-4 max-w-md">
          <TextInput name="title" label="Title" placeholder="Enter title..." />
          <TextInput name="content" label="Content" placeholder="Enter content..." />
          <Button type="submit">Save Final</Button>
        </form>
      </FormProvider>

      {savedData && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-medium text-green-800">Auto-saved at {savedData.savedAt}</h3>
          <pre className="mt-2 text-sm text-green-700">
            {JSON.stringify(savedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export const AutoSaveExample: Story = {
  render: () => <AutoSaveForm />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates auto-save functionality with debounced updates.',
      },
    },
  },
};