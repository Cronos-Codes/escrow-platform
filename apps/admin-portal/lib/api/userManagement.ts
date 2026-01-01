import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase';

// Initialize functions with error handling for development
let functions;
try {
  functions = getFunctions(app);
} catch (error) {
  console.warn('Firebase Functions not available in development mode');
  functions = null;
}

// Enhanced user data interface
export interface EnhancedUserData {
  // Basic Information
  id: string;
  email: string;
  name: string;
  phone: string;
  country: string;
  role: string;
  status: 'active' | 'suspended' | 'inactive' | 'pending';
  
  // Security & Compliance
  kycLevel: 'verified' | 'pending' | 'unverified';
  kycStatus: 'approved' | 'under_review' | 'rejected';
  complianceStatus: 'compliant' | 'pending' | 'violation' | 'non_compliant';
  riskScore: number;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Financial & Trading
  tradingLimits: {
    daily: number;
    monthly: number;
    singleTransaction: number;
  };
  paymentMethods: {
    bankAccounts: Array<{
      id: string;
      accountNumber: string;
      bankName: string;
      verified: boolean;
    }>;
    cryptoWallets: Array<{
      id: string;
      address: string;
      network: string;
      verified: boolean;
    }>;
  };
  
  // Gold-Specific
  goldHoldings: {
    totalWeight: number; // in grams
    purity: number; // percentage
    storageLocation: string;
    insuranceStatus: 'insured' | 'uninsured' | 'pending';
    lastValuation: number;
    valuationDate: number;
  };
  
  // Activity & Analytics
  escrowHistory: {
    total: number;
    successful: number;
    failed: number;
    totalVolume: number;
    averageTransactionSize: number;
  };
  disputeHistory: {
    initiated: number;
    involved: number;
    resolved: number;
    won: number;
    lost: number;
  };
  
  // Security & Monitoring
  securitySettings: {
    ipWhitelist: string[];
    geographicRestrictions: string[];
    deviceManagement: {
      authorizedDevices: Array<{
        deviceId: string;
        deviceInfo: string;
        lastUsed: number;
        trusted: boolean;
      }>;
    };
    sessionManagement: {
      activeSessions: Array<{
        sessionId: string;
        deviceInfo: string;
        ipAddress: string;
        lastActivity: number;
      }>;
    };
  };
  
  // Administrative
  flags: string[];
  restrictions: string[];
  notes: string;
  adminNotes: string;
  auditTrail: Array<{
    action: string;
    adminId: string;
    timestamp: number;
    reason: string;
    metadata: any;
  }>;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  lastLogin: number;
  lastActivity: number;
}

export interface TradingLimits {
  daily: number;
  monthly: number;
  singleTransaction: number;
}

export interface SecuritySettings {
  ipWhitelist: string[];
  geographicRestrictions: string[];
  deviceManagement: {
    authorizedDevices: Array<{
      deviceId: string;
      deviceInfo: string;
      lastUsed: number;
      trusted: boolean;
    }>;
  };
  sessionManagement: {
    activeSessions: Array<{
      sessionId: string;
      deviceInfo: string;
      ipAddress: string;
      lastActivity: number;
    }>;
  };
}

export interface GoldHoldings {
  totalWeight: number;
  purity: number;
  storageLocation: string;
  insuranceStatus: 'insured' | 'uninsured' | 'pending';
  lastValuation: number;
  valuationDate: number;
}

export interface ComplianceData {
  kycLevel: 'verified' | 'pending' | 'unverified';
  kycStatus: 'approved' | 'under_review' | 'rejected';
  complianceStatus: 'compliant' | 'pending' | 'violation' | 'non_compliant';
  riskScore: number;
}

