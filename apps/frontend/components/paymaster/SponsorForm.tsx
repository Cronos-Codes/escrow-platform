import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { sponsorService, SponsorProfile } from '@escrow/paymaster';
import { useToast } from '@escrow/ui';

interface SponsorFormProps {
  onClose: () => void;
  onSuccess: (sponsor: any) => void;
}

const SponsorFormSchema = z.object({
  name: z.string().min(1, 'Sponsor name is required'),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  maxDailySpend: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  kycVerified: z.boolean().default(false),
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted')
});

export const SponsorForm: React.FC<SponsorFormProps> = ({ onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    maxDailySpend: '',
    email: '',
    company: '',
    kycVerified: false,
    termsAccepted: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateField = (field: string, value: any) => {
    try {
      SponsorFormSchema.shape[field as keyof typeof SponsorFormSchema.shape].parse(value);
      return '';
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return '';
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    const error = validateField(field, formData[field as keyof typeof formData]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    try {
      SponsorFormSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sponsorProfile: SponsorProfile = {
        name: formData.name,
        address: formData.address,
        maxDailySpend: formData.maxDailySpend,
        email: formData.email || undefined,
        company: formData.company || undefined,
        kycVerified: formData.kycVerified,
        termsAccepted: formData.termsAccepted
      };

      const newSponsor = await sponsorService.createSponsor(sponsorProfile);
      
      setShowSuccess(true);
      
      // Show success animation for 2 seconds
      setTimeout(() => {
        onSuccess(newSponsor);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating sponsor:', error);
      showToast('Failed to create sponsor', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create New Sponsor</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Success State */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.div
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                >
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sponsor Created Successfully!</h3>
                <p className="text-gray-600">The new sponsor has been added to the system.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!showSuccess && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sponsor Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter sponsor name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ethereum Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      onBlur={() => handleBlur('address')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0x..."
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="sponsor@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      onBlur={() => handleBlur('company')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.company ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Company name"
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Gas Limits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gas Limits</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Daily Spend (ETH) *
                  </label>
                  <input
                    type="text"
                    value={formData.maxDailySpend}
                    onChange={(e) => handleInputChange('maxDailySpend', e.target.value)}
                    onBlur={() => handleBlur('maxDailySpend')}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.maxDailySpend ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.1"
                  />
                  {errors.maxDailySpend && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxDailySpend}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum amount of ETH this sponsor can spend on gas per day
                  </p>
                </div>
              </div>

              {/* Verification */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="kycVerified"
                      checked={formData.kycVerified}
                      onChange={(e) => handleInputChange('kycVerified', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="kycVerified" className="ml-2 text-sm text-gray-700">
                      KYC Verified
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <label htmlFor="termsAccepted" className="ml-2 text-sm text-gray-700">
                      I accept the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Terms and Conditions
                      </button>
                      {errors.termsAccepted && (
                        <span className="block text-red-600">{errors.termsAccepted}</span>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Sponsor'
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>

      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
                    <button
                      onClick={() => setShowTermsModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6 prose max-w-none">
                  <h3>Sponsor Agreement</h3>
                  <p>
                    By becoming a sponsor on our escrow platform, you agree to the following terms and conditions:
                  </p>
                  
                  <h4>1. Gas Sponsorship</h4>
                  <ul>
                    <li>You agree to pay for gas costs of whitelisted users</li>
                    <li>Daily spending limits will be enforced</li>
                    <li>You are responsible for maintaining sufficient balance</li>
                  </ul>
                  
                  <h4>2. User Whitelisting</h4>
                  <ul>
                    <li>You can whitelist users to use your gas sponsorship</li>
                    <li>You are responsible for the actions of whitelisted users</li>
                    <li>You can remove users from your whitelist at any time</li>
                  </ul>
                  
                  <h4>3. Compliance</h4>
                  <ul>
                    <li>You must comply with all applicable laws and regulations</li>
                    <li>You are responsible for KYC/AML compliance of your users</li>
                    <li>We reserve the right to suspend or terminate your sponsorship</li>
                  </ul>
                  
                  <h4>4. Liability</h4>
                  <ul>
                    <li>You are liable for all gas costs incurred by your whitelisted users</li>
                    <li>We are not responsible for any losses due to gas price fluctuations</li>
                    <li>You agree to indemnify us against any claims related to your sponsorship</li>
                  </ul>
                </div>
                
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    I Understand
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 