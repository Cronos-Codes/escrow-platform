import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePhoneOtp, useEmailOtp, useWalletLogin, useCredentialLinking, useAuth, UserRole } from '@escrow/auth';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@escrow/auth';

interface AuthFormProps {
  mode: 'login' | 'signup';
  type: 'email' | 'phone' | 'wallet';
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
  currentUser?: FirebaseUser | null; // For credential linking
  isLinkingMode?: boolean; // True when linking credentials to existing account
}

const AuthForm: React.FC<AuthFormProps> = ({ 
  mode, 
  type, 
  onSuccess, 
  onError,
  currentUser,
  isLinkingMode = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [usePasswordless, setUsePasswordless] = useState(false); // Toggle between password and passwordless
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldownMs, setResendCooldownMs] = useState<number>(0);

  const phoneOtp = usePhoneOtp();
  const emailOtp = useEmailOtp();
  const walletLogin = useWalletLogin();
  const credentialLinking = useCredentialLinking();
  const { signup, login, user: authUser } = useAuth();
  const waitingForAuthRef = useRef(false);

  // Refresh credentials when in linking mode
  useEffect(() => {
    if (isLinkingMode && currentUser) {
      credentialLinking.refreshCredentials(currentUser.uid);
    }
  }, [isLinkingMode, currentUser, credentialLinking]);

  // Handle successful signup/login via auth state change
  useEffect(() => {
    if (waitingForAuthRef.current && authUser && !isLinkingMode && !currentUser) {
      waitingForAuthRef.current = false;
      onSuccess(authUser);
    }
  }, [authUser, isLinkingMode, currentUser, onSuccess]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorMessage(null);
    if (!showOtpInput) {
      await phoneOtp.sendOtp(phoneNumber);
      if (phoneOtp.state.success) {
        setShowOtpInput(true);
        // start 60s cooldown
        setResendCooldownMs(60000);
      } else if (phoneOtp.state.error) {
        setErrorMessage(phoneOtp.state.error);
        onError(phoneOtp.state.error);
      }
    } else {
      const userCredential = await phoneOtp.verifyOtp(otpCode);
      if (userCredential) {
        // If linking mode, link phone to current user
        if (isLinkingMode && currentUser) {
          const linked = await credentialLinking.linkPhone(
            currentUser,
            phoneNumber,
            phoneOtp.state.verificationId || '',
            otpCode
          );
          if (linked) {
            onSuccess(currentUser);
          } else {
            setErrorMessage(credentialLinking.state.error || 'Failed to link phone');
            onError(credentialLinking.state.error || 'Failed to link phone');
          }
        } else {
          // For signup/login, phone auth automatically creates account if new
          // User document will be created by useAuth hook's auth state listener
          onSuccess(userCredential.user);
        }
      } else if (phoneOtp.state.error) {
        setErrorMessage(phoneOtp.state.error);
        onError(phoneOtp.state.error);
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorMessage(null);

    // Password-based authentication (signup or login)
    if (!usePasswordless && (mode === 'signup' || mode === 'login')) {
      try {
        if (mode === 'signup') {
          // Validate signup fields
          if (!firstName || !lastName) {
            setErrorMessage('First name and last name are required');
            return;
          }
          if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
          }
          if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters');
            return;
          }
          if (!agreeToTerms) {
            setErrorMessage('You must agree to the terms and conditions');
            return;
          }

          waitingForAuthRef.current = true;
          await signup({
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
            role: UserRole.BUYER, // Default role, can be enhanced later
            agreeToTerms,
          });
          // onSuccess will be called when authUser updates in useEffect
        } else {
          // Login mode
          waitingForAuthRef.current = true;
          await login(email, password);
          // onSuccess will be called when authUser updates in useEffect
        }
      } catch (error: any) {
        waitingForAuthRef.current = false;
        setErrorMessage(error.message || 'Authentication failed');
        onError(error.message || 'Authentication failed');
      }
      return;
    }

    // Passwordless email link authentication
    if (!showOtpInput) {
      await emailOtp.sendEmailLink(email);
      if (emailOtp.state.success) {
        setShowOtpInput(true);
        setResendCooldownMs(60000);
      } else if (emailOtp.state.error) {
        setErrorMessage(emailOtp.state.error);
        onError(emailOtp.state.error);
      }
    } else {
      const userCredential = await emailOtp.verifyEmailLink();
      if (userCredential) {
        // If linking mode, email is already linked via Firebase Auth
        if (isLinkingMode && currentUser) {
          const linked = await credentialLinking.linkEmail(currentUser, email);
          if (linked) {
            onSuccess(currentUser);
          } else {
            setErrorMessage(credentialLinking.state.error || 'Failed to link email');
            onError(credentialLinking.state.error || 'Failed to link email');
          }
        } else {
          onSuccess(userCredential.user);
        }
      } else if (emailOtp.state.error) {
        setErrorMessage(emailOtp.state.error);
        onError(emailOtp.state.error);
      }
    }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    const result = await walletLogin.connectWallet(currentUser);
    if (result) {
      if (isLinkingMode && currentUser) {
        // Credential already linked in connectWallet
        onSuccess(currentUser);
      } else {
        onSuccess({ walletAddress: result.walletAddress, isNewUser: result.isNewUser });
      }
    } else if (walletLogin.state.error) {
      setErrorMessage(walletLogin.state.error);
      onError(walletLogin.state.error);
    }
  };

  const isPhoneLoading = phoneOtp.state.loading;
  const isEmailLoading = emailOtp.state.loading;
  const isWalletLoading = walletLogin.state.loading;

  // Cooldown timer effect
  React.useEffect(() => {
    if (resendCooldownMs <= 0) return;
    const interval = setInterval(() => {
      setResendCooldownMs(prev => (prev - 1000 <= 0 ? 0 : prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldownMs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {errorMessage && (
        <div role="alert" className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-800 px-3 py-2">
          {errorMessage}
        </div>
      )}
      {/* Phone Authentication */}
      {type === 'phone' && (
        <motion.form
          key="phone-form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onSubmit={handlePhoneSubmit}
          className="space-y-4"
        >
          {isLinkingMode && (
            <div className="mb-4 p-3 bg-gold/10 border border-gold/30 rounded-md">
              <p className="text-xs text-gold/80">
                Link your phone number to enhance account security
              </p>
            </div>
          )}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
              disabled={showOtpInput || isPhoneLoading}
              required
            />
          </div>

          {showOtpInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
                  disabled={isPhoneLoading}
                  required
                />
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isPhoneLoading}
            className="w-full bg-white/40 text-black py-2 px-4 rounded-md hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isPhoneLoading ? (
              <span className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"
                />
                {showOtpInput ? 'Verifying...' : 'Sending OTP...'}
              </span>
            ) : (
              showOtpInput ? 'Verify OTP' : 'Send OTP'
            )}
          </motion.button>
          {!showOtpInput && (
            <button
              type="button"
              className="w-full text-center text-sm text-black/70 disabled:text-black/40"
              disabled={resendCooldownMs > 0}
              onClick={() => {
                if (resendCooldownMs === 0) {
                  void phoneOtp.sendOtp(phoneNumber);
                  setResendCooldownMs(60000);
                }
              }}
            >
              {resendCooldownMs > 0 ? `Resend in ${Math.ceil(resendCooldownMs / 1000)}s` : 'Resend Code'}
            </button>
          )}
        </motion.form>
      )}

      {/* Email Authentication */}
      {type === 'email' && (
        <motion.form
          key="email-form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onSubmit={handleEmailSubmit}
          className="space-y-4"
        >
          {isLinkingMode && (
            <div className="mb-4 p-3 bg-gold/10 border border-gold/30 rounded-md">
              <p className="text-xs text-gold/80">
                Link your email address to enhance account security
              </p>
            </div>
          )}
          {/* Toggle between password and passwordless */}
          {mode === 'signup' || mode === 'login' ? (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Authentication method:</span>
              <button
                type="button"
                onClick={() => {
                  setUsePasswordless(!usePasswordless);
                  setShowOtpInput(false);
                  setErrorMessage(null);
                }}
                className="text-xs text-gold hover:underline"
              >
                {usePasswordless ? 'Use password' : 'Use passwordless link'}
              </button>
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
              disabled={showOtpInput || isEmailLoading}
              required
            />
          </div>

          {/* Password fields for signup/login */}
          {!usePasswordless && (mode === 'signup' || mode === 'login') && (
            <>
              {mode === 'signup' && (
                <>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              {mode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
                    required
                  />
                </div>
              )}
              {mode === 'signup' && (
                <div className="flex items-center">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mr-2"
                    required
                  />
                  <label htmlFor="agreeToTerms" className="text-xs text-gray-600">
                    I agree to the terms and conditions
                  </label>
                </div>
              )}
            </>
          )}

          {/* Passwordless email link message */}
          {usePasswordless && showOtpInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-white/40 rounded-md"
            >
              <p className="text-sm text-black">
                Check your email for a sign-in link. Click the link to complete authentication.
              </p>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isEmailLoading || (usePasswordless && showOtpInput)}
            className="w-full bg-white/40 text-black py-2 px-4 rounded-md hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isEmailLoading ? (
              <span className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"
                />
                {usePasswordless ? 'Sending Email...' : (mode === 'signup' ? 'Creating Account...' : 'Signing In...')}
              </span>
            ) : (
              usePasswordless 
                ? (showOtpInput ? 'Waiting for email link...' : 'Send Email Link')
                : (mode === 'signup' ? 'Sign Up' : 'Sign In')
            )}
          </motion.button>
          {!showOtpInput && (
            <button
              type="button"
              className="w-full text-center text-sm text-black/70 disabled:text-black/40"
              disabled={resendCooldownMs > 0}
              onClick={() => {
                if (resendCooldownMs === 0) {
                  void emailOtp.sendEmailLink(email);
                  setResendCooldownMs(60000);
                }
              }}
            >
              {resendCooldownMs > 0 ? `Resend in ${Math.ceil(resendCooldownMs / 1000)}s` : 'Resend Link'}
            </button>
          )}
        </motion.form>
      )}

      {/* Wallet Authentication */}
      {type === 'wallet' && (
        <motion.form
          key="wallet-form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onSubmit={handleWalletSubmit}
          className="space-y-4"
        >
          {isLinkingMode && (
            <div className="mb-4 p-3 bg-gold/10 border border-gold/30 rounded-md">
              <p className="text-xs text-gold/80">
                Link your crypto wallet to enable Web3 features
              </p>
            </div>
          )}
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
            <p className="text-gray-600 mb-4">
              {isLinkingMode ? 'Connect your wallet to link it to your account' : 'Connect your wallet to sign in securely'}
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={isWalletLoading}
            className="w-full bg-white/40 text-black py-2 px-4 rounded-md hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isWalletLoading ? (
              <span className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"
                />
                Connecting...
              </span>
            ) : (
              'Connect Wallet'
            )}
          </motion.button>
        </motion.form>
      )}
    </motion.div>
  );
};

export default AuthForm; 