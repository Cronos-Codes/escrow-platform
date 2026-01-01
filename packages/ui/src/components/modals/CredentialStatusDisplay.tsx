/**
 * @file Credential Status Display
 * @description Shows verification status for each credential
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaWallet, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { CredentialVerificationStatus } from '@escrow/auth';

export interface CredentialStatusDisplayProps {
  status: CredentialVerificationStatus;
  className?: string;
}

const credentialConfig = {
  email: {
    icon: FaEnvelope,
    label: 'Email',
    color: 'text-blue-600',
  },
  phone: {
    icon: FaPhone,
    label: 'Phone',
    color: 'text-green-600',
  },
  wallet: {
    icon: FaWallet,
    label: 'Wallet',
    color: 'text-purple-600',
  },
};

export const CredentialStatusDisplay: React.FC<CredentialStatusDisplayProps> = ({
  status,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Object.entries(status).map(([key, value]) => {
        const config = credentialConfig[key as keyof typeof credentialConfig];
        const Icon = config.icon;

        if (!value.exists) {
          return null; // Don't show if credential doesn't exist
        }

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-white/40 rounded-lg border border-gold/20"
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${config.color}`} />
              <div>
                <p className="text-sm font-medium text-gray-800">{config.label}</p>
                <p className="text-xs text-gray-500">
                  {value.verified ? 'Verified' : 'Pending verification'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {value.verified ? (
                <FaCheckCircle className="w-5 h-5 text-green-500" title="Verified" />
              ) : (
                <FaClock className="w-5 h-5 text-yellow-500" title="Pending verification" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CredentialStatusDisplay;


