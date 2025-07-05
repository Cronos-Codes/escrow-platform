import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { DashboardShell } from '../../components/DashboardShell';
import { DataTable } from '../../components/dashboard/DataTable';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  lastActive: number;
  dealCount: number;
  totalValue: number;
}

interface Escrow {
  id: string;
  title: string;
  amount: string;
  status: string;
  buyer: string;
  seller: string;
  createdAt: number;
}

interface AdminAction {
  id: string;
  type: 'promote' | 'revoke' | 'suspend' | 'move_funds' | 'pause_contract';
  target: string;
  reason: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export default function AdminPanel() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedEscrows, setSelectedEscrows] = useState<string[]>([]);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  // Mock data
  const users: User[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'buyer', status: 'active', lastActive: Date.now(), dealCount: 15, totalValue: 450000 },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'seller', status: 'active', lastActive: Date.now() - 3600000, dealCount: 23, totalValue: 780000 },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'broker', status: 'suspended', lastActive: Date.now() - 86400000, dealCount: 8, totalValue: 120000 },
    { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'buyer', status: 'pending', lastActive: Date.now() - 1800000, dealCount: 12, totalValue: 320000 },
  ];

  const escrows: Escrow[] = [
    { id: '1', title: 'Real Estate Transaction', amount: '$125,000', status: 'funded', buyer: 'Alice', seller: 'Bob', createdAt: Date.now() - 3600000 },
    { id: '2', title: 'Precious Metals Deal', amount: '$75,000', status: 'released', buyer: 'Charlie', seller: 'Diana', createdAt: Date.now() - 7200000 },
    { id: '3', title: 'Oil & Gas Contract', amount: '$250,000', status: 'disputed', buyer: 'Eve', seller: 'Frank', createdAt: Date.now() - 8640000 },
  ];

  const adminActions: AdminAction[] = [
    { id: '1', type: 'promote', target: 'Alice Johnson', reason: 'Promoted to broker', timestamp: Date.now() - 3600000, status: 'completed' },
    { id: '2', type: 'suspend', target: 'Charlie Brown', reason: 'Suspicious activity', timestamp: Date.now() - 7200000, status: 'completed' },
    { id: '3', type: 'revoke', target: 'Escrow #123', reason: 'Contract violation', timestamp: Date.now() - 8640000, status: 'pending' },
  ];

  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'active' ? 'bg-green-100 text-green-800' :
        value === 'suspended' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'dealCount', label: 'Deals', sortable: true },
    { key: 'totalValue', label: 'Total Value', sortable: true, render: (value: number) => `$${value.toLocaleString()}` },
  ];

  const escrowColumns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'buyer', label: 'Buyer', sortable: true },
    { key: 'seller', label: 'Seller', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true, render: (value: number) => new Date(value).toLocaleDateString() },
  ];

  const actionColumns = [
    { key: 'type', label: 'Action', sortable: true, render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'promote' ? 'bg-blue-100 text-blue-800' :
        value === 'suspend' ? 'bg-red-100 text-red-800' :
        value === 'revoke' ? 'bg-orange-100 text-orange-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'target', label: 'Target', sortable: true },
    { key: 'reason', label: 'Reason', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'completed' ? 'bg-green-100 text-green-800' :
        value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'timestamp', label: 'Timestamp', sortable: true, render: (value: number) => new Date(value).toLocaleString() },
  ];

  const handlePromoteUser = (userId: string, newRole: string) => {
    console.log(`Promoting user ${userId} to ${newRole}`);
    // TODO: Implement API call
  };

  const handleRevokeEscrow = (escrowId: string, reason: string) => {
    console.log(`Revoking escrow ${escrowId} with reason: ${reason}`);
    // TODO: Implement API call
    setShowRevokeModal(false);
  };

  const handleMoveFunds = (escrowId: string, targetAddress: string) => {
    console.log(`Moving funds from escrow ${escrowId} to ${targetAddress}`);
    // TODO: Implement API call
    setShowFundsModal(false);
  };

  const handleSuspendUser = (userId: string, reason: string, duration: number) => {
    console.log(`Suspending user ${userId} for ${duration} days with reason: ${reason}`);
    // TODO: Implement API call
    setShowSuspendModal(false);
  };

  return (
    <DashboardShell user={{ id: '1', email: 'admin@example.com', role: 'admin' }} role="admin">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage users, escrows, and platform settings</p>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setShowRevokeModal(true)}
        >
          <div className="text-2xl mb-2">🚫</div>
          <div className="font-semibold">Revoke Escrow</div>
          <div className="text-sm opacity-90">Cancel active deals</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          onClick={() => setShowFundsModal(true)}
        >
          <div className="text-2xl mb-2">💰</div>
          <div className="font-semibold">Move Funds</div>
          <div className="text-sm opacity-90">Redirect escrow funds</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          onClick={() => setShowSuspendModal(true)}
        >
          <div className="text-2xl mb-2">⏸️</div>
          <div className="font-semibold">Suspend User</div>
          <div className="text-sm opacity-90">Temporarily ban users</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <div className="font-semibold">System Settings</div>
          <div className="text-sm opacity-90">Platform configuration</div>
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'escrows', label: 'Escrows', icon: '🤝' },
              { id: 'actions', label: 'Actions', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <DataTable
              data={users}
              columns={userColumns}
              title="User Management"
              searchable
              sortable
              filterable
              exportable
              pagination
              onSelectionChange={(selected) => setSelectedUsers(selected.map(u => u.id))}
            />
            
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-50 rounded-lg"
              >
                <h3 className="font-semibold mb-2">Bulk Actions for {selectedUsers.length} selected users:</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Promote to Broker
                  </button>
                  <button className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                    Suspend
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                    Ban
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'escrows' && (
          <motion.div
            key="escrows"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <DataTable
              data={escrows}
              columns={escrowColumns}
              title="Escrow Management"
              searchable
              sortable
              filterable
              exportable
              pagination
              onSelectionChange={(selected) => setSelectedEscrows(selected.map(e => e.id))}
            />
            
            {selectedEscrows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-orange-50 rounded-lg"
              >
                <h3 className="font-semibold mb-2">Bulk Actions for {selectedEscrows.length} selected escrows:</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700">
                    Pause
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                    Revoke
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                    Release
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'actions' && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <DataTable
              data={adminActions}
              columns={actionColumns}
              title="Admin Actions Log"
              searchable
              sortable
              filterable
              exportable
              pagination
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showRevokeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowRevokeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Revoke Escrow</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Escrow ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter escrow ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Enter reason for revocation"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowRevokeModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRevokeEscrow('123', 'Contract violation')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showFundsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowFundsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Move Funds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Escrow ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter escrow ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0x..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFundsModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleMoveFunds('123', '0x...')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Move Funds
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSuspendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSuspendModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Suspend User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter user ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (days)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Enter reason for suspension"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSuspendModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSuspendUser('123', 'Violation of terms', 30)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
} 