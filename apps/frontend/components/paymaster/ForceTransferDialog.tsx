import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { Sponsor } from '@escrow/paymaster';

interface ForceTransferDialogProps {
  sponsor: Sponsor;
  onClose: () => void;
  onSuccess: () => void;
}

const ForceTransferSchema = z.object({
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  reason: z.string().min(1, 'Reason is required'),
  complianceCase: z.string().optional()
});

export const ForceTransferDialog: React.FC<ForceTransferDialogProps> = ({
  sponsor,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'details' | 'review' | 'confirm'>('details');
  const [formData, setFormData] = useState({
    toAddress: '',
    amount: '',
    reason: '',
    complianceCase: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = () => {
    try {
      ForceTransferSchema.parse(formData);
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

  const handleNext = () => {
    if (validateForm()) {
      setStep('review');
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, this would call the paymaster contract
      console.log('Force transfer executed:', {
        from: sponsor.address,
        to: formData.toAddress,
        amount: formData.amount,
        reason: formData.reason
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error executing force transfer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`w-2 h-0.5 ${
          step === 'review' || step === 'confirm' ? 'bg-blue-600' : 'bg-gray-200'
        }`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'review' ? 'bg-blue-600 text-white' : step === 'confirm' ? 'bg-gray-200 text-gray-600' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
        <div className={`w-2 h-0.5 ${
          step === 'confirm' ? 'bg-blue-600' : 'bg-gray-200'
        }`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          3
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
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
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Force Transfer</h2>
                <p className="text-gray-600 mt-1">Transfer funds from sponsor to external address</p>
              </div>
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

          {/* Step Indicator */}
          {getStepIndicator()}

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Sponsor Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sponsor Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{sponsor.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-mono text-sm text-gray-900">{sponsor.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Balance</p>
                        <p className="font-medium text-gray-900">{parseFloat(sponsor.balance).toFixed(4)} ETH</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sponsor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {sponsor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Transfer Details</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Address *
                      </label>
                      <input
                        type="text"
                        value={formData.toAddress}
                        onChange={(e) => handleInputChange('toAddress', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                          errors.toAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0x..."
                      />
                      {errors.toAddress && (
                        <p className="mt-1 text-sm text-red-600">{errors.toAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (ETH) *
                      </label>
                      <input
                        type="text"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.amount ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.1"
                      />
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Maximum available: {parseFloat(sponsor.balance).toFixed(4)} ETH
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Transfer *
                      </label>
                      <textarea
                        value={formData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.reason ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Explain the reason for this force transfer..."
                      />
                      {errors.reason && (
                        <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compliance Case Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.complianceCase}
                        onChange={(e) => handleInputChange('complianceCase', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="CASE-2024-001"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-800">Review Transfer Details</h3>
                        <p className="text-yellow-700">Please carefully review the transfer details before confirming.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">From Sponsor:</span>
                        <span className="font-medium">{sponsor.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">From Address:</span>
                        <span className="font-mono text-sm">{sponsor.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To Address:</span>
                        <span className="font-mono text-sm">{formData.toAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium text-red-600">{formData.amount} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reason:</span>
                        <span className="font-medium">{formData.reason}</span>
                      </div>
                      {formData.complianceCase && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Case Number:</span>
                          <span className="font-medium">{formData.complianceCase}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-red-800">Important Notice</h4>
                        <ul className="text-red-700 text-sm mt-1 space-y-1">
                          <li>• This action cannot be undone</li>
                          <li>• Funds will be permanently transferred</li>
                          <li>• This action will be logged for compliance</li>
                          <li>• Ensure you have proper authorization</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-red-800">Final Confirmation</h3>
                        <p className="text-red-700">This is the final step. The transfer will be executed immediately.</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Execute Force Transfer?</h3>
                    <p className="text-gray-600">
                      Transfer {formData.amount} ETH from {sponsor.name} to {formData.toAddress}
                    </p>
                  </div>

                  {isProcessing && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Processing transfer...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (step === 'review') setStep('details');
                  else if (step === 'confirm') setStep('review');
                  else onClose();
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {step === 'details' ? 'Cancel' : 'Back'}
              </button>
              
              <div className="flex space-x-3">
                {step === 'details' && (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                )}
                
                {step === 'review' && (
                  <button
                    onClick={() => setStep('confirm')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm Transfer
                  </button>
                )}
                
                {step === 'confirm' && (
                  <button
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Executing...' : 'Execute Transfer'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 