export interface UserAnalytics {
  escrowAnalytics: {
    total: number;
    successful: number;
    failed: number;
    totalVolume: number;
    averageTransactionSize: number;
  };
  disputeAnalytics: {
    initiated: number;
    involved: number;
    resolved: number;
    won: number;
    lost: number;
  };
  securityAnalytics: {
    totalLogins: number;
    failedLogins: number;
    uniqueIPs: number;
    uniqueDevices: number;
  };
  activityAnalytics: {
    totalActions: number;
    actionTypes: Record<string, number>;
    peakActivityTime: Record<number, number>;
  };
}

export interface BulkOperationResult {
  userId: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface BulkOperationResponse {
  message: string;
  results: BulkOperationResult[];
  successCount: number;
  failureCount: number;
}

// API Functions
export const userManagementAPI = {
  // Get comprehensive user management data
  getUserManagementData: async (userId: string, includeDetails: boolean = false) => {
    if (!functions) {
      console.warn('Firebase Functions not available - returning mock data');
      return { user: {} as EnhancedUserData };
    }
    const getUserManagementData = httpsCallable(functions, 'getUserManagementData');
    const result = await getUserManagementData({ userId, includeDetails });
    return result.data as { user: EnhancedUserData; escrowHistory?: any[]; disputeHistory?: any[]; securityLogs?: any[] };
  },

  // Update user trading limits
  updateUserTradingLimits: async (userId: string, tradingLimits: TradingLimits, reason: string) => {
    if (!functions) {
      console.warn('Firebase Functions not available - returning mock response');
      return { message: 'Mock: Trading limits updated successfully' };
    }
    const updateUserTradingLimits = httpsCallable(functions, 'updateUserTradingLimits');
    const result = await updateUserTradingLimits({ userId, tradingLimits, reason });
    return result.data as { message: string };
  },

  // Update user security settings
  updateUserSecuritySettings: async (userId: string, securitySettings: SecuritySettings, reason: string) => {
    if (!functions) {
      console.warn('Firebase Functions not available - returning mock response');
      return { message: 'Mock: Security settings updated successfully' };
    }
    const updateUserSecuritySettings = httpsCallable(functions, 'updateUserSecuritySettings');
    const result = await updateUserSecuritySettings({ userId, securitySettings, reason });
    return result.data as { message: string };
  },

  // Update user gold holdings
  updateUserGoldHoldings: async (userId: string, goldHoldings: GoldHoldings, reason: string) => {
    if (!functions) {
      console.warn('Firebase Functions not available - returning mock response');
      return { message: 'Mock: Gold holdings updated successfully' };
    }
    const updateUserGoldHoldings = httpsCallable(functions, 'updateUserGoldHoldings');
    const result = await updateUserGoldHoldings({ userId, goldHoldings, reason });
    return result.data as { message: string };
  },

  // Bulk user operations
  bulkUserOperations: async (
    userIds: string[], 
    operation: 'suspend' | 'activate' | 'update_role' | 'update_kyc' | 'update_trading_limits',
    reason: string,
    parameters?: any
  ) => {
    if (!functions) {
      console.warn('Firebase Functions not available - returning mock response');
      return { 
        success: true, 
        message: `Mock: Bulk operation ${operation} completed successfully`,
        results: userIds.map(id => ({ userId: id, success: true, message: 'Mock operation completed', status: 'success' })),
        successCount: userIds.length,
        failureCount: 0
      } as BulkOperationResponse;
    }
    const bulkUserOperations = httpsCallable(functions, 'bulkUserOperations');
    const result = await bulkUserOperations({ userIds, operation, parameters, reason });
    return result.data as BulkOperationResponse;
  },

  // Get user analytics
  getUserAnalytics: async (userId: string, timeRange: '7d' | '30d' | '90d' = '30d') => {
    if (!functions) {
      console.warn('Firebase Functions not available - returning mock analytics');
      return {} as UserAnalytics;
    }
    const getUserAnalytics = httpsCallable(functions, 'getUserAnalytics');
    const result = await getUserAnalytics({ userId, timeRange });
    return result.data as UserAnalytics;
  },

  // Force user logout
  forceUserLogout: async (userId: string, reason: string) => {
    if (!functions) {
      console.warn('Firebase Functions not available - returning mock response');
      return { message: 'Mock: User logged out successfully' };
    }
    const forceUserLogout = httpsCallable(functions, 'forceUserLogout');
    const result = await forceUserLogout({ userId, reason });
    return result.data as { message: string };
  },

  // Update user compliance
  updateUserCompliance: async (userId: string, complianceData: ComplianceData, reason: string) => {
    if (!functions) {
      console.warn('Firebase Functions not available - returning mock response');
      return { message: 'Mock: Compliance updated successfully' };
    }
    const updateUserCompliance = httpsCallable(functions, 'updateUserCompliance');
    const result = await updateUserCompliance({ userId, complianceData, reason });
    return result.data as { message: string };
  },

  // Promote user (existing function)
  promoteUser: async (userId: string, newRole: string, reason: string) => {
    if (!functions) {
      console.warn('Firebase Functions not available - returning mock response');
      return { message: 'Mock: User promoted successfully' };
    }
    const promoteUser = httpsCallable(functions, 'promoteUser');
    const result = await promoteUser({ userId, newRole, reason });
    return result.data as { message: string };
  },
};

// Utility functions
export const userManagementUtils = {
  // Calculate risk level based on risk score
  getRiskLevel: (riskScore: number): 'Low' | 'Medium' | 'High' => {
    if (riskScore <= 20) return 'Low';
    if (riskScore <= 50) return 'Medium';
    return 'High';
  },

  // Get risk color for UI
  getRiskColor: (riskScore: number): 'success' | 'warning' | 'error' => {
    if (riskScore <= 20) return 'success';
    if (riskScore <= 50) return 'warning';
    return 'error';
  },

  // Format currency
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  // Format gold weight
  formatGoldWeight: (weightInGrams: number): string => {
    if (weightInGrams >= 1000) {
      return `${(weightInGrams / 1000).toFixed(2)} kg`;
    }
    return `${weightInGrams.toFixed(2)} g`;
  },

  // Format date
  formatDate: (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Get time ago
  getTimeAgo: (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  },

  // Validate trading limits
  validateTradingLimits: (limits: TradingLimits): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (limits.daily < 0) errors.push('Daily limit cannot be negative');
    if (limits.monthly < 0) errors.push('Monthly limit cannot be negative');
    if (limits.singleTransaction < 0) errors.push('Single transaction limit cannot be negative');
    if (limits.singleTransaction > limits.daily) errors.push('Single transaction limit cannot exceed daily limit');
    if (limits.daily > limits.monthly) errors.push('Daily limit cannot exceed monthly limit');
    
    return { valid: errors.length === 0, errors };
  },

  // Validate gold holdings
  validateGoldHoldings: (holdings: GoldHoldings): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (holdings.totalWeight < 0) errors.push('Total weight cannot be negative');
    if (holdings.purity < 0 || holdings.purity > 100) errors.push('Purity must be between 0 and 100');
    if (!holdings.storageLocation) errors.push('Storage location is required');
    
    return { valid: errors.length === 0, errors };
  },

  // Get user status color
  getStatusColor: (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'inactive': return 'warning';
      default: return 'default';
    }
  },

  // Get role color
  getRoleColor: (role: string): 'error' | 'warning' | 'info' | 'primary' | 'secondary' | 'success' | 'default' => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'OPERATOR': return 'warning';
      case 'ARBITER': return 'info';
      case 'BUYER': return 'primary';
      case 'SELLER': return 'secondary';
      case 'BROKER': return 'success';
      default: return 'default';
    }
  },

  // Get KYC color
  getKycColor: (kycLevel: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (kycLevel) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'unverified': return 'error';
      default: return 'default';
    }
  },
};

export default userManagementAPI;
