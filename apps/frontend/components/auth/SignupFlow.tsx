"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '@escrow/auth';
import { usePhoneOtp } from '@escrow/auth';
import { useWalletLogin } from '@escrow/auth';
import { useVerificationStatus } from '@escrow/auth';
import { FaEnvelope, FaPhone, FaWallet, FaCheck, FaArrowRight, FaShieldAlt, FaLock, FaUserPlus, FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';
import { getDashboardRoute, getWelcomeMessage } from '../../utils/roleRouting';
import { UserRole } from '@escrow/auth';

type SignupMethod = 'email' | 'phone' | 'wallet';
type SignupStep = 'method' | 'form' | 'role' | 'error' | 'success';

interface SignupData {
  email: string;
  password: string;
  phone: string;
  walletAddress: string;
  role: UserRole;
}

interface SignupFlowProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface ErrorState {
  message: string;
  code?: string;
  retryable: boolean;
  action?: 'retry' | 'home' | 'contact';
}

export const SignupFlow = ({ onSuccess, onError }: SignupFlowProps) => {
  const router = useRouter();
  const { signup, user } = useAuth();
  const { sendOtp, verifyOtp: verifyPhoneOtp } = usePhoneOtp();
  const { connectWallet } = useWalletLogin();
  const { verificationStatus, checkAllVerificationStatus } = useVerificationStatus();
  
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('email');
  const [currentStep, setCurrentStep] = useState<SignupStep>('method');
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    password: '',
    phone: '',
    walletAddress: '',
    role: UserRole.BUYER // Default role
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

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
    console.error(`Signup Error [${context}]:`, err);
  };

  const handleRetry = () => {
    if (retryCount >= maxRetries) {
      handleError(
        new Error('Maximum retry attempts exceeded'),
        'Signup failed',
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
    window.open('mailto:support@goldescrow.com?subject=Signup%20Issue', '_blank');
  };

  const handleDashboardRedirect = () => {
    const dashboardRoute = getDashboardRoute(user);
    onSuccess?.(); // Close the modal first
    setTimeout(() => {
      router.push(dashboardRoute);
    }, 100);
  };

  const getMethodIcon = (method: SignupMethod) => {
    switch (method) {
      case 'email': return FaEnvelope;
      case 'phone': return FaPhone;
      case 'wallet': return FaWallet;
      default: return FaEnvelope;
    }
  };

  const handleMethodSelect = () => {
    setCurrentStep('form');
    setError(null);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signup({
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.password,
        firstName: 'User', // Default value - can be enhanced later
        lastName: 'Account', // Default value - can be enhanced later
        role: signupData.role,
        agreeToTerms: true
      });
      
      await checkAllVerificationStatus();
      
      if (verificationStatus.emailVerified) {
        setCurrentStep('success');
        setTimeout(() => {
          const dashboardRoute = getDashboardRoute(user);
          onSuccess?.();
          router.push(dashboardRoute);
        }, 100);
      } else {
        setCurrentStep('role');
      }
    } catch (err: any) {
      handleError(err, 'Email signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    setSignupData(prev => ({ ...prev, role }));
    
    // Check verification status after role selection
    await checkAllVerificationStatus();
    
    // If user has verified methods, they can skip some steps
    if (verificationStatus.hasAnyVerification) {
      // Skip directly to success if they have any verification
      setCurrentStep('success');
      setTimeout(() => {
        const dashboardRoute = getDashboardRoute(user);
        onSuccess?.();
        router.push(dashboardRoute);
      }, 100);
    } else {
      // Proceed to phone verification
      setCurrentStep('phone');
    }
  };

  const handlePhoneOtpSend = async () => {
    if (!signupData.phone) {
      setError({ message: 'Please enter a valid phone number', retryable: true, action: 'retry' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendOtp(signupData.phone);
      setPhoneOtpSent(true);
      setCountdown(60);
    } catch (err: any) {
      handleError(err, 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtpVerify = async () => {
    if (!phoneOtp) {
      setError({ message: 'Please enter the OTP', retryable: true, action: 'retry' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyPhoneOtp(phoneOtp);
      
      await checkAllVerificationStatus();
      
      // Phone signup creates account automatically
      if (verificationStatus.hasAnyVerification) {
        setCurrentStep('success');
        setTimeout(() => {
          const dashboardRoute = getDashboardRoute(user);
          onSuccess?.();
          router.push(dashboardRoute);
        }, 100);
      } else {
        setCurrentStep('role');
      }
    } catch (err: any) {
      handleError(err, 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      await connectWallet();
      
      await checkAllVerificationStatus();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!user) {
        throw new Error('User authentication failed - no user data available');
      }
      
      const dashboardRoute = getDashboardRoute(user);
      
      onSuccess?.();
      setCurrentStep('success');
      
      setTimeout(() => {
        router.push(dashboardRoute);
      }, 100);
      
    } catch (err: any) {
      handleError(err, 'Wallet connection failed');
    } finally {
      setLoading(false);
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
              <h3 className="text-lg font-bold text-gold">Choose Sign Up Method</h3>
              <p className="text-gray-400 text-xs mt-1">Select how you want to create your account</p>
            </div>

            {/* Method Selection */}
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'email', label: 'Email & Password', description: 'Traditional email authentication' },
                { id: 'phone', label: 'Phone Number', description: 'SMS-based authentication' },
                { id: 'wallet', label: 'Crypto Wallet', description: 'Blockchain wallet connection' }
              ].map((method) => {
                const IconComponent = getMethodIcon(method.id as SignupMethod);
                
                return (
                  <motion.button
                    key={method.id}
                    onClick={() => {
                      setSignupMethod(method.id as SignupMethod);
                      handleMethodSelect();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-2.5 rounded-xl border transition-all duration-300 text-left ${
                      signupMethod === method.id
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
                      {signupMethod === method.id && (
                        <FaCheck className="w-4 h-4 text-gold" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {currentStep === 'form' && signupMethod === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gold mb-1">Email Sign Up</h3>
              <p className="text-gray-400 text-xs">Create your account with email and password</p>
            </div>
            
            <button
              type="button"
              onClick={() => setCurrentStep('method')}
              className="text-xs text-gold/80 hover:text-gold mb-2 flex items-center gap-1"
            >
              <FaArrowRight className="w-3 h-3 rotate-180" />
              Back to method selection
            </button>

            <form onSubmit={handleEmailSignup} className="space-y-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FaEnvelope className="w-3 h-3 text-gold/60" />
                </div>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
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
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a strong password"
                  className="w-full pl-9 pr-3 py-3 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 text-sm"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs"
                >
                  {error.message}
                  {error.action === 'retry' && (
                    <button onClick={handleRetry} className="ml-2 text-red-300 hover:underline text-xs">
                      Retry
                    </button>
                  )}
                  {error.action === 'home' && (
                    <button onClick={handleGoHome} className="ml-2 text-red-300 hover:underline text-xs">
                      Go Home
                    </button>
                  )}
                  {error.action === 'contact' && (
                    <button onClick={handleContactSupport} className="ml-2 text-red-300 hover:underline text-xs">
                      Contact Support
                    </button>
                  )}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading || !signupData.email || !signupData.password}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </motion.button>
            </form>
          </motion.div>
        )}

        {currentStep === 'role' && (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gold mb-1">Choose Your Role</h3>
              <p className="text-gray-400 text-xs">Select your primary role in the platform</p>
              
              {/* Show verification status */}
              {verificationStatus.hasAnyVerification && (
                <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-xs">
                    ✓ You have verified methods. You can skip additional verification steps.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleRoleSelect(UserRole.BUYER)}
                className={`p-4 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white font-semibold text-lg flex flex-col items-center justify-center transition-all duration-300 ${
                  signupData.role === UserRole.BUYER
                    ? 'bg-gold border-gold shadow-lg'
                    : 'hover:bg-gold/10 hover:border-gold/50'
                }`}
              >
                <FaUserPlus className="w-8 h-8 mb-2 text-gold" />
                <span>Buyer</span>
              </button>
              <button
                onClick={() => handleRoleSelect(UserRole.SELLER)}
                className={`p-4 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white font-semibold text-lg flex flex-col items-center justify-center transition-all duration-300 ${
                  signupData.role === UserRole.SELLER
                    ? 'bg-gold border-gold shadow-lg'
                    : 'hover:bg-gold/10 hover:border-gold/50'
                }`}
              >
                <FaUserPlus className="w-8 h-8 mb-2 text-gold" />
                <span>Seller</span>
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs"
              >
                {error.message}
                {error.action === 'retry' && (
                  <button onClick={handleRetry} className="ml-2 text-red-300 hover:underline text-xs">
                    Retry
                  </button>
                )}
                {error.action === 'home' && (
                  <button onClick={handleGoHome} className="ml-2 text-red-300 hover:underline text-xs">
                    Go Home
                  </button>
                )}
                {error.action === 'contact' && (
                  <button onClick={handleContactSupport} className="ml-2 text-red-300 hover:underline text-xs">
                    Contact Support
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === 'form' && signupMethod === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gold mb-1">Phone Sign Up</h3>
              <p className="text-gray-400 text-xs">Create your account with phone number</p>
            </div>
            
            <button
              type="button"
              onClick={() => setCurrentStep('method')}
              className="text-xs text-gold/80 hover:text-gold mb-2 flex items-center gap-1"
            >
              <FaArrowRight className="w-3 h-3 rotate-180" />
              Back to method selection
            </button>

            {!phoneOtpSent ? (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaPhone className="w-3 h-3 text-gold/60" />
                  </div>
                  <input
                    type="tel"
                    value={signupData.phone}
                    onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="w-full pl-9 pr-3 py-3 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 text-sm"
                    required
                  />
                </div>

                <motion.button
                  onClick={handlePhoneOtpSend}
                  disabled={loading || !signupData.phone}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaShieldAlt className="w-3 h-3 text-gold/60" />
                  </div>
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full pl-9 pr-3 py-3 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 text-center text-base tracking-widest"
                    required
                  />
                </div>

                <motion.button
                  onClick={handlePhoneOtpVerify}
                  disabled={loading || !phoneOtp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Verifying...' : 'Sign Up'}
                </motion.button>
              </div>
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
                    Retry
                  </button>
                )}
                {error.action === 'home' && (
                  <button onClick={handleGoHome} className="ml-2 text-red-300 hover:underline text-xs">
                    Go Home
                  </button>
                )}
                {error.action === 'contact' && (
                  <button onClick={handleContactSupport} className="ml-2 text-red-300 hover:underline text-xs">
                    Contact Support
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {currentStep === 'form' && signupMethod === 'wallet' && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gold mb-1">Wallet Sign Up</h3>
              <p className="text-gray-400 text-xs">Create your account with crypto wallet</p>
            </div>
            
            <button
              type="button"
              onClick={() => setCurrentStep('method')}
              className="text-xs text-gold/80 hover:text-gold mb-2 flex items-center gap-1"
            >
              <FaArrowRight className="w-3 h-3 rotate-180" />
              Back to method selection
            </button>

            <div className="space-y-3">
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

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs"
                >
                  {error.message}
                  {error.action === 'retry' && (
                    <button onClick={handleRetry} className="ml-2 text-red-300 hover:underline text-xs">
                      Retry
                    </button>
                  )}
                  {error.action === 'home' && (
                    <button onClick={handleGoHome} className="ml-2 text-red-300 hover:underline text-xs">
                      Go Home
                    </button>
                  )}
                  {error.action === 'contact' && (
                    <button onClick={handleContactSupport} className="ml-2 text-red-300 hover:underline text-xs">
                      Contact Support
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {currentStep === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3 text-center"
          >
            <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-500">Signup Failed</h3>
            <p className="text-gray-400 text-sm">{error?.message}</p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={handleRetry}
                className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleGoHome}
                className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Go Home
              </button>
              <button
                onClick={handleContactSupport}
                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3 text-center"
          >
            <FaCheck className="w-12 h-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-bold text-green-500">Signup Successful!</h3>
            <p className="text-gray-400 text-sm">Your account has been created. Redirecting to dashboard...</p>
            <motion.button
              onClick={handleDashboardRedirect}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Dashboard
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
