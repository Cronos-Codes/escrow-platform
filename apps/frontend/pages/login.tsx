import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { BackgroundScene, GoldCard, GoldButton, GoldInput, ThemeProvider } from '@escrow/ui';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginMethod === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    } else {
      if (!formData.email) {
        newErrors.email = 'Phone number is required';
      } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Handle successful login
      console.log('Login successful:', formData);
      
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { opacity: 0 }
  };

  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 50,
      scale: 0.95,
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2,
      }
    }
  };

  return (
    <ThemeProvider>
      <Head>
        <title>Login - Gold Escrow</title>
        <meta name="description" content="Secure login to Gold Escrow platform" />
      </Head>

      <BackgroundScene className="min-h-screen">
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-md"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <GoldCard variant="elevated" className="p-8">
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-black font-bold text-2xl">G</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gold mb-2">Welcome Back</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sign in to your Gold Escrow account
                  </p>
                </div>

                {/* Login Method Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      loginMethod === 'email'
                        ? 'bg-white dark:bg-gray-700 text-gold shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gold'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      loginMethod === 'phone'
                        ? 'bg-white dark:bg-gray-700 text-gold shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gold'
                    }`}
                  >
                    Phone
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <GoldInput
                    label={loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    error={errors.email}
                    required
                    autoFocus
                  />

                  <GoldInput
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(value) => handleInputChange('password', value)}
                    error={errors.password}
                    required
                  />

                  {/* Error message */}
                  {errors.general && (
                    <motion.div
                      className="p-3 bg-error/10 border border-error/20 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-error text-sm">{errors.general}</p>
                    </motion.div>
                  )}

                  {/* Submit button */}
                  <GoldButton
                    type="submit"
                    loading={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </GoldButton>
                </form>

                {/* Links */}
                <div className="mt-6 text-center space-y-4">
                  <Link 
                    href="/forgot-password"
                    className="text-gold hover:text-gold-dark transition-colors text-sm"
                  >
                    Forgot your password?
                  </Link>
                  
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link 
                      href="/signup"
                      className="text-gold hover:text-gold-dark transition-colors font-medium"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>

                {/* Social login options */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-black text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <GoldButton
                      variant="outline"
                      size="sm"
                      onClick={() => console.log('Google login')}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </GoldButton>

                    <GoldButton
                      variant="outline"
                      size="sm"
                      onClick={() => console.log('Wallet login')}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Wallet
                    </GoldButton>
                  </div>
                </div>
              </motion.div>
            </GoldCard>
          </motion.div>
        </div>
      </BackgroundScene>
    </ThemeProvider>
  );
};

export default LoginPage; 