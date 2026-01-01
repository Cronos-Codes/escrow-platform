import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminOverride } from '../../hooks/useAdminOverride';
import { useAuth } from '@escrow/auth';
import { Button } from '@escrow/ui';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  UserCheck,
  DollarSign,
  Scale,
  Clock,
  FileText
} from 'lucide-react';

interface AdminOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  disputeId: string;
  disputeData: {
    id: string;
    title: string;
    amount: number;
    status: string;
    buyer: string;
    seller: string;
    currentVotes: {
      buyer: number;
      seller: number;
      neutral: number;
    };
    totalVotes: number;
  };
  onOverrideComplete?: () => void;
}

interface OverrideAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  requiresReason: boolean;
  requiresAmount?: boolean;
  severity: 'low' | 'medium' | 'high';
}

const OVERRIDE_ACTIONS: OverrideAction[] = [
  {
    id: 'force_resolve_buyer',
    label: 'Force Resolve for Buyer',
    description: 'Override all votes and award funds to buyer',
    icon: CheckCircle,
    requiresReason: true,
    severity: 'high'
  },
  {
    id: 'force_resolve_seller',
    label: 'Force Resolve for Seller',
    description: 'Override all votes and award funds to seller',
    icon: CheckCircle,
    requiresReason: true,
    severity: 'high'
  },
  {
    id: 'split_funds',
    label: 'Split Funds',
    description: 'Divide funds between buyer and seller',
    icon: DollarSign,
    requiresReason: true,
    requiresAmount: true,
    severity: 'medium'
  },
  {
    id: 'extend_deadline',
    label: 'Extend Deadline',
    description: 'Give arbiters more time to reach consensus',
    icon: Clock,
    requiresReason: false,
    severity: 'low'
  },
  {
    id: 'reassign_arbiters',
    label: 'Reassign Arbiters',
    description: 'Replace current arbiters with new ones',
    icon: UserCheck,
    requiresReason: true,
    severity: 'medium'
  },
  {
    id: 'blacklist_user',
    label: 'Blacklist User',
    description: 'Prevent user from future disputes',
    icon: XCircle,
    requiresReason: true,
    severity: 'high'
  }
];

export const AdminOverrideModal: React.FC<AdminOverrideModalProps> = ({
  isOpen,
  onClose,
  disputeId,
  disputeData,
  onOverrideComplete
}) => {
  const { user } = useAuth();
  const { executeOverride, isExecuting, error } = useAdminOverride();
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [reason, setReason] = useState('');
  const [splitAmount, setSplitAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  const handleOverride = useCallback(async () => {
    if (!selectedAction) return;

    const actionData = OVERRIDE_ACTIONS.find(a => a.id === selectedAction);
    if (!actionData) return;

    const overrideData = {
      action: selectedAction,
      reason: actionData.requiresReason ? reason : undefined,
      splitAmount: actionData.requiresAmount ? parseFloat(splitAmount) : undefined
    };

    const success = await executeOverride(disputeId, overrideData);
    
    if (success) {
      setShowConfirmation(false);
      setSelectedAction('');
      setReason('');
      setSplitAmount('');
      onOverrideComplete?.();
      onClose();
    }
  }, [disputeId, selectedAction, reason, splitAmount, executeOverride, onOverrideComplete, onClose]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-red-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Admin Override</h2>
                <p className="text-sm text-gray-500">Dispute #{disputeId}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isExecuting}
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Left Panel - Dispute Info */}
            <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Dispute Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <p className="text-gray-900">{disputeData.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-gray-900">${disputeData.amount.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    disputeData.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {disputeData.status}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Parties</label>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Buyer: {disputeData.buyer}</p>
                    <p className="text-sm text-gray-600">Seller: {disputeData.seller}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Current Votes</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Buyer</span>
                      <span className="text-sm font-medium text-green-600">
                        {disputeData.currentVotes.buyer}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Seller</span>
                      <span className="text-sm font-medium text-red-600">
                        {disputeData.currentVotes.seller}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Neutral</span>
                      <span className="text-sm font-medium text-gray-600">
                        {disputeData.currentVotes.neutral}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Total</span>
                        <span className="text-sm font-medium text-gray-900">
                          {disputeData.totalVotes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuditTrail(!showAuditTrail)}
                  className="w-full"
                >
                  {showAuditTrail ? 'Hide' : 'Show'} Audit Trail
                </Button>
              </div>
            </div>

            {/* Right Panel - Override Actions */}
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Override Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {OVERRIDE_ACTIONS.map(action => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedAction === action.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(action.severity)}`}>
                        {getSeverityIcon(action.severity)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{action.label}</h4>
                        <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            action.severity === 'high' 
                              ? 'bg-red-100 text-red-800'
                              : action.severity === 'medium'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {action.severity} severity
                          </span>
                          {action.requiresReason && (
                            <span className="text-xs text-gray-500">Requires reason</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Configuration */}
              {selectedAction && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Configure {OVERRIDE_ACTIONS.find(a => a.id === selectedAction)?.label}
                  </h4>
                  
                  <div className="space-y-4">
                    {OVERRIDE_ACTIONS.find(a => a.id === selectedAction)?.requiresReason && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Override *
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Explain why this override is necessary..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                          rows={4}
                          required
                        />
                      </div>
                    )}

                    {OVERRIDE_ACTIONS.find(a => a.id === selectedAction)?.requiresAmount && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Split Amount (USD)
                        </label>
                        <input
                          type="number"
                          value={splitAmount}
                          onChange={(e) => setSplitAmount(e.target.value)}
                          placeholder="Enter amount for buyer"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          min="0"
                          max={disputeData.amount}
                          step="0.01"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Remaining ${splitAmount ? (disputeData.amount - parseFloat(splitAmount)).toFixed(2) : disputeData.amount.toFixed(2)} will go to seller
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isExecuting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowConfirmation(true)}
                  disabled={!selectedAction || isExecuting}
                  loading={isExecuting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Execute Override
                </Button>
              </div>
            </div>
          </div>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {showConfirmation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirm Admin Override
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    This action will override the normal dispute resolution process. 
                    This decision is final and will be logged in the audit trail.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-700">
                      <strong>Action:</strong> {OVERRIDE_ACTIONS.find(a => a.id === selectedAction)?.label}
                    </p>
                    {reason && (
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Reason:</strong> {reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmation(false)}
                      disabled={isExecuting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleOverride}
                      loading={isExecuting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirm Override
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 