import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@escrow/auth';
import { sponsorService, Sponsor } from '@escrow/paymaster';
import { SponsorForm } from './SponsorForm';
import { SponsorUsageChart } from './SponsorUsageChart';
import { WhitelistManager } from './WhitelistManager';
import { GasFallbackBanner } from './GasFallbackBanner';
import { EscrowOverridePanel } from './EscrowOverridePanel';
import { ForceTransferDialog } from './ForceTransferDialog';
import { useToast } from '@escrow/ui';

interface SponsorDashboardProps {
  className?: string;
}

export const SponsorDashboard: React.FC<SponsorDashboardProps> = ({ className = '' }) => {
  const { user, hasRole } = useAuth();
  const { showToast } = useToast();
  
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [showForceTransferDialog, setShowForceTransferDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const isAdmin = hasRole('admin');
  const isOperator = hasRole('operator');

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      
      if (filterActive !== null) {
        filters.isActive = filterActive;
      }

      const allSponsors = await sponsorService.getAllSponsors(filters);
      setSponsors(allSponsors);
    } catch (error) {
      console.error('Error loading sponsors:', error);
      showToast('Error loading sponsors', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSponsorCreated = async (newSponsor: Sponsor) => {
    setSponsors(prev => [...prev, newSponsor]);
    setShowSponsorForm(false);
    showToast('Sponsor created successfully', 'success');
  };

  const handleSponsorRemoved = async (sponsorAddress: string) => {
    setSponsors(prev => prev.filter(s => s.address !== sponsorAddress));
    if (selectedSponsor?.address === sponsorAddress) {
      setSelectedSponsor(null);
    }
    showToast('Sponsor removed successfully', 'success');
  };

  const handleWhitelistUpdated = async (sponsorAddress: string, whitelistedUsers: string[]) => {
    setSponsors(prev => prev.map(s => 
      s.address === sponsorAddress 
        ? { ...s, whitelistedUsers }
        : s
    ));
    
    if (selectedSponsor?.address === sponsorAddress) {
      setSelectedSponsor(prev => prev ? { ...prev, whitelistedUsers } : null);
    }
  };

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sponsor.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === null || sponsor.isActive === filterActive;
    return matchesSearch && matchesFilter;
  });

  const totalBalance = sponsors.reduce((sum, s) => sum + parseFloat(s.balance), 0);
  const totalSpent = sponsors.reduce((sum, s) => sum + parseFloat(s.totalSpent), 0);
  const activeSponsors = sponsors.filter(s => s.isActive).length;
  const totalWhitelistedUsers = sponsors.reduce((sum, s) => sum + s.whitelistedUsers.length, 0);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${className}`}>
      {/* Hero Section with Parallax */}
      <motion.div 
        className="relative h-64 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 transform -skew-y-6 origin-top-left"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-indigo-600/20 to-pink-600/20 transform skew-y-6 origin-bottom-right"></div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <motion.h1 
              className="text-5xl font-bold mb-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Paymaster Dashboard
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Manage gas sponsorship and user whitelisting
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500/20">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Balance</p>
                <p className="text-2xl font-bold text-white">{totalBalance.toFixed(4)} ETH</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500/20">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Spent</p>
                <p className="text-2xl font-bold text-white">{totalSpent.toFixed(4)} ETH</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500/20">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Active Sponsors</p>
                <p className="text-2xl font-bold text-white">{activeSponsors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Whitelisted Users</p>
                <p className="text-2xl font-bold text-white">{totalWhitelistedUsers}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sponsors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterActive === null ? 'all' : filterActive.toString()}
              onChange={(e) => setFilterActive(e.target.value === 'all' ? null : e.target.value === 'true')}
              className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sponsors</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {isAdmin && (
            <motion.button
              onClick={() => setShowSponsorForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Sponsor
            </motion.button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sponsors List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-semibold text-white">Sponsors</h2>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-4">Loading sponsors...</p>
                </div>
              ) : filteredSponsors.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400">No sponsors found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  <AnimatePresence>
                    {filteredSponsors.map((sponsor, index) => (
                      <motion.div
                        key={sponsor.address}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                          selectedSponsor?.address === sponsor.address ? 'bg-white/10' : ''
                        }`}
                        onClick={() => setSelectedSponsor(sponsor)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${sponsor.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                              <h3 className="text-lg font-medium text-white">{sponsor.name}</h3>
                              <p className="text-sm text-gray-400 font-mono">{sponsor.address}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-white">{parseFloat(sponsor.balance).toFixed(4)} ETH</p>
                            <p className="text-sm text-gray-400">{sponsor.whitelistedUsers.length} users</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Selected Sponsor Details */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedSponsor ? (
                <motion.div
                  key={selectedSponsor.address}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">{selectedSponsor.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSponsor.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedSponsor.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-sm text-white font-mono break-all">{selectedSponsor.address}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Balance</p>
                      <p className="text-lg font-semibold text-white">{parseFloat(selectedSponsor.balance).toFixed(4)} ETH</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Total Spent</p>
                      <p className="text-lg font-semibold text-white">{parseFloat(selectedSponsor.totalSpent).toFixed(4)} ETH</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Daily Limit</p>
                      <p className="text-lg font-semibold text-white">{parseFloat(selectedSponsor.maxDailySpend).toFixed(4)} ETH</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Whitelisted Users</p>
                      <p className="text-lg font-semibold text-white">{selectedSponsor.whitelistedUsers.length}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(isAdmin || isOperator) && (
                      <button
                        onClick={() => {/* TODO: Open whitelist manager */}}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Manage Whitelist
                      </button>
                    )}
                    
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setShowForceTransferDialog(true)}
                          className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          Force Transfer
                        </button>
                        
                        <button
                          onClick={() => handleSponsorRemoved(selectedSponsor.address)}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Remove Sponsor
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 text-center"
                >
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400">Select a sponsor to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Usage Chart */}
        {selectedSponsor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Usage Analytics</h3>
            <SponsorUsageChart sponsorAddress={selectedSponsor.address} />
          </motion.div>
        )}

        {/* Admin Panels */}
        {isAdmin && (
          <>
            <EscrowOverridePanel className="mt-8" />
            <GasFallbackBanner className="mt-4" />
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSponsorForm && (
          <SponsorForm
            onClose={() => setShowSponsorForm(false)}
            onSuccess={handleSponsorCreated}
          />
        )}
        
        {showForceTransferDialog && selectedSponsor && (
          <ForceTransferDialog
            sponsor={selectedSponsor}
            onClose={() => setShowForceTransferDialog(false)}
            onSuccess={() => {
              setShowForceTransferDialog(false);
              loadSponsors();
              showToast('Force transfer completed', 'success');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 