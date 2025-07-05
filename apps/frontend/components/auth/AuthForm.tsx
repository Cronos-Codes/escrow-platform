import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePhoneOtp, useEmailOtp, useWalletLogin } from '@escrow/auth';

interface AuthFormProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onError }) => {
  const [activeTab, setActiveTab] = useState<'phone' | 'email' | 'wallet'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const phoneOtp = usePhoneOtp();
  const emailOtp = useEmailOtp();
  const walletLogin = useWalletLogin();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showOtpInput) {
      await phoneOtp.sendOtp(phoneNumber);
      if (phoneOtp.state.success) {
        setShowOtpInput(true);
      } else if (phoneOtp.state.error) {
        onError(phoneOtp.state.error);
      }
    } else {
      const userCredential = await phoneOtp.verifyOtp(otpCode);
      if (userCredential) {
        onSuccess(userCredential.user);
      } else if (phoneOtp.state.error) {
        onError(phoneOtp.state.error);
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showOtpInput) {
      await emailOtp.sendEmailLink(email);
      if (emailOtp.state.success) {
        setShowOtpInput(true);
      } else if (emailOtp.state.error) {
        onError(emailOtp.state.error);
      }
    } else {
      const userCredential = await emailOtp.verifyEmailLink();
      if (userCredential) {
        onSuccess(userCredential.user);
      } else if (emailOtp.state.error) {
        onError(emailOtp.state.error);
      }
    }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await walletLogin.connectWallet();
    if (walletLogin.state.success) {
      onSuccess({ walletAddress: walletLogin.state.walletAddress });
    } else if (walletLogin.state.error) {
      onError(walletLogin.state.error);
    }
  };

  const isPhoneLoading = phoneOtp.state.loading;
  const isEmailLoading = emailOtp.state.loading;
  const isWalletLoading = walletLogin.state.loading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        {(['phone', 'email', 'wallet'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setShowOtpInput(false);
              setOtpCode('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Phone Authentication */}
      {activeTab === 'phone' && (
        <motion.form
          key="phone-form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onSubmit={handlePhoneSubmit}
          className="space-y-4"
        >
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isPhoneLoading}
                  required
                />
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isPhoneLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isPhoneLoading ? (
              <span className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                {showOtpInput ? 'Verifying...' : 'Sending OTP...'}
              </span>
            ) : (
              showOtpInput ? 'Verify OTP' : 'Send OTP'
            )}
          </motion.button>
        </motion.form>
      )}

      {/* Email Authentication */}
      {activeTab === 'email' && (
        <motion.form
          key="email-form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onSubmit={handleEmailSubmit}
          className="space-y-4"
        >
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={showOtpInput || isEmailLoading}
              required
            />
          </div>

          {showOtpInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-blue-50 rounded-md"
            >
              <p className="text-sm text-blue-800">
                Check your email for a sign-in link. Click the link to complete authentication.
              </p>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isEmailLoading || showOtpInput}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isEmailLoading ? (
              <span className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Sending Email...
              </span>
            ) : (
              'Send Email Link'
            )}
          </motion.button>
        </motion.form>
      )}

      {/* Wallet Authentication */}
      {activeTab === 'wallet' && (
        <motion.form
          key="wallet-form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onSubmit={handleWalletSubmit}
          className="space-y-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
            <p className="text-gray-600 mb-4">
              Connect your wallet to sign in securely
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={isWalletLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isWalletLoading ? (
              <span className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
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