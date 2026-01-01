"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useVerificationStatus } from '@escrow/auth';
import { FaEnvelope, FaPhone, FaWallet, FaPlus, FaCheck } from 'react-icons/fa';

interface AddVerificationMethodProps {
  onClose: () => void;
}

export const AddVerificationMethod = ({ onClose }: AddVerificationMethodProps) => {
  const { verificationStatus } = useVerificationStatus();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const availableMethods = [
    {
      id: 'email',
      label: 'Email Verification',
      description: 'Verify your email address',
      icon: FaEnvelope,
      available: !verificationStatus.emailVerified,
    },
    {
      id: 'phone',
      label: 'Phone Verification',
      description: 'Add phone number for SMS verification',
      icon: FaPhone,
      available: !verificationStatus.phoneVerified,
    },
    {
      id: 'wallet',
      label: 'Wallet Connection',
      description: 'Connect your crypto wallet',
      icon: FaWallet,
      available: !verificationStatus.walletConnected,
    },
  ].filter(method => method.available);

  const handleAddMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    // Here you would implement the actual verification flow
    // For now, we'll just show a success message
    setTimeout(() => {
      setSelectedMethod(null);
      onClose();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-4"
    >
      <div className="text-center">
        <h3 className="text-lg font-bold text-gold mb-1">Add Verification Method</h3>
        <p className="text-gray-400 text-xs">Enhance your account security with additional verification</p>
      </div>

      <div className="space-y-2">
        {availableMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <motion.button
              key={method.id}
              onClick={() => handleAddMethod(method.id)}
              disabled={isSelected}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-3 rounded-xl border transition-all duration-300 text-left ${
                isSelected
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gold/20 bg-black/40 backdrop-blur-sm hover:border-gold/40 hover:bg-black/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected 
                    ? 'bg-green-500/20' 
                    : 'bg-gradient-to-br from-gold/20 to-yellow-500/20'
                }`}>
                  {isSelected ? (
                    <FaCheck className="w-4 h-4 text-green-400" />
                  ) : (
                    <IconComponent className="w-4 h-4 text-gold" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${
                    isSelected ? 'text-green-400' : 'text-gold'
                  }`}>
                    {method.label}
                  </h4>
                  <p className="text-xs text-gray-400">{method.description}</p>
                </div>
                {!isSelected && (
                  <FaPlus className="w-4 h-4 text-gold/60" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {availableMethods.length === 0 && (
        <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <FaCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-300 text-sm font-medium">All verification methods added!</p>
          <p className="text-green-200 text-xs">Your account is fully secured</p>
        </div>
      )}

      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
      >
        Close
      </motion.button>
    </motion.div>
  );
};

