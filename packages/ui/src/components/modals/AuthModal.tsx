import React, { useRef, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from './AuthForm';
import CredentialReminderBanner from './CredentialReminderBanner';
import CredentialStatusDisplay from './CredentialStatusDisplay';
import { AuthErrorBoundary } from './AuthErrorBoundary';
import Draggable from 'react-draggable';
import { useAuth, useCredentialLinking } from '@escrow/auth';
import { User as FirebaseUser } from 'firebase/auth';

// Placeholder for theme usage
// import { useTheme } from '../../theme';

export interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'email' | 'phone' | 'wallet';
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange, initialTab = 'email', initialMode = 'login' }) => {
  const nodeRef = useRef(null);
  const [tab, setTab] = React.useState<'email' | 'phone' | 'wallet'>(initialTab);
  const [mode, setMode] = React.useState<'login' | 'signup'>(initialMode);
  const [isLinkingMode, setIsLinkingMode] = React.useState(false);
  const [dismissedBanner, setDismissedBanner] = React.useState(false);
  
  const { user } = useAuth();
  const credentialLinking = useCredentialLinking();

  React.useEffect(() => {
    setTab(initialTab);
    setMode(initialMode);
  }, [initialTab, initialMode, open]);

  // Check if user is logged in and has missing credentials
  useEffect(() => {
    if (user && open) {
      credentialLinking.refreshCredentials(user.uid);
      setIsLinkingMode(true);
    } else {
      setIsLinkingMode(false);
    }
  }, [user, open, credentialLinking]);

  const handleAddCredential = (type: 'email' | 'phone' | 'wallet') => {
    setTab(type);
    setMode('signup'); // Use signup mode for linking
    setIsLinkingMode(true);
    setDismissedBanner(false);
  };

  const handleSuccess = () => {
    if (isLinkingMode && user) {
      // Refresh credentials after linking
      credentialLinking.refreshCredentials(user.uid);
    }
    // Don't close modal in linking mode, allow user to add more credentials
    if (!isLinkingMode) {
      onOpenChange(false);
    }
  };

  // Animation config (to be extracted later)
  const modalMotion = {
    initial: { opacity: 0, scale: 0.95, y: 40 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, scale: 0.95, y: 40, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <AuthErrorBoundary>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden="true"
              />
            </Dialog.Overlay>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {open && (
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed z-[1001] w-[90vw] max-w-md rounded-2xl shadow-2xl border border-gold/40 bg-white/60 dark:bg-black/60 backdrop-blur-lg p-0 flex flex-col gap-0 focus:outline-none items-stretch justify-stretch"
                {...modalMotion}
              >
                {/* Hidden container for Firebase reCAPTCHA (required for phone auth). Placed at modal root to exist in DOM. */}
                <div id="recaptcha-container" className="hidden" />
                <Draggable handle=".auth-modal-drag-handle" cancel=".no-drag" nodeRef={nodeRef}>
                  <div ref={nodeRef} className="w-full h-full">
                    {/* Close button */}
                    <Dialog.Close asChild>
                      <button
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gold/10 focus:outline-none focus:ring-2 focus:ring-gold no-drag z-10"
                        aria-label="Close auth modal"
                      >
                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </Dialog.Close>
                    {/* Tabs */}
                    <Tabs.Root value={tab} onValueChange={v => setTab(v as any)} className="w-full auth-modal-drag-handle cursor-move">
                      <Tabs.List className="flex w-full justify-between border-b border-gold/20 bg-transparent">
                        <Tabs.Trigger value="email" className="flex-1 py-3 text-center font-semibold text-gold data-[state=active]:bg-gold/10">Email</Tabs.Trigger>
                        <Tabs.Trigger value="phone" className="flex-1 py-3 text-center font-semibold text-gold data-[state=active]:bg-gold/10">Phone</Tabs.Trigger>
                        <Tabs.Trigger value="wallet" className="flex-1 py-3 text-center font-semibold text-gold data-[state=active]:bg-gold/10">Wallet</Tabs.Trigger>
                      </Tabs.List>
                      {/* Mode switch */}
                      <div className="flex justify-center gap-2 py-4">
                        <button
                          className={`px-4 py-1 rounded-lg font-medium transition-colors ${mode === 'login' ? 'bg-gold text-black' : 'text-gold hover:bg-gold/10'}`}
                          onClick={() => setMode('login')}
                          aria-pressed={mode === 'login'}
                        >
                          Login
                        </button>
                        <button
                          className={`px-4 py-1 rounded-lg font-medium transition-colors ${mode === 'signup' ? 'bg-gold text-black' : 'text-gold hover:bg-gold/10'}`}
                          onClick={() => setMode('signup')}
                          aria-pressed={mode === 'signup'}
                        >
                          Sign Up
                        </button>
                      </div>
                      {/* Credential Reminder Banner */}
                      {user && !dismissedBanner && credentialLinking.state.missingCredentials.length > 0 && (
                        <div className="px-6 pt-4">
                          <CredentialReminderBanner
                            missingCredentials={credentialLinking.state.missingCredentials}
                            onDismiss={() => setDismissedBanner(true)}
                            onAddCredential={handleAddCredential}
                          />
                        </div>
                      )}
                      {/* Credential Verification Status */}
                      {user && credentialLinking.state.credentials && (
                        <div className="px-6 pt-2">
                          <CredentialStatusDisplay
                            status={credentialLinking.state.verificationStatus}
                          />
                        </div>
                      )}
                      {/* Tab Content */}
                      <Tabs.Content value="email" className="p-6">
                        {tab === 'email' && (
                          <AuthForm 
                            mode={mode} 
                            type="email" 
                            onSuccess={handleSuccess} 
                            onError={() => {}} 
                            currentUser={user as FirebaseUser | null}
                            isLinkingMode={isLinkingMode}
                          />
                        )}
                      </Tabs.Content>
                      <Tabs.Content value="phone" className="p-6">
                        {tab === 'phone' && (
                          <AuthForm 
                            mode={mode} 
                            type="phone" 
                            onSuccess={handleSuccess} 
                            onError={() => {}} 
                            currentUser={user as FirebaseUser | null}
                            isLinkingMode={isLinkingMode}
                          />
                        )}
                      </Tabs.Content>
                      <Tabs.Content value="wallet" className="p-6">
                        {tab === 'wallet' && (
                          <AuthForm 
                            mode={mode} 
                            type="wallet" 
                            onSuccess={handleSuccess} 
                            onError={() => {}} 
                            currentUser={user as FirebaseUser | null}
                            isLinkingMode={isLinkingMode}
                          />
                        )}
                      </Tabs.Content>
                    </Tabs.Root>
                  </div>
                </Draggable>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
    </AuthErrorBoundary>
  );
};

export default AuthModal; 