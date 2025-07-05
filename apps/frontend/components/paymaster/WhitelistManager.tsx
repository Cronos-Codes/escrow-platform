import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { sponsorService } from '@escrow/paymaster';
import { useToast } from '@escrow/ui';

interface WhitelistManagerProps {
  sponsorAddress: string;
  onClose: () => void;
  onWhitelistUpdated: (sponsorAddress: string, whitelistedUsers: string[]) => void;
}

const WhitelistUserSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  reason: z.string().optional(),
  trustScore: z.number().min(0).max(100).optional()
});

interface WhitelistEntry {
  userAddress: string;
  addedAt: number;
  addedBy: string;
  reason?: string;
  trustScore?: number;
  lastUsed?: number;
  totalGasUsed: string;
}

export const WhitelistManager: React.FC<WhitelistManagerProps> = ({
  sponsorAddress,
  onClose,
  onWhitelistUpdated
}) => {
  const { showToast } = useToast();
  const [whitelistedUsers, setWhitelistedUsers] = useState<string[]>([]);
  const [whitelistEntries, setWhitelistEntries] = useState<WhitelistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'active'>('all');

  const [formData, setFormData] = useState({
    userAddress: '',
    reason: '',
    trustScore: 50
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadWhitelistData();
  }, [sponsorAddress]);

  const loadWhitelistData = async () => {
    try {
      setIsLoading(true);
      const sponsorStatus = await sponsorService.getSponsorStatus(sponsorAddress);
      setWhitelistedUsers(sponsorStatus.whitelistedUsers);
      
      // Load whitelist entries (this would be implemented in the service)
      // For now, we'll create mock data
      const mockEntries: WhitelistEntry[] = sponsorStatus.whitelistedUsers.map((address, index) => ({
        userAddress: address,
        addedAt: Date.now() - (index * 24 * 60 * 60 * 1000), // Mock timestamps
        addedBy: 'admin',
        reason: `User ${index + 1}`,
        trustScore: Math.floor(Math.random() * 100),
        lastUsed: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
        totalGasUsed: (Math.random() * 0.1).toFixed(4)
      }));
      setWhitelistEntries(mockEntries);
    } catch (error) {
      console.error('Error loading whitelist data:', error);
      showToast('Error loading whitelist data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = WhitelistUserSchema.parse(formData);
      
      const updatedWhitelist = await sponsorService.whitelistUser(
        sponsorAddress,
        validatedData.userAddress,
        validatedData.reason,
        validatedData.trustScore
      );
      
      setWhitelistedUsers(updatedWhitelist);
      onWhitelistUpdated(sponsorAddress, updatedWhitelist);
      
      // Add to entries
      const newEntry: WhitelistEntry = {
        userAddress: validatedData.userAddress,
        addedAt: Date.now(),
        addedBy: 'current_user', // TODO: Get from auth
        reason: validatedData.reason,
        trustScore: validatedData.trustScore,
        totalGasUsed: '0'
      };
      setWhitelistEntries(prev => [newEntry, ...prev]);
      
      setShowAddForm(false);
      setFormData({ userAddress: '', reason: '', trustScore: 50 });
      setErrors({});
      
      showToast('User added to whitelist', 'success');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        showToast('Failed to add user to whitelist', 'error');
      }
    }
  };

  const handleRemoveUser = async (userAddress: string) => {
    try {
      const updatedWhitelist = await sponsorService.removeWhitelistedUser(
        sponsorAddress,
        userAddress
      );
      
      setWhitelistedUsers(updatedWhitelist);
      setWhitelistEntries(prev => prev.filter(entry => entry.userAddress !== userAddress));
      onWhitelistUpdated(sponsorAddress, updatedWhitelist);
      
      showToast('User removed from whitelist', 'success');
    } catch (error) {
      console.error('Error removing user:', error);
      showToast('Failed to remove user from whitelist', 'error');
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getTrustScoreLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'Low';
    return 'Very Low';
  };

  const filteredEntries = whitelistEntries.filter(entry => {
    const matchesSearch = entry.userAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.reason && entry.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    switch (filterBy) {
      case 'recent':
        return Date.now() - entry.addedAt < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      case 'active':
        return entry.lastUsed && Date.now() - entry.lastUsed < 30 * 24 * 60 * 60 * 1000; // Last 30 days
      default:
        return true;
    }
  });

  const getActivityStatus = (lastUsed?: number) => {
    if (!lastUsed) return { label: 'Never Used', color: 'text-gray-500' };
    
    const daysSince = Math.floor((Date.now() - lastUsed) / (24 * 60 * 60 * 1000));
    if (daysSince === 0) return { label: 'Today', color: 'text-green-600' };
    if (daysSince === 1) return { label: 'Yesterday', color: 'text-green-600' };
    if (daysSince < 7) return { label: `${daysSince} days ago`, color: 'text-yellow-600' };
    if (daysSince < 30) return { label: `${daysSince} days ago`, color: 'text-orange-600' };
    return { label: `${daysSince} days ago`, color: 'text-red-600' };
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Whitelist Manager</h2>
                <p className="text-gray-600 mt-1">Manage whitelisted users for sponsor</p>
                <p className="text-sm text-gray-500 font-mono mt-1">{sponsorAddress}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="recent">Recently Added</option>
                  <option value="active">Recently Active</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredEntries.map((entry, index) => (
                    <motion.div
                      key={entry.userAddress}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 font-mono text-sm">
                                {entry.userAddress}
                              </p>
                              <p className="text-sm text-gray-500">
                                Added {new Date(entry.addedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            {entry.reason && (
                              <span className="text-gray-600">Reason: {entry.reason}</span>
                            )}
                            
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrustScoreColor(entry.trustScore || 0)}`}>
                              Trust: {getTrustScoreLabel(entry.trustScore || 0)} ({entry.trustScore})
                            </span>
                            
                            <span className={`text-xs ${getActivityStatus(entry.lastUsed).color}`}>
                              {getActivityStatus(entry.lastUsed).label}
                            </span>
                            
                            <span className="text-gray-600">
                              Gas Used: {parseFloat(entry.totalGasUsed).toFixed(4)} ETH
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveUser(entry.userAddress)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from whitelist"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {filteredEntries.length} of {whitelistEntries.length} users
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
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
                  <h3 className="text-lg font-semibold text-gray-900">Add User to Whitelist</h3>
                </div>
                
                <form onSubmit={handleAddUser} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ethereum Address *
                    </label>
                    <input
                      type="text"
                      value={formData.userAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, userAddress: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                        errors.userAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0x..."
                    />
                    {errors.userAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.userAddress}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Why is this user being whitelisted?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trust Score: {formData.trustScore}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.trustScore}
                      onChange={(e) => setFormData(prev => ({ ...prev, trustScore: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Very Low</span>
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                      <span>Very High</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add User
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 