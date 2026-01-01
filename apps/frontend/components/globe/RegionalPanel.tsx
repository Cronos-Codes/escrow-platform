'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RegionalStats } from '../../types/city';

export interface RegionalPanelProps {
  stats: RegionalStats | null;
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

/**
 * Regional Panel Component
 * Displays regional statistics overlay
 */
export const RegionalPanel: React.FC<RegionalPanelProps> = ({
  stats,
  visible,
  position,
  onClose,
}) => {
  if (!stats) return null;

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <AnimatePresence>
      {visible && stats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="fixed z-50 bg-[#1C2A39]/95 backdrop-blur-md text-white p-6 rounded-lg shadow-2xl border border-gold/30 min-w-[320px] max-w-[400px]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gold text-lg">{stats.region}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Cities</span>
              <span className="font-semibold text-white">{stats.totalCities}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Active Cities</span>
              <span className="font-semibold text-green-400">{stats.activeCities}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Transactions</span>
              <span className="font-semibold text-white">{stats.totalTransactions.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Value</span>
              <span className="font-semibold text-gold">{formatValue(stats.totalValueUSD)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Avg Transaction</span>
              <span className="font-semibold text-white">{formatValue(stats.averageTransactionValue)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gold/20">
              <span className="text-gray-300">Activity Rate</span>
              <span className="font-semibold text-blue-400">
                {stats.transactionVelocity} /hr
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

