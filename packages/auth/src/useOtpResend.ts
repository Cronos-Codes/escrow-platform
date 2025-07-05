import { useState, useCallback, useEffect } from 'react';

export interface OtpResendState {
  canResend: boolean;
  countdown: number;
  loading: boolean;
  error: string | null;
}

export interface OtpResendResult {
  state: OtpResendState;
  resendOtp: () => Promise<void>;
  resetTimer: () => void;
}

export const useOtpResend = (): OtpResendResult => {
  const [state, setState] = useState<OtpResendState>({
    canResend: true,
    countdown: 0,
    loading: false,
    error: null,
  });

  // Countdown timer effect
  useEffect(() => {
    if (state.countdown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          countdown: prev.countdown - 1,
          canResend: prev.countdown - 1 === 0,
        }));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.countdown]);

  const resendOtp = useCallback(async () => {
    if (!state.canResend || state.loading) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // TODO: Implement actual OTP resend logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Start 60-second countdown
      setState(prev => ({
        ...prev,
        loading: false,
        canResend: false,
        countdown: 60,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to resend OTP',
      }));
    }
  }, [state.canResend, state.loading]);

  const resetTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      canResend: true,
      countdown: 0,
    }));
  }, []);

  return {
    state,
    resendOtp,
    resetTimer,
  };
}; 