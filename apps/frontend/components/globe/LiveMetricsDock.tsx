'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CityData, RegionalStats } from '../../types/city';
import { TransactionData } from '../../types/transaction';

export interface LiveMetricsDockProps {
  cities: CityData[];
  transactions: TransactionData[];
  regionalStats: RegionalStats[];
  className?: string;
}

/**
 * Live Metrics Dock Component
 * Displays real-time global escrow metrics
 */
export const LiveMetricsDock: React.FC<LiveMetricsDockProps> = ({
  cities,
  transactions,
  regionalStats,
  className = '',
}) => {
  // Calculate live metrics
  const metrics = useMemo(() => {
    const totalValue = cities.reduce((sum, city) => sum + city.totalValueUSD, 0);
    const totalTransactions = cities.reduce((sum, city) => sum + city.transactionCount, 0);
    const activeCities = cities.filter((city) => city.active).length;
    
    // Calculate transaction velocity (transactions per minute)
    const now = Date.now();
    const recentTransactions = transactions.filter(
      (tx) => now - tx.timestamp < 60000
    ).length;
    const transactionVelocity = recentTransactions;

    // Top 5 active cities
    const topCities = [...cities]
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 5);

    return {
      totalValue,
      totalTransactions,
      activeCities,
      transactionVelocity,
      topCities,
    };
  }, [cities, transactions]);

  const formatValue = (value: number): string => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#1C2A39]/95 backdrop-blur-md border border-gold/30 rounded-lg p-4 shadow-2xl ${className}`}
    >
      <h3 className="text-gold font-bold text-sm mb-4">Live Global Metrics</h3>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="text-xs text-gray-400">Total Escrowed</div>
          <div className="text-lg font-bold text-gold">{formatValue(metrics.totalValue)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Total Transactions</div>
          <div className="text-lg font-bold text-white">{metrics.totalTransactions.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Active Cities</div>
          <div className="text-lg font-bold text-green-400">{metrics.activeCities}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Activity Rate</div>
          <div className="text-lg font-bold text-blue-400">{metrics.transactionVelocity}/min</div>
        </div>
      </div>

      {/* Top Active Cities */}
      <div className="border-t border-gold/20 pt-3">
        <div className="text-xs text-gray-400 mb-2">Top Active Cities</div>
        <div className="space-y-1">
          {metrics.topCities.map((city, index) => (
            <div key={city.id} className="flex items-center justify-between text-xs">
              <span className="text-white">
                {index + 1}. {city.city}
              </span>
              <span className="text-gold font-semibold">
                {city.transactionCount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

