"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletLogin } from '@escrow/auth';
import { FaWallet, FaEthereum, FaLink, FaCheck, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

const walletProviders = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular Ethereum wallet',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect any wallet',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🪙',
    description: 'Secure and user-friendly',
    color: 'from-blue-400 to-blue-500'
  }
];

export const WalletConnectForm = () => {
  const { connectWallet, state } = useWalletLogin();
  const { loading, error } = state;
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleWalletConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setIsConnecting(true);
    setLocalError('');

    try {
      await connectWallet();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
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
            <FaWallet className="w-5 h-5 text-gold" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gold mb-1">
          Connect Your Wallet
        </h3>
        <p className="text-gray-400 text-sm">
          Secure blockchain authentication
        </p>
      </motion.div>

      {/* Wallet Options */}
      <motion.div variants={itemVariants} className="space-y-3">
        {walletProviders.map((wallet, index) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <motion.button
              onClick={() => handleWalletConnect(wallet.id)}
              disabled={isConnecting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                selectedWallet === wallet.id
                  ? 'border-gold bg-gold/10'
                  : 'border-gold/20 bg-black/40 backdrop-blur-sm hover:border-gold/40 hover:bg-black/60'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${wallet.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-yellow-500/20 flex items-center justify-center text-2xl">
                    {wallet.icon}
                  </div>
                </div>
                
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gold group-hover:text-yellow-300 transition-colors">
                    {wallet.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {wallet.description}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {selectedWallet === wallet.id && isConnecting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full"
                    />
                  ) : selectedWallet === wallet.id ? (
                    <FaCheck className="w-6 h-6 text-gold" />
                  ) : (
                    <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
                  )}
                </div>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

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

      {/* Manual Address Input */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="text-center">
          <h4 className="text-sm font-medium text-gold mb-2">Or connect manually</h4>
        </div>
        
        <div className="relative">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <FaEthereum className="w-4 h-4 text-gold/60" />
            </div>
            <input
              type="text"
              placeholder="Enter wallet address (0x...)"
              className="w-full pl-12 pr-4 py-4 bg-black/40 backdrop-blur-sm border border-gold/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all duration-300 hover:border-gold/30"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/5 to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-gold/20 to-yellow-500/20 border border-gold/30 text-gold font-medium rounded-2xl hover:from-gold/30 hover:to-yellow-500/30 transition-all duration-300"
        >
          Connect Address
        </motion.button>
      </motion.div>

      {/* Security Info */}
      <motion.div variants={itemVariants} className="bg-black/20 backdrop-blur-sm border border-gold/10 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <FaShieldAlt className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gold mb-1">Secure Connection</h4>
            <p className="text-xs text-gray-400">
              Your wallet connection is encrypted and secure. We never store your private keys.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-xs text-gray-400">
          Supported networks: Ethereum, Polygon, BSC
        </p>
      </motion.div>
    </motion.div>
  );
};
