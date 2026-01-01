import React from 'react';
import { z } from 'zod';
import { FormProvider } from '../FormProvider';
import { TextInput } from '../fields/TextInput';
import { NumberInput } from '../fields/NumberInput';
import { SelectField } from '../fields/SelectField';
import { CheckboxGroup } from '../fields/CheckboxGroup';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';

// Zod schema for form validation
const userRegistrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'),
  
  // Account Information
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  // Profile Information
  age: z.number()
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Please enter a valid age'),
  
  country: z.string().min(1, 'Please select your country'),
  
  // Preferences
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  
  // Terms and Conditions
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
  subscribeNewsletter: z.boolean().optional(),
});

type UserRegistrationData = z.infer<typeof userRegistrationSchema>;

const countryOptions = [
  { value: 'us', label: 'United States', icon: <span>🇺🇸</span> },
  { value: 'ca', label: 'Canada', icon: <span>🇨🇦</span> },
  { value: 'uk', label: 'United Kingdom', icon: <span>🇬🇧</span> },
  { value: 'de', label: 'Germany', icon: <span>🇩🇪</span> },
  { value: 'fr', label: 'France', icon: <span>🇫🇷</span> },
  { value: 'jp', label: 'Japan', icon: <span>🇯🇵</span> },
  { value: 'au', label: 'Australia', icon: <span>🇦🇺</span> },
];

const interestOptions = [
  { 
    value: 'technology', 
    label: 'Technology', 
    description: 'Software, hardware, and digital innovations',
    icon: <Icon name="information-circle" size="sm" />
  },
  { 
    value: 'finance', 
    label: 'Finance & Investment', 
    description: 'Trading, investing, and financial markets',
    icon: <Icon name="information-circle" size="sm" />
  },
  { 
    value: 'sports', 
    label: 'Sports & Fitness', 
    description: 'Physical activities and competitive sports',
    icon: <Icon name="information-circle" size="sm" />
  },
  { 
    value: 'travel', 
    label: 'Travel & Adventure', 
    description: 'Exploring new places and cultures',
    icon: <Icon name="information-circle" size="sm" />
  },
  { 
    value: 'arts', 
    label: 'Arts & Culture', 
    description: 'Music, visual arts, and cultural activities',
    icon: <Icon name="information-circle" size="sm" />
  },
  { 
    value: 'food', 
    label: 'Food & Cooking', 
    description: 'Culinary arts and gastronomy',
    icon: <Icon name="information-circle" size="sm" />
  },
];

export interface UserRegistrationFormProps {
  /**
   * Callback when form is submitted successfully
   */
  onSubmit: (data: UserRegistrationData) => void | Promise<void>;
  /**
   * Initial form data
   */
  initialData?: Partial<UserRegistrationData>;
  /**
   * Whether the form is in loading state
   */
  loading?: boolean;
}

export function UserRegistrationForm({
  onSubmit,
  initialData,
  loading = false,
}: UserRegistrationFormProps) {
  const handleSubmit = async (data: UserRegistrationData) => {
    console.log('Form submitted:', data);
    await onSubmit(data);
  };

  const handleFormChange = (data: Partial<UserRegistrationData>) => {
    console.log('Form data changed:', data);
  };

  const handleAnalyticsEvent = (event: any) => {
    console.log('Analytics event:', event);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
        <p className="mt-2 text-gray-600">
          Join our platform and start your journey with us. Fill out the form below to get started.
        </p>
      </div>

      <FormProvider
        schema={userRegistrationSchema}
        defaultValues={initialData}
        onSubmit={(e: any) => {
          if (e?.preventDefault) e.preventDefault();
          void handleSubmit({} as any);
        }}
        onChange={handleFormChange}
        mode="onChange"
        autoSave={{
          enabled: true,
          debounceMs: 1000,
          onSave: (data) => {
            console.log('Auto-saving form data:', data);
            // Save to localStorage or send to server
          },
        }}
        analytics={{
          trackFieldInteractions: true,
          trackCompletionTime: true,
          trackAbandonmentRate: true,
          onAnalyticsEvent: handleAnalyticsEvent,
        }}
      >
        <form className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
                required
                autoComplete="given-name"
                maxLength={50}
                showCharacterCount
              />
              
              <TextInput
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
                required
                autoComplete="family-name"
                maxLength={50}
                showCharacterCount
              />
              
              <TextInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                required
                autoComplete="email"
                leftIcon={<Icon name="information-circle" size="sm" />}
              />
              
              <TextInput
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                required
                autoComplete="tel"
                leftIcon={<Icon name="information-circle" size="sm" />}
              />
            </div>
          </div>

          {/* Account Information Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                name="username"
                label="Username"
                placeholder="Choose a username"
                required
                autoComplete="username"
                description="This will be your unique identifier on the platform"
                maxLength={20}
                showCharacterCount
              />
              
              <NumberInput
                name="age"
                label="Age"
                placeholder="Enter your age"
                required
                min={18}
                max={120}
                showSteppers
              />
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Profile Information
            </h2>
            <div className="space-y-6">
              <SelectField
                name="country"
                label="Country"
                placeholder="Select your country"
                options={countryOptions}
                required
                searchable
                fullWidth
              />
              
              <CheckboxGroup
                name="interests"
                label="Interests"
                description="Select all that apply (minimum 1 required)"
                options={interestOptions}
                required
                columns={2}
                maxSelections={4}
                showSelectAll
              />
            </div>
          </div>

          {/* Terms and Conditions Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Terms and Conditions
            </h2>
            <CheckboxGroup
              name="agreeToTerms"
              options={[
                {
                  value: 'true',
                  label: 'I agree to the Terms of Service and Privacy Policy',
                  description: 'By checking this box, you agree to our terms and conditions',
                },
              ]}
              required
            />
            
            <div className="mt-4">
              <CheckboxGroup
                name="subscribeNewsletter"
                options={[
                  {
                    value: 'true',
                    label: 'Subscribe to our newsletter',
                    description: 'Get updates about new features and promotions (optional)',
                  },
                ]}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftIcon={<Icon name="check" size="sm" />}
            >
              Create Account
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

// Example usage component
export function UserRegistrationExample() {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (data: UserRegistrationData) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('User registered:', data);
    alert('Account created successfully!');
    
    setLoading(false);
  };

  return (
    <UserRegistrationForm
      onSubmit={handleSubmit}
      loading={loading}
      initialData={{
        country: 'us',
        subscribeNewsletter: true,
      }}
    />
  );
}