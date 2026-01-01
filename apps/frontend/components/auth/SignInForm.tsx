"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@escrow/auth';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

export const SignInForm = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await signup({
          email,
          password,
          confirmPassword,
          firstName,
          lastName,
          role: 'BUYER' as any, // Default role
          agreeToTerms,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
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
            {isLogin ? (
              <FaUser className="w-5 h-5 text-gold" />
            ) : (
              <FaShieldAlt className="w-5 h-5 text-gold" />
            )}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gold mb-1">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h3>
        <p className="text-gray-400 text-sm">
          {isLogin ? 'Sign in to your account' : 'Join our secure platform'}
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <div className="relative bg-black/30 backdrop-blur-sm rounded-2xl p-1 border border-gold/20">
          <div className="flex space-x-1">
            {['login', 'signup'].map((mode) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLogin(mode === 'login')}
                className={`relative px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  (isLogin && mode === 'login') || (!isLogin && mode === 'signup')
                    ? 'text-black'
                    : 'text-gray-400 hover:text-gold'
                }`}
              >
                {(isLogin && mode === 'login') || (!isLogin && mode === 'signup') && (
                  <motion.div
                    layoutId="modeToggle"
                    className="absolute inset-0 bg-gradient-to-r from-gold to-yellow-500 rounded-xl shadow-lg"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">{mode}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="relative">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <FaEnvelope className="w-4 h-4 text-gold/60" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-4 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 hover:border-gold/30"
              required
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/5 to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <FaLock className="w-4 h-4 text-gold/60" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-12 pr-12 py-4 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 hover:border-gold/30"
              required
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gold/20 transition-colors"
            >
              {showPassword ? (
                <FaEyeSlash className="w-4 h-4 text-gold/60" />
              ) : (
                <FaEye className="w-4 h-4 text-gold/60" />
              )}
            </motion.button>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/5 to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        {/* Confirm Password (Signup only) */}
        <AnimatePresence>
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FaLock className="w-4 h-4 text-gold/60" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-12 py-4 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 hover:border-gold/30"
                  required={!isLogin}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gold/20 transition-colors"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="w-4 h-4 text-gold/60" />
                  ) : (
                    <FaEye className="w-4 h-4 text-gold/60" />
                  )}
                </motion.button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/5 to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10 flex items-center justify-center space-x-2">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
              />
            ) : (
              <FaArrowRight className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
          </span>
        </motion.button>
      </motion.form>

      {/* Footer Links */}
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <p className="text-xs text-gray-400">
          By continuing, you agree to our{' '}
          <a href="/legal/terms" className="text-gold hover:text-yellow-300 transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/legal/privacy" className="text-gold hover:text-yellow-300 transition-colors">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
};
