import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDisputeTriage } from '../../hooks/useDisputeTriage';
import { useAuth } from '@escrow/auth';
import { z } from 'zod';

// ============ Types ============

interface DisputeFormData {
  dealId: string;
  reason: string;
  severity: number;
  riskLevel: 'low' | 'med' | 'high';
  evidence: string[];
  contactInfo: string;
}

interface DisputeFormProps {
  dealId?: string;
  onSubmit: (data: DisputeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// ============ Validation Schema ============

const DisputeFormSchema = z.object({
  dealId: z.string().min(1, 'Deal ID is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(5000, 'Reason must be less than 5000 characters'),
  severity: z.number().min(1).max(5),
  riskLevel: z.enum(['low', 'med', 'high']),
  evidence: z.array(z.string()).optional(),
  contactInfo: z.string().optional()
});

// ============ Component ============

export const DisputeForm: React.FC<DisputeFormProps> = ({
  dealId: initialDealId = '',
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { user } = useAuth();
  // Fix: useDisputeTriage returns { classifyDispute, isLoading, error, classification }
  const { classifyDispute, isLoading: isTriageLoading, error: triageError, classification } = useDisputeTriage();

  const [formData, setFormData] = useState<DisputeFormData>({
    dealId: initialDealId,
    reason: '',
    severity: 3,
    riskLevel: 'med',
    evidence: [],
    contactInfo: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [profanityDetected, setProfanityDetected] = useState(false);

  // ============ Effects ============

  useEffect(() => {
    if (user) {
      // Check KYC status
      checkKYCStatus();
    }
  }, [user]);

  useEffect(() => {
    // Auto-classify when reason changes
    if (formData.reason.length > 10) {
      const timeoutId = setTimeout(() => {
        handleAutoClassify();
      }, 2000); // Debounce for 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [formData.reason]);

  // ============ Handlers ============

  const checkKYCStatus = useCallback(async () => {
    if (!user) return;

    try {
      // This would check KYC status from backend
      // For now, we'll simulate it
      const response = await fetch(`/api/user/kyc-status?userId=${user.uid}`);
      const data = await response.json();
      setKycVerified(data.kycVerified);
    } catch (error) {
      console.error('Error checking KYC status:', error);
      setKycVerified(false);
    }
  }, [user]);

  const handleAutoClassify = useCallback(async () => {
    if (!user || formData.reason.length < 10) return;

    try {
      await classifyDispute(formData.reason, user.uid);
    } catch (error) {
      console.error('Auto-classification failed:', error);
    }
  }, [classifyDispute, formData.reason, user]);

  const validateForm = useCallback((data: DisputeFormData): boolean => {
    try {
      DisputeFormSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, []);

  const checkProfanity = useCallback((text: string): boolean => {
    const profanityPatterns = [
      /\b(fuck|shit|bitch|asshole|dick|pussy|cunt)\b/gi,
      /\b(kill|murder|suicide|bomb|terrorist)\b/gi,
      /\b(hack|crack|steal|fraud|scam)\b/gi
    ];

    return profanityPatterns.some(pattern => pattern.test(text));
  }, []);

  const handleInputChange = useCallback((field: keyof DisputeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Check for profanity in reason field
    if (field === 'reason') {
      const hasProfanity = checkProfanity(value);
      setProfanityDetected(hasProfanity);
      
      if (hasProfanity) {
        setErrors(prev => ({ ...prev, reason: 'Content contains inappropriate language' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.reason;
          return newErrors;
        });
      }
    }
  }, [checkProfanity]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrors({ general: 'You must be logged in to file a dispute' });
      return;
    }

    if (!kycVerified) {
      setErrors({ general: 'KYC verification required to file disputes' });
      return;
    }

    if (profanityDetected) {
      setErrors({ reason: 'Please remove inappropriate language from your dispute' });
      return;
    }

    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to submit dispute' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, kycVerified, profanityDetected, validateForm, onSubmit]);

  const handleAddEvidence = useCallback(() => {
    const evidenceUrl = prompt('Enter evidence URL:');
    if (evidenceUrl && evidenceUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, evidenceUrl.trim()]
      }));
    }
  }, []);

  const handleRemoveEvidence = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  }, []);

  // ============ Render ============

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to file a dispute.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">File Dispute</h2>
          <p className="text-gray-600 mt-1">Submit a formal dispute for resolution</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* KYC Status */}
      <AnimatePresence>
        {!kycVerified && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 font-medium">KYC Verification Required</span>
            </div>
            <p className="text-yellow-700 mt-1 text-sm">
              You must complete KYC verification before filing disputes. 
              <button className="text-yellow-800 underline ml-1">Complete KYC</button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* General Error */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{errors.general}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Deal ID */}
        <div>
          <label htmlFor="dealId" className="block text-sm font-medium text-gray-700 mb-2">
            Deal ID *
          </label>
          <input
            type="text"
            id="dealId"
            value={formData.dealId}
            onChange={(e) => handleInputChange('dealId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.dealId ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter the deal ID"
            disabled={!!initialDealId}
          />
          {errors.dealId && (
            <p className="text-red-600 text-sm mt-1">{errors.dealId}</p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Dispute Reason *
          </label>
          <div className="relative">
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.reason || profanityDetected ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the issue in detail. Be specific about what went wrong and provide any relevant context."
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {formData.reason.length}/5000
            </div>
          </div>
          {errors.reason && (
            <p className="text-red-600 text-sm mt-1">{errors.reason}</p>
          )}
          {profanityDetected && (
            <p className="text-red-600 text-sm mt-1">
              ⚠️ Inappropriate language detected. Please revise your dispute.
            </p>
          )}
        </div>

        {/* AI Classification */}
        <AnimatePresence>
          {isTriageLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-800">Analyzing dispute content...</span>
              </div>
            </motion.div>
          )}

          {classification && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-green-800 font-medium">AI Analysis Complete</h4>
                  <p className="text-green-700 text-sm mt-1">
                    Category: {classification.category} | 
                    Severity: {classification.severity}/5 | 
                    Risk: {classification.riskLevel}
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Confidence: {Math.round(classification.confidence * 100)}%
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    classification.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                    classification.riskLevel === 'med' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {classification.riskLevel.toUpperCase()} RISK
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {RangeError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 text-sm">AI analysis unavailable. Manual review will be required.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity Level *
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleInputChange('severity', level)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.severity === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg font-bold">{level}</div>
                <div className="text-xs">
                  {level === 1 && 'Minor'}
                  {level === 2 && 'Low'}
                  {level === 3 && 'Medium'}
                  {level === 4 && 'High'}
                  {level === 5 && 'Critical'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Level *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'med', 'high'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleInputChange('riskLevel', level)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.riskLevel === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium capitalize">{level}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Evidence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evidence (Optional)
          </label>
          <div className="space-y-2">
            {formData.evidence.map((url, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    const newEvidence = [...formData.evidence];
                    newEvidence[index] = e.target.value;
                    handleInputChange('evidence', newEvidence);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Evidence URL"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveEvidence(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddEvidence}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Evidence URL
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Information (Optional)
          </label>
          <input
            type="text"
            id="contactInfo"
            value={formData.contactInfo}
            onChange={(e) => handleInputChange('contactInfo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Phone number or additional contact method"
          />
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Preview */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-900 mb-2">Dispute Preview</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Deal ID:</strong> {formData.dealId}</p>
                <p><strong>Severity:</strong> {formData.severity}/5</p>
                <p><strong>Risk Level:</strong> {formData.riskLevel.toUpperCase()}</p>
                <p><strong>Reason:</strong></p>
                <div className="bg-white p-3 rounded border">
                  {formData.reason || 'No reason provided'}
                </div>
                {formData.evidence.length > 0 && (
                  <div>
                    <p><strong>Evidence:</strong></p>
                    <ul className="list-disc list-inside">
                      {formData.evidence.map((url, index) => (
                        <li key={index}>{url}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading || !kycVerified || profanityDetected}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Dispute'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}; 
