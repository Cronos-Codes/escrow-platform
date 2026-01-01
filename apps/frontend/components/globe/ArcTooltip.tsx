'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionData } from '../../types/transaction';

export interface ArcTooltipProps {
  transaction: TransactionData | null;
  position: { x: number; y: number };
  visible: boolean;
}

/**
 * Arc Tooltip Component
 * Displays transaction metadata on hover/tap
 */
export const ArcTooltip: React.FC<ArcTooltipProps> = ({
  transaction,
  position,
  visible,
}) => {
  if (!transaction || !visible) return null;

  const formatValue = (value: number | undefined): string => {
    const val = value || 0;
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}K`;
    }
    return `$${val.toFixed(0)}`;
  };

  const getStatusColor = (status: TransactionData['status'] | undefined): string => {
    switch (status) {
      case 'active':
        return '#D4AF37'; // Gold
      case 'completed':
        return '#10B981'; // Emerald
      case 'disputed':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusLabel = (status: TransactionData['status'] | undefined): string => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'disputed':
        return 'Disputed';
      default:
        return 'Unknown';
    }
  };

  return (
    <AnimatePresence>
      {visible && transaction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px',
          }}
        >
          <div className="bg-[#1C2A39]/95 backdrop-blur-md text-white p-4 rounded-lg shadow-2xl border border-gold/30 min-w-[280px] max-w-[320px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gold text-sm">Transaction Details</h4>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getStatusColor(transaction.status) }}
              />
            </div>

            {/* Route */}
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-white">{transaction.startCity || 'Unknown'}</span>
                <span className="text-gold/60">→</span>
                <span className="font-semibold text-white">{transaction.endCity || 'Unknown'}</span>
              </div>
            </div>

            {/* Value */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-1">Transaction Value</div>
              <div className="text-lg font-bold text-gold">
                {formatValue(transaction.valueUSD)}
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(transaction.status) }}
                />
                <span className="text-xs text-gray-300">
                  Status: <span className="font-semibold">{getStatusLabel(transaction.status)}</span>
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-gold/20">
              <p className="text-xs text-gold/80 italic">
                Secured by Gold Escrow
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div
            className="absolute left-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[#1C2A39]/95"
            style={{ transform: 'translateX(-50%)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

