import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEye, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock, 
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaShieldAlt
} from 'react-icons/fa';

interface Escrow {
  id: string;
  amount: number;
  status: 'pending' | 'locked' | 'released' | 'disputed';
  buyerLocation: { lat: number; lng: number };
  sellerLocation: { lat: number; lng: number };
  createdAt: Date;
  aiControlled: boolean;
  blockchainHash?: string;
  buyerName: string;
  sellerName: string;
}

interface AdminDashboardMockupProps {
  escrows: Escrow[];
}

const AdminDashboardMockup: React.FC<AdminDashboardMockupProps> = ({ escrows }) => {
  const [hoveredEscrow, setHoveredEscrow] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'disputes' | 'analytics'>('overview');

  const stats = {
    totalEscrows: escrows.length,
    activeEscrows: escrows.filter(e => e.status === 'locked').length,
    disputedEscrows: escrows.filter(e => e.status === 'disputed').length,
    totalValue: escrows.reduce((sum, e) => sum + e.amount, 0),
    aiControlled: escrows.filter(e => e.aiControlled).length,
    humanIntervention: escrows.filter(e => e.status === 'disputed').length,
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'locked': return 'text-blue-400 bg-blue-400/10';
      case 'released': return 'text-green-400 bg-green-400/10';
      case 'disputed': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return FaClock;
      case 'locked': return FaShieldAlt;
      case 'released': return FaCheckCircle;
      case 'disputed': return FaExclamationTriangle;
      default: return FaEye;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'disputes', label: 'Disputes', icon: FaExclamationTriangle },
    { id: 'analytics', label: 'Analytics', icon: FaUsers },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Dashboard Mockup */}
      <motion.div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Admin Dashboard</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-600">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'text-gold-400 border-b-2 border-gold-400 bg-gold-400/5'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                }`}
              >
                <IconComponent className="text-sm" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Escrows</p>
                      <p className="text-2xl font-bold text-white">{stats.totalEscrows}</p>
                    </div>
                    <FaDollarSign className="text-gold-400 text-xl" />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active</p>
                      <p className="text-2xl font-bold text-blue-400">{stats.activeEscrows}</p>
                    </div>
                    <FaShieldAlt className="text-blue-400 text-xl" />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">AI Controlled</p>
                      <p className="text-2xl font-bold text-purple-400">{stats.aiControlled}</p>
                    </div>
                    <FaUsers className="text-purple-400 text-xl" />
                  </div>
                </motion.div>

                <motion.div
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Disputes</p>
                      <p className="text-2xl font-bold text-red-400">{stats.disputedEscrows}</p>
                    </div>
                    <FaExclamationTriangle className="text-red-400 text-xl" />
                  </div>
                </motion.div>
              </div>

              {/* Recent Escrows */}
              <div>
                <h4 className="text-white font-semibold mb-3">Recent Escrows</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {escrows.slice(0, 5).map((escrow) => {
                    const StatusIcon = getStatusIcon(escrow.status);
                    return (
                      <motion.div
                        key={escrow.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          hoveredEscrow === escrow.id
                            ? 'border-gold-400 bg-gold-400/10'
                            : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                        }`}
                        onMouseEnter={() => setHoveredEscrow(escrow.id)}
                        onMouseLeave={() => setHoveredEscrow(null)}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`text-sm ${getStatusColor(escrow.status).split(' ')[0]}`} />
                            <div>
                              <p className="text-white text-sm font-medium">
                                {escrow.buyerName} → {escrow.sellerName}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {formatAmount(escrow.amount)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(escrow.status)}`}>
                              {escrow.status}
                            </p>
                            {escrow.aiControlled && (
                              <p className="text-xs text-purple-400 mt-1">🤖 AI</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'disputes' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <FaExclamationTriangle className="text-red-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-400">
                  {stats.disputedEscrows > 0 
                    ? `${stats.disputedEscrows} disputes require human intervention`
                    : 'No active disputes - AI handling everything smoothly'
                  }
                </p>
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <FaChartLine className="text-gold-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-400">Advanced analytics and reporting</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Globe Connection Visualization */}
      <motion.div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h3 className="text-lg font-bold text-white mb-6">Globe Integration</h3>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              {/* Mini Globe Representation */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-4 border-gold-400 relative overflow-hidden">
                {/* Arc Lines */}
                {escrows.slice(0, 3).map((escrow, index) => (
                  <motion.div
                    key={escrow.id}
                    className="absolute inset-0"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20 + index * 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div 
                      className="absolute top-1/2 left-1/2 w-1 h-16 bg-gradient-to-b from-gold-400 to-transparent transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        transformOrigin: 'center bottom',
                        transform: `rotate(${index * 120}deg) translateY(-50%)`
                      }}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Pulse Effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-gold-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
            
            <p className="text-gray-300 text-sm">
              Hover over dashboard items to highlight corresponding globe arcs
            </p>
          </div>

          {/* Connection Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-gray-300">Globe Connection</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-gray-300">Real-time Updates</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm">Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <span className="text-gray-300">AI Monitoring</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-400 text-sm">Online</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h4 className="text-white font-semibold mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Assign Arbitrator
              </motion.button>
              <motion.button
                className="p-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Force Release
              </motion.button>
              <motion.button
                className="p-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel Escrow
              </motion.button>
              <motion.button
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                AI Override
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboardMockup;
