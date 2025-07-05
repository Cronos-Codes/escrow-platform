import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EscrowOverridePanelProps {
  className?: string;
}

interface FlaggedTransaction {
  id: string;
  escrowId: string;
  userAddress: string;
  amount: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  status: 'pending' | 'reviewed' | 'resolved';
}

export const EscrowOverridePanel: React.FC<EscrowOverridePanelProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'revoke' | 'freeze' | 'review' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data for flagged transactions
  const [flaggedTransactions] = useState<FlaggedTransaction[]>([
    {
      id: '1',
      escrowId: 'escrow_001',
      userAddress: '0x1234...5678',
      amount: '1.5 ETH',
      reason: 'Suspicious transaction pattern',
      severity: 'high',
      timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      status: 'pending'
    },
    {
      id: '2',
      escrowId: 'escrow_002',
      userAddress: '0x8765...4321',
      amount: '0.5 ETH',
      reason: 'KYC verification pending',
      severity: 'medium',
      timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
      status: 'reviewed'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRevokeEscrow = async (escrowId: string) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Escrow revoked:', escrowId);
    } catch (error) {
      console.error('Error revoking escrow:', error);
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  const handleFreezeUser = async (userAddress: string) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('User frozen:', userAddress);
    } catch (error) {
      console.error('Error freezing user:', error);
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 ${className}`}>
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Escrow Override Panel</h3>
              <p className="text-sm text-gray-300">Admin controls for escrow management</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <svg 
              className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-6"
          >
            {/* Quick Actions */}
            <div>
              <h4 className="text-md font-medium text-white mb-4">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedAction('revoke')}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    <div>
                      <p className="font-medium text-white">Revoke Escrow</p>
                      <p className="text-sm text-gray-300">Cancel active escrow</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedAction('freeze')}
                  className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="font-medium text-white">KYC Freeze</p>
                      <p className="text-sm text-gray-300">Freeze user account</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedAction('review')}
                  className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-white">Review Transactions</p>
                      <p className="text-sm text-gray-300">Review flagged activity</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Flagged Transactions */}
            <div>
              <h4 className="text-md font-medium text-white mb-4">Flagged Transactions</h4>
              <div className="space-y-3">
                {flaggedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(transaction.severity)}`}>
                          {transaction.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-400">Escrow ID</p>
                        <p className="text-white font-mono">{transaction.escrowId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">User Address</p>
                        <p className="text-white font-mono">{transaction.userAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Amount</p>
                        <p className="text-white">{transaction.amount}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-400">Reason</p>
                      <p className="text-white">{transaction.reason}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRevokeEscrow(transaction.escrowId)}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        Revoke Escrow
                      </button>
                      <button
                        onClick={() => handleFreezeUser(transaction.userAddress)}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
                      >
                        Freeze User
                      </button>
                      <button
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Modals */}
            <AnimatePresence>
              {selectedAction && (
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedAction(null)}
                >
                  <motion.div
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedAction === 'revoke' && 'Revoke Escrow'}
                          {selectedAction === 'freeze' && 'Freeze User'}
                          {selectedAction === 'review' && 'Review Transaction'}
                        </h3>
                      </div>
                      
                      <div className="p-6">
                        <p className="text-gray-600 mb-4">
                          {selectedAction === 'revoke' && 'Are you sure you want to revoke this escrow? This action cannot be undone.'}
                          {selectedAction === 'freeze' && 'Are you sure you want to freeze this user account? They will not be able to perform transactions.'}
                          {selectedAction === 'review' && 'Mark this transaction as reviewed and resolved.'}
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => setSelectedAction(null)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              // Handle action
                              setSelectedAction(null);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 