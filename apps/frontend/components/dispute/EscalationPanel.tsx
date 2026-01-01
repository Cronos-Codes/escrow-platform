import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDisputeEscalation } from '../../hooks/useDisputeEscalation';
import { useAuth } from '@escrow/auth';
import { Button } from '@escrow/ui';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  Clock, 
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

interface EscalationPanelProps {
  disputeId: string;
  currentLevel: number;
  maxLevel: number;
  canEscalate: boolean;
  escalationHistory: Array<{
    level: number;
    reason: string;
    escalatedBy: string;
    timestamp: Date;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  onEscalationComplete?: () => void;
}

const ESCALATION_REASONS = [
  {
    id: 'deadlock',
    label: 'Arbiter Deadlock',
    description: 'Arbiters cannot reach consensus',
    icon: Users,
    level: 2
  },
  {
    id: 'complexity',
    label: 'High Complexity',
    description: 'Dispute requires specialized expertise',
    icon: Shield,
    level: 2
  },
  {
    id: 'urgency',
    label: 'Time Critical',
    description: 'Requires immediate resolution',
    icon: Clock,
    level: 3
  },
  {
    id: 'systemic',
    label: 'Systemic Issue',
    description: 'Affects multiple disputes',
    icon: AlertTriangle,
    level: 3
  }
];

export const EscalationPanel: React.FC<EscalationPanelProps> = ({
  disputeId,
  currentLevel,
  maxLevel,
  canEscalate,
  escalationHistory,
  onEscalationComplete
}) => {
  const { user } = useAuth();
  const { escalateDispute, isEscalating, error } = useDisputeEscalation();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleEscalation = useCallback(async () => {
    if (!selectedReason) return;

    const reason = selectedReason === 'custom' ? customReason : selectedReason;
    const success = await escalateDispute(disputeId, reason, currentLevel + 1);
    
    if (success) {
      setShowConfirmation(false);
      setSelectedReason('');
      setCustomReason('');
      onEscalationComplete?.();
    }
  }, [disputeId, selectedReason, customReason, currentLevel, escalateDispute, onEscalationComplete]);

  const canEscalateToLevel = (level: number) => {
    return level > currentLevel && level <= maxLevel;
  };

  const getEscalationLevels = () => {
    return Array.from({ length: maxLevel }, (_, i) => i + 1)
      .filter(level => canEscalateToLevel(level));
  };

  const getReasonForLevel = (level: number) => {
    return ESCALATION_REASONS.filter(reason => reason.level <= level);
  };

  if (!canEscalate) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Escalation Not Available
        </h3>
        <p className="text-gray-500">
          You don't have permission to escalate this dispute or it has reached the maximum level.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {Array.from({ length: maxLevel }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < currentLevel 
                      ? 'bg-green-500' 
                      : i === currentLevel 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              Level {currentLevel} of {maxLevel}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-700"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </Button>
        </div>
      </div>

      {/* Escalation History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">Escalation History</h4>
            </div>
            <div className="divide-y divide-gray-200">
              {escalationHistory.map((escalation, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Level {escalation.level} - {escalation.reason}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {escalation.escalatedBy} • {escalation.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      escalation.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : escalation.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {escalation.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escalation Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Escalate Dispute</h3>
        </div>

        <div className="space-y-4">
          {getEscalationLevels().map(level => (
            <div key={level} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Escalate to Level {level}</h4>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-500">
                    {level === 2 ? 'Senior Arbiters' : 'Expert Panel'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getReasonForLevel(level).map(reason => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedReason === reason.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <reason.icon className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{reason.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{reason.description}</p>
                  </button>
                ))}
              </div>

              {/* Custom Reason */}
              <div className="mt-3">
                <button
                  onClick={() => setSelectedReason('custom')}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    selectedReason === 'custom'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Custom Reason</span>
                  </div>
                  {selectedReason === 'custom' && (
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Describe the reason for escalation..."
                      className="w-full mt-2 p-2 border border-gray-300 rounded text-sm resize-none"
                      rows={3}
                    />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedReason('');
              setCustomReason('');
            }}
            disabled={isEscalating}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={!selectedReason || isEscalating}
            loading={isEscalating}
          >
            Escalate Dispute
          </Button>
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
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Escalation
                </h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to escalate this dispute to level {currentLevel + 1}? 
                This action cannot be undone and will involve higher-level arbiters.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Reason:</strong> {selectedReason === 'custom' ? customReason : 
                    ESCALATION_REASONS.find(r => r.id === selectedReason)?.label}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isEscalating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEscalation}
                  loading={isEscalating}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Confirm Escalation
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 