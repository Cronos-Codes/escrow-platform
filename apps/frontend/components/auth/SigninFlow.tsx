"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '@escrow/auth';
import { usePhoneOtp } from '@escrow/auth';
import { useWalletLogin } from '@escrow/auth';
import { useVerificationStatus } from '@escrow/auth';
import { FaEnvelope, FaPhone, FaWallet, FaShieldAlt, FaLock, FaCheck, FaArrowRight, FaKey, FaExclamationTriangle, FaHome, FaRedo, FaPlus } from 'react-icons/fa';
import { getDashboardRoute, getWelcomeMessage } from '../../utils/roleRouting';
import { AddVerificationMethod } from './AddVerificationMethod';

type SigninMethod = 'email' | 'phone' | 'wallet';
type SecondFactor = 'phone' | 'authenticator';
type SigninStep = 'method' | 'second-factor' | 'error' | 'success';

interface SigninData {
  email: string;
  password: string;
  phone: string;
  authenticatorCode: string;
}

interface SigninFlowProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface ErrorState {
  message: string;
  code?: string;
  retryable: boolean;
  action?: 'retry' | 'home' | 'contact';
}

export const SigninFlow = ({ onSuccess, onError }: SigninFlowProps) => {
  const router = useRouter();
  const { login, user } = useAuth();
  const { sendOtp, verifyOtp: verifyPhoneOtp } = usePhoneOtp();
  const { connectWallet } = useWalletLogin();
  const { verificationStatus, checkAllVerificationStatus } = useVerificationStatus();

  const [signinMethod, setSigninMethod] = useState<SigninMethod>('email');
  const [secondFactor, setSecondFactor] = useState<SecondFactor>('phone');
  const [currentStep, setCurrentStep] = useState<SigninStep>('method');

  const [signinData, setSigninData] = useState<SigninData>({
    email: '',
    password: '',
    phone: '',
    authenticatorCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  const [showAddVerification, setShowAddVerification] = useState(false);
  // Dev auth is only enabled in development mode with explicit flag
  // This prevents accidental auth bypass in production
  const isDevAuth = process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true';

  // Reset error when step changes
  useEffect(() => {
    if (currentStep !== 'error') {
      setError(null);
    }
  }, [currentStep]);

  const handleError = (err: any, context: string, retryable: boolean = true) => {
    const errorMessage = err?.message || err?.toString() || 'An unexpected error occurred';
    const errorCode = err?.code || 'UNKNOWN_ERROR';

    const errorState: ErrorState = {
      message: `${context}: ${errorMessage}`,
      code: errorCode,
      retryable,
      action: retryable ? 'retry' : 'home'
    };

    setError(errorState);
    setCurrentStep('error');
    onError?.(errorState.message);

    // Log error for debugging
    console.error(`Authentication Error [${context}]:`, err);
  };

  const handleRetry = () => {
    if (retryCount >= maxRetries) {
      handleError(
        new Error('Maximum retry attempts exceeded'),
        'Authentication failed',
        false
      );
      return;
    }

    setRetryCount(prev => prev + 1);
    setError(null);
    setCurrentStep('method');
    setLoading(false);
  };

  const handleGoHome = () => {
    onSuccess?.(); // Close modal
    router.push('/');
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support ticket or contact form
    window.open('mailto:support@goldescrow.com?subject=Authentication%20Issue', '_blank');
  };

  const handleMethodSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (signinMethod === 'email') {
        await login(signinData.email, signinData.password);
      } else if (signinMethod === 'phone') {
        await sendOtp(signinData.phone);
        setPhoneOtpSent(true);
      } else if (signinMethod === 'wallet') {
        await connectWallet();
      }

      // Check verification status after successful primary authentication
      await checkAllVerificationStatus();

      // If user has verified email or phone, they can skip second factor
      if (verificationStatus.canSkipSecondFactor) {
        // Skip directly to success
        setCurrentStep('success');
        setTimeout(() => {
          const dashboardRoute = getDashboardRoute(user);
          onSuccess?.();
          router.push(dashboardRoute);
        }, 100);
      } else {
        // Proceed to second factor
        setCurrentStep('second-factor');
      }
    } catch (err: any) {
      handleError(err, 'Primary authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      await connectWallet();

      // Check verification status after successful wallet connection
      await checkAllVerificationStatus();

      // If user has verified email or phone, they can skip second factor
      if (verificationStatus.canSkipSecondFactor) {
        // Skip directly to success
        setCurrentStep('success');
        setTimeout(() => {
          const dashboardRoute = getDashboardRoute(user);
          onSuccess?.();
          router.push(dashboardRoute);
        }, 100);
      } else {
        // Proceed to second factor
        setCurrentStep('second-factor');
      }
    } catch (err: any) {
      handleError(err, 'Wallet connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    if (!isDevAuth) return;
    setLoading(true);
    setError(null);

    try {
      const email = signinData.email || 'dev.user@example.com';
      const password = signinData.password || 'password123';
      await login(email, password);

      // In dev auth, skip second factor and go straight to dashboard
      setCurrentStep('success');
      setTimeout(() => {
        const dashboardRoute = getDashboardRoute(user) || '/dashboard';
        onSuccess?.();
        router.push(dashboardRoute);
      }, 100);
    } catch (err: any) {
      handleError(err, 'Dev login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSecondFactorSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (secondFactor === 'phone') {
        await verifyPhoneOtp(phoneOtp);
      } else if (secondFactor === 'authenticator') {
        // Verify authenticator code
        // This would integrate with your authenticator service
        console.log('Verifying authenticator code:', signinData.authenticatorCode);
      }

      // Wait a moment for user state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use the existing user from the component-level useAuth() call
      if (!user) {
        throw new Error('User authentication failed - no user data available');
      }

      const dashboardRoute = getDashboardRoute(user);

      // Close modal and redirect automatically
      onSuccess?.();
      setCurrentStep('success');

      setTimeout(() => {
        router.push(dashboardRoute);
      }, 100);

    } catch (err: any) {
      handleError(err, 'Second factor verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtpSend = async () => {
    if (!signinData.phone) {
      setError({
        message: 'Please enter a valid phone number',
        retryable: false,
        action: 'retry'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendOtp(signinData.phone);
      setPhoneOtpSent(true);
    } catch (err: any) {
      handleError(err, 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardRedirect = () => {
    const dashboardRoute = getDashboardRoute(user);
    onSuccess?.(); // Close the modal first
    setTimeout(() => {
      router.push(dashboardRoute);
    }, 100);
  };

  const getMethodIcon = (method: SigninMethod) => {
    switch (method) {
      case 'email': return FaEnvelope;
      case 'phone': return FaPhone;
      case 'wallet': return FaWallet;
    }
  };

  const getSecondFactorIcon = (factor: SecondFactor) => {
    switch (factor) {
      case 'phone': return FaPhone;
      case 'authenticator': return FaKey;
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {currentStep === 'method' && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold text-gold">Choose Sign In Method</h3>
            </div>

            {/* Method Selection */}
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'email', label: 'Email & Password', description: 'Traditional email authentication' },
                { id: 'phone', label: 'Phone Number', description: 'SMS-based authentication' },
                { id: 'wallet', label: 'Crypto Wallet', description: 'Blockchain wallet connection' }
              ].map((method) => {
                const IconComponent = getMethodIcon(method.id as SigninMethod);

                return (
                  <motion.button
                    key={method.id}
                    onClick={() => setSigninMethod(method.id as SigninMethod)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-2.5 rounded-xl border transition-all duration-300 text-left ${signinMethod === method.id
                      ? 'border-gold bg-gold/10'
                      : 'border-gold/20 bg-black/40 backdrop-blur-sm hover:border-gold/40 hover:bg-black/60'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-yellow-500/20 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gold text-sm">{method.label}</h4>
                        <p className="text-xs text-gray-400">{method.description}</p>
                      </div>
                      {signinMethod === method.id && (
                        <FaCheck className="w-4 h-4 text-gold" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Method-Specific Form */}
            <AnimatePresence mode="wait">
              {signinMethod === 'email' && (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleMethodSubmit}
                  className="space-y-3"
                >
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaEnvelope className="w-3 h-3 text-gold/60" />
                    </div>
                    <input
                      type="email"
                      value={signinData.email}
                      onChange={(e) => setSigninData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="w-full pl-9 pr-3 py-3 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 text-sm"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaLock className="w-3 h-3 text-gold/60" />
                    </div>
                    <input
                      type="password"
                      value={signinData.password}
                      onChange={(e) => setSigninData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-3 py-3 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 text-sm"
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || !signinData.email || !signinData.password}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? 'Verifying...' : 'Continue to Second Factor'}
                  </motion.button>

                </motion.form>
              )}

              {signinMethod === 'phone' && (
                <motion.div
                  key="phone-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaPhone className="w-3 h-3 text-gold/60" />
                    </div>
                    <input
                      type="tel"
                      value={signinData.phone}
                      onChange={(e) => setSigninData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className="w-full pl-9 pr-3 py-3 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 text-sm"
                      required
                    />
                  </div>

                  <motion.button
                    onClick={handlePhoneOtpSend}
                    disabled={loading || !signinData.phone}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </motion.button>
                </motion.div>
              )}

              {signinMethod === 'wallet' && (
                <motion.div
                  key="wallet-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <motion.button
                    onClick={handleWalletConnect}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-3 bg-gradient-to-r from-gold/20 to-yellow-500/20 border border-gold/30 rounded-xl hover:from-gold/30 hover:to-yellow-500/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FaWallet className="w-4 h-4 text-gold" />
                      <span className="text-gold font-medium text-sm">
                        {loading ? 'Connecting...' : 'Connect MetaMask Wallet'}
                      </span>
                    </div>
                  </motion.button>

                  {isDevAuth && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleDevLogin}
                        className="mt-1 text-xs text-gray-300 hover:text-gold transition-colors"
                        disabled={loading}
                        aria-label="Development login (bypass Firebase)"
                      >
                        Dev login (skip wallet + second factor)
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs"
              >
                {error.message}
                {error.action === 'retry' && (
                  <button onClick={handleRetry} className="ml-2 text-red-300 hover:underline text-xs">
                    Retry <FaRedo className="inline-block ml-1" />
                  </button>
                )}
                {error.action === 'home' && (
                  <button onClick={handleGoHome} className="ml-2 text-red-300 hover:underline text-xs">
                    Go Home <FaHome className="inline-block ml-1" />
                  </button>
                )}
                {error.action === 'contact' && (
                  <button onClick={handleContactSupport} className="ml-2 text-red-300 hover:underline text-xs">
                    Contact Support <FaExclamationTriangle className="inline-block ml-1" />
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === 'second-factor' && (
          <motion.div
            key="second-factor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold text-gold mb-1">Second Factor Verification</h3>
              <p className="text-gray-400 text-xs">Complete your authentication with additional verification</p>

              {/* Show verification status */}
              {verificationStatus.hasAnyVerification && (
                <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-xs">
                    ✓ You have verified methods. You can skip this step or add additional verification.
                  </p>
                </div>
              )}
            </div>

            {/* Second Factor Selection */}
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'phone', label: 'Phone OTP', description: 'Receive SMS verification code' },
                { id: 'authenticator', label: 'Authenticator App', description: 'Use your authenticator app' }
              ].map((factor) => {
                const IconComponent = getSecondFactorIcon(factor.id as SecondFactor);

                return (
                  <motion.button
                    key={factor.id}
                    onClick={() => setSecondFactor(factor.id as SecondFactor)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-2.5 rounded-xl border transition-all duration-300 text-left ${secondFactor === factor.id
                      ? 'border-gold bg-gold/10'
                      : 'border-gold/20 bg-black/40 backdrop-blur-sm hover:border-gold/40 hover:bg-black/60'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-yellow-500/20 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gold text-sm">{factor.label}</h4>
                        <p className="text-xs text-gray-400">{factor.description}</p>
                      </div>
                      {secondFactor === factor.id && (
                        <FaCheck className="w-4 h-4 text-gold" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Second Factor Form */}
            <AnimatePresence mode="wait">
              {secondFactor === 'phone' && (
                <motion.div
                  key="phone-otp"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  {!phoneOtpSent ? (
                    <motion.button
                      onClick={handlePhoneOtpSend}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </motion.button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <FaShieldAlt className="w-3 h-3 text-gold/60" />
                        </div>
                        <input
                          type="text"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          pattern="[0-9]{6}"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          aria-label="One-time password"
                          className="w-full pl-9 pr-3 py-3 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 text-center text-base tracking-widest"
                          required
                        />
                      </div>

                      <motion.button
                        onClick={handleSecondFactorSubmit}
                        disabled={loading || !phoneOtp}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {loading ? 'Verifying...' : 'Complete Sign In'}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}

              {secondFactor === 'authenticator' && (
                <motion.div
                  key="authenticator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaKey className="w-3 h-3 text-gold/60" />
                    </div>
                    <input
                      type="text"
                      value={signinData.authenticatorCode}
                      onChange={(e) => setSigninData(prev => ({ ...prev, authenticatorCode: e.target.value.replace(/[^0-9]/g, '') }))}
                      placeholder="Enter 6-digit authenticator code"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      aria-label="Authenticator code"
                      className="w-full pl-9 pr-3 py-3 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 text-center text-base tracking-widest"
                      required
                    />
                  </div>

                  <motion.button
                    onClick={handleSecondFactorSubmit}
                    disabled={loading || !signinData.authenticatorCode}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? 'Verifying...' : 'Complete Sign In'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skip button for verified users */}
            {verificationStatus.canSkipSecondFactor && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-xs font-medium">Skip Second Factor</p>
                    <p className="text-blue-200 text-xs">You already have verified authentication methods</p>
                  </div>
                  <motion.button
                    onClick={() => {
                      setCurrentStep('success');
                      setTimeout(() => {
                        const dashboardRoute = getDashboardRoute(user);
                        onSuccess?.();
                        router.push(dashboardRoute);
                      }, 100);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Skip
                  </motion.button>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs"
              >
                {error.message}
                {error.action === 'retry' && (
                  <button onClick={handleRetry} className="ml-2 text-red-300 hover:underline text-xs">
                    Retry <FaRedo className="inline-block ml-1" />
                  </button>
                )}
                {error.action === 'home' && (
                  <button onClick={handleGoHome} className="ml-2 text-red-300 hover:underline text-xs">
                    Go Home <FaHome className="inline-block ml-1" />
                  </button>
                )}
                {error.action === 'contact' && (
                  <button onClick={handleContactSupport} className="ml-2 text-red-300 hover:underline text-xs">
                    Contact Support <FaExclamationTriangle className="inline-block ml-1" />
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
              <FaExclamationTriangle className="w-8 h-8 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Authentication Failed</h3>
              <p className="text-gray-400 text-sm mb-4">
                {error?.message || 'An unexpected error occurred during authentication'}
              </p>
              {error?.code && (
                <p className="text-xs text-gray-500 mb-4">Error Code: {error.code}</p>
              )}
            </div>

            <div className="space-y-3">
              {error?.retryable && retryCount < maxRetries && (
                <motion.button
                  onClick={handleRetry}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <FaRedo className="w-4 h-4" />
                  <span>Try Again ({maxRetries - retryCount} attempts left)</span>
                </motion.button>
              )}

              <motion.button
                onClick={handleGoHome}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FaHome className="w-4 h-4" />
                <span>Return to Home</span>
              </motion.button>

              <motion.button
                onClick={handleContactSupport}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-gold/20 to-yellow-500/20 border border-gold/30 text-gold font-semibold rounded-xl hover:from-gold/30 hover:to-yellow-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FaExclamationTriangle className="w-4 h-4" />
                <span>Contact Support</span>
              </motion.button>
            </div>

            {retryCount >= maxRetries && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-xs">
                  Maximum retry attempts reached. Please contact support if you continue to experience issues.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
              <FaCheck className="w-8 h-8 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gold mb-2">Authentication Successful!</h3>
              <p className="text-gray-400 text-sm mb-4">
                You have successfully signed in to your account.
              </p>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={handleDashboardRedirect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Dashboard
              </motion.button>

              <motion.button
                onClick={() => setShowAddVerification(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm rounded-xl hover:bg-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FaPlus className="w-3 h-3" />
                <span>Add More Verification Methods</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Verification Method Modal */}
      {showAddVerification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddVerification(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 border border-gold/20 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <AddVerificationMethod onClose={() => setShowAddVerification(false)} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
