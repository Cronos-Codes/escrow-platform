import { useState, useCallback } from 'react';
import { useKycStatus } from '@escrow/auth';
import { useDisputeTriage } from './useDisputeTriage';
import { moderateContent } from '@escrow/utils';

export function useDisputeForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    files: [],
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const { kycStatus } = useKycStatus();
  const { triageDispute, isTriageLoading } = useDisputeTriage();

  const validate = useCallback(async () => {
    const errs: any = {};
    if (!form.title) errs.title = 'Title is required';
    if (!form.description) errs.description = 'Description is required';
    if (kycStatus !== 'verified') errs.kyc = 'KYC verification required';
    if (await moderateContent(form.description)) errs.profanity = 'Inappropriate language detected';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, kycStatus]);

  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const valid = await validate();
    if (!valid) {
      setIsSubmitting(false);
      return false;
    }
    const triage = await triageDispute(form.description);
    setTriageResult(triage);
    setIsSubmitting(false);
    return true;
  }, [validate, triageDispute, form]);

  return {
    form,
    errors,
    isSubmitting,
    triageResult,
    isTriageLoading,
    handleChange,
    handleSubmit,
  };
} 