import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { 
  AuthLayout, 
  AuthCard, 
  TextInput, 
  Button, 
  InlineError, 
  FooterCTA 
} from '@escrow/ui';
import AuthModal from '@escrow/ui/src/components/modals/AuthModal';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement Firebase sendPasswordResetEmail
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess('Password reset email sent! Check your inbox.');
      setEmail('');
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const logo = (
    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
      <span className="text-black font-bold text-2xl">G</span>
    </div>
  );

  return (
    <>
      <Head>
        <title>Reset Password - Gold Escrow</title>
        <meta name="description" content="Reset your Gold Escrow password" />
      </Head>

      <AuthLayout
        title="Reset Your Password"
        subtitle="Enter your email to receive reset instructions"
        logo={logo}
      >
        <AuthCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={setEmail}
              required
              autoFocus
              autoComplete="email"
              disabled={loading}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

        {/* Error/Success Messages */}
            <InlineError error={error || undefined} />

        {success && (
          <motion.div
                className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-green-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
          </motion.div>
        )}

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          {/* Footer links */}
          <div className="mt-8">
            <FooterCTA
              text="Remember your password?"
              linkText="Sign in"
              linkHref="#"
              onClick={e => {
                e.preventDefault();
                setLoginModalOpen(true);
              }}
            />
    </div>
        </AuthCard>
      </AuthLayout>

      <AuthModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        initialTab="email"
        initialMode="login"
      />
    </>
  );
};

export default ForgotPasswordPage; 