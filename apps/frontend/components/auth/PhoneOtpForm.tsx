"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhoneOtp } from '@escrow/auth';
import { FaPhone, FaKey, FaArrowLeft, FaRedo, FaShieldAlt, FaCheck } from 'react-icons/fa';

export const PhoneOtpForm = () => {
  const { sendOtp, verifyOtp, state } = usePhoneOtp();
  const { loading, error } = state;
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone) {
      setLocalError('Please enter a valid phone number');
      return;
    }
    
    setLocalError('');
    try {
      await sendOtp(phone);
      setOtpSent(true);
      setCountdown(60);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setLocalError('Please enter the OTP');
      return;
    }
    
    setLocalError('');
    try {
      await verifyOtp(otp);
    } catch (err: any) {
      setLocalError(err.message || 'Invalid OTP');
    }
  };

  const handleResendOtp = () => {
    handleSendOtp();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-yellow-500/20 flex items-center justify-center">
            <FaPhone className="w-5 h-5 text-gold" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gold mb-1">
          {otpSent ? 'Verify OTP' : 'Phone Verification'}
        </h3>
        <p className="text-gray-400 text-sm">
          {otpSent ? 'Enter the code sent to your phone' : 'Secure authentication via SMS'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!otpSent ? (
          <motion.div
            key="phone-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            variants={itemVariants}
            className="space-y-4"
          >
            {/* Phone Input */}
            <div className="relative">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FaPhone className="w-4 h-4 text-gold/60" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full pl-12 pr-4 py-4 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 hover:border-gold/30"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/5 to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {localError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
                >
                  {localError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Send OTP Button */}
            <motion.button
              onClick={handleSendOtp}
              disabled={loading || !phone}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                ) : (
                  <FaShieldAlt className="w-4 h-4" />
                )}
                <span>{loading ? 'Sending...' : 'Send OTP'}</span>
              </span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="otp-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            variants={itemVariants}
            className="space-y-4"
          >
            {/* Back Button */}
            <motion.button
              onClick={() => setOtpSent(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-gold hover:text-yellow-300 transition-colors mb-4"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to phone</span>
            </motion.button>

            {/* OTP Input */}
            <div className="relative">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FaKey className="w-4 h-4 text-gold/60" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-4 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 hover:border-gold/30 text-center text-lg tracking-widest"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/5 to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {(localError || error) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
                >
                  {localError || error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verify OTP Button */}
            <motion.button
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                ) : (
                  <FaCheck className="w-4 h-4" />
                )}
                <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
              </span>
            </motion.button>

            {/* Resend OTP */}
            <div className="text-center">
              <motion.button
                onClick={handleResendOtp}
                disabled={countdown > 0 || loading}
                whileHover={countdown === 0 ? { scale: 1.05 } : {}}
                whileTap={countdown === 0 ? { scale: 0.95 } : {}}
                className="flex items-center justify-center space-x-2 text-gold hover:text-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaRedo className={`w-4 h-4 ${countdown > 0 ? 'animate-spin' : ''}`} />
                <span className="text-sm">
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-xs text-gray-400">
          Your phone number is encrypted and secure
        </p>
      </motion.div>
    </motion.div>
  );
};
