/**
 * @file Credential Reminder Banner
 * @description Non-intrusive banner prompting users to complete missing credentials
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaPhone, FaWallet, FaTimes } from 'react-icons/fa';

export interface CredentialReminderBannerProps {
  missingCredentials: Array<'email' | 'phone' | 'wallet'>;
  onDismiss?: () => void;
  onAddCredential?: (type: 'email' | 'phone' | 'wallet') => void;
  className?: string;
}

const credentialLabels = {
  email: 'Email',
  phone: 'Phone Number',
  wallet: 'Crypto Wallet',
};

const credentialIcons = {
  email: FaEnvelope,
  phone: FaPhone,
  wallet: FaWallet,
};

export const CredentialReminderBanner: React.FC<CredentialReminderBannerProps> = ({
  missingCredentials,
  onDismiss,
  onAddCredential,
  className = '',
}) => {
  if (missingCredentials.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-gold/10 border border-gold/30 rounded-lg p-4 mb-4 ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gold mb-2">
              Complete Your Profile
            </h3>
            <p className="text-xs text-gold/80 mb-3">
              Add {missingCredentials.length === 1 ? 'your' : 'your'} missing{' '}
              {missingCredentials.length === 1 ? 'credential' : 'credentials'} to enhance security and access:
            </p>
            <div className="flex flex-wrap gap-2">
              {missingCredentials.map((credential) => {
                const Icon = credentialIcons[credential];
                return (
                  <button
                    key={credential}
                    onClick={() => onAddCredential?.(credential)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gold/20 hover:bg-gold/30 rounded-md text-xs font-medium text-gold transition-colors"
                  >
                    <Icon className="w-3 h-3" />
                    <span>Add {credentialLabels[credential]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded-full hover:bg-gold/20 text-gold/60 hover:text-gold transition-colors"
              aria-label="Dismiss reminder"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CredentialReminderBanner;


