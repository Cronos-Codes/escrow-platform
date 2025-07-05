import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@escrow/ui';

interface GasFallbackBannerProps {
  className?: string;
  onManualTransaction?: () => void;
}

export const GasFallbackBanner: React.FC<GasFallbackBannerProps> = ({ 
  className = '',
  onManualTransaction 
}) => {
  const { showToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate a failed transaction scenario
  React.useEffect(() => {
    // In a real implementation, this would be triggered by a failed relayUserOp
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualTransaction = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate manual transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onManualTransaction) {
        onManualTransaction();
      }
      
      showToast('Manual transaction initiated', 'success');
      setIsVisible(false);
    } catch (error) {
      showToast('Failed to process manual transaction', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleRetry = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate retry attempt
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      showToast('Transaction retry successful', 'success');
      setIsVisible(false);
    } catch (error) {
      showToast('Retry failed, please try manual transaction', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl shadow-lg ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-yellow-800">
                Gas Sponsorship Failed
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-yellow-600 hover:text-yellow-800 transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-yellow-600 hover:text-yellow-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <p className="text-sm text-yellow-700 mt-1">
              The gasless transaction could not be processed. You can retry or proceed with a manual transaction.
            </p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3"
                >
                  <div className="bg-white/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Error Details</h4>
                    <div className="text-xs text-yellow-700 space-y-1">
                      <p><strong>Error:</strong> Insufficient sponsor balance</p>
                      <p><strong>Sponsor:</strong> 0x1234...5678</p>
                      <p><strong>Required Gas:</strong> 0.002 ETH</p>
                      <p><strong>Available:</strong> 0.001 ETH</p>
                    </div>
                  </div>

                  <div className="bg-white/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Solutions</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Retry the transaction (may work if gas prices have dropped)</li>
                      <li>• Use manual transaction (you'll pay gas fees directly)</li>
                      <li>• Contact sponsor to add more funds</li>
                      <li>• Wait for sponsor to whitelist your address</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleRetry}
                disabled={isProcessing}
                className="flex-1 sm:flex-none px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Retrying...
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry Transaction
                  </>
                )}
              </button>
              
              <button
                onClick={handleManualTransaction}
                disabled={isProcessing}
                className="flex-1 sm:flex-none px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Manual Transaction
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 text-xs text-yellow-600">
              <p>
                <strong>Note:</strong> Manual transactions require you to pay gas fees directly from your wallet.
                The transaction will be processed normally but without gas sponsorship.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 