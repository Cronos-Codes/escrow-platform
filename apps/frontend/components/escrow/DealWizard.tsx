import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Select } from '@ui/Select';
import { Card } from '@ui/Card';
import { Badge } from '@ui/Badge';
import { useCreateDeal } from '../../hooks/useEscrow';
import { EscrowState, getStateDescription } from '@core/fsm';
import { CreateDealInput } from '@schemas/escrow';

interface DealWizardProps {
  onComplete?: (dealId: string) => void;
  onCancel?: () => void;
}

const validationSchema = Yup.object({
  payer: Yup.string()
    .required('Payer address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  payee: Yup.string()
    .required('Payee address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .min(0.001, 'Minimum amount is 0.001'),
  token: Yup.string()
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid token address')
    .optional(),
  metadata: Yup.string()
    .url('Metadata must be a valid URL')
    .optional(),
});

const steps = [
  {
    id: 1,
    title: 'Deal Details',
    description: 'Enter the basic deal information',
  },
  {
    id: 2,
    title: 'Confirmation',
    description: 'Review and confirm the deal details',
  },
  {
    id: 3,
    title: 'Summary',
    description: 'Deal created successfully',
  },
];

export function DealWizard({ onComplete, onCancel }: DealWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);
  const { createDeal, loading, error } = useCreateDeal();

  const formik = useFormik<CreateDealInput>({
    initialValues: {
      dealId: '',
      payer: '',
      payee: '',
      token: '',
      amount: '',
      metadata: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const result = await createDeal(values);
        setCreatedDealId(result.dealId);
        setCurrentStep(3);
        onComplete?.(result.dealId);
      } catch (err) {
        // Error is handled by the hook
      }
    },
  });

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    formik.submitForm();
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="payer" className="block text-sm font-medium text-gray-700 mb-2">
                  Payer Address *
                </label>
                <Input
                  id="payer"
                  name="payer"
                  type="text"
                  placeholder="0x..."
                  value={formik.values.payer}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.payer && formik.errors.payer}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="payee" className="block text-sm font-medium text-gray-700 mb-2">
                  Payee Address *
                </label>
                <Input
                  id="payee"
                  name="payee"
                  type="text"
                  placeholder="0x..."
                  value={formik.values.payee}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.payee && formik.errors.payee}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.001"
                  placeholder="1.0"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.amount && formik.errors.amount}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  Token Address (Optional)
                </label>
                <Input
                  id="token"
                  name="token"
                  type="text"
                  placeholder="0x... (leave empty for ETH)"
                  value={formik.values.token}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.token && formik.errors.token}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-2">
                Metadata URL (Optional)
              </label>
              <Input
                id="metadata"
                name="metadata"
                type="url"
                placeholder="https://ipfs.io/ipfs/..."
                value={formik.values.metadata}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.metadata && formik.errors.metadata}
                className="w-full"
              />
            </div>

            {/* FSM Preview */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">FSM Preview</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {EscrowState.Created}
                </Badge>
                <span className="text-blue-600">→</span>
                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                  {EscrowState.Funded}
                </Badge>
                <span className="text-blue-600">→</span>
                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                  {EscrowState.Approved}
                </Badge>
                <span className="text-blue-600">→</span>
                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                  {EscrowState.Released}
                </Badge>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {getStateDescription(EscrowState.Created)}
              </p>
            </Card>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Deal Summary</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payer</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {formik.values.payer}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payee</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {formik.values.payee}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {formik.values.amount} {formik.values.token ? 'tokens' : 'ETH'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Token</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {formik.values.token || 'Native ETH'}
                    </p>
                  </div>
                </div>

                {formik.values.metadata && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Metadata</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                      {formik.values.metadata}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Deal Created Successfully!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Your escrow deal has been created and is now waiting for funding.
              </p>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-xs font-mono text-gray-600">
                  Deal ID: {createdDealId}
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.open(`/deals/${createdDealId}`, '_blank')}
              >
                View Deal
              </Button>
              <Button onClick={() => window.location.href = '/deals'}>
                Go to Deals
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {getStepContent()}
      </AnimatePresence>

      {/* Navigation */}
      {currentStep < 3 && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onCancel : prevStep}
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <Button
            onClick={currentStep === 1 ? nextStep : handleConfirm}
            disabled={
              loading ||
              (currentStep === 1 && !formik.isValid) ||
              (currentStep === 2 && !formik.isValid)
            }
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : currentStep === 1 ? (
              'Next'
            ) : (
              'Create Deal'
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 