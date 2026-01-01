import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { auth } from 'firebase-admin';

// Initialize Firebase Admin
if (!firestore.apps.length) {
  initializeApp();
}

const db = firestore();

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

const createResponse = <T>(success: boolean, data?: T, error?: string): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

// Helper function to log admin actions
const logAdminAction = async (
  adminId: string,
  actionType: string,
  target: string,
  reason: string,
  metadata?: any
) => {
  const action = {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    adminId,
    actionType,
    target,
    reason,
    metadata,
    timestamp: Date.now(),
    status: 'completed',
  };

  await db.collection('admin_actions').doc(action.id).set(action);
  return action;
};

// Helper function to check admin permissions
const checkAdminPermissions = async (context: any): Promise<boolean> => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  return userData?.role === 'admin';
};

export const promoteUser = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Check admin permissions
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userId, newRole, reason } = data;

    if (!userId || !newRole || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Validate role
    const validRoles = ['buyer', 'seller', 'broker', 'sponsor', 'arbiter'];
    if (!validRoles.includes(newRole)) {
      return createResponse(false, undefined, 'Invalid role');
    }

    // Update user role
    await db.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: Date.now(),
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'promote', userId, reason, { newRole });

    const responseTime = Date.now() - startTime;
    console.log(`promoteUser completed in ${responseTime}ms`);

    return createResponse(true, { message: 'User promoted successfully' });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`promoteUser failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const revokeEscrow = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Check admin permissions
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { escrowId, reason } = data;

    if (!escrowId || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Get escrow data
    const escrowDoc = await db.collection('escrows').doc(escrowId).get();
    if (!escrowDoc.exists) {
      return createResponse(false, undefined, 'Escrow not found');
    }

    const escrowData = escrowDoc.data();
    if (escrowData?.status === 'released' || escrowData?.status === 'resolved') {
      return createResponse(false, undefined, 'Cannot revoke completed escrow');
    }

    // Update escrow status
    await db.collection('escrows').doc(escrowId).update({
      status: 'revoked',
      revokedAt: Date.now(),
      revokedBy: context.auth.uid,
      revocationReason: reason,
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'revoke_escrow', escrowId, reason, {
      previousStatus: escrowData?.status,
      amount: escrowData?.amount,
    });

    const responseTime = Date.now() - startTime;
    console.log(`revokeEscrow completed in ${responseTime}ms`);

    return createResponse(true, { message: 'Escrow revoked successfully' });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`revokeEscrow failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

// ==================== COMPREHENSIVE USER MANAGEMENT FUNCTIONS ====================

// Enhanced user data interface
interface EnhancedUserData {
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

// ==================== USER MANAGEMENT FUNCTIONS ====================

export const getUserManagementData = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userId, includeDetails = false } = data;

    if (!userId) {
      return createResponse(false, undefined, 'User ID required');
    }

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return createResponse(false, undefined, 'User not found');
    }

    const userData = userDoc.data() as EnhancedUserData;
    
    // Get additional data if requested
    let additionalData = {};
    if (includeDetails) {
      const [escrowHistory, disputeHistory, securityLogs] = await Promise.all([
        db.collection('escrows').where('userId', '==', userId).get(),
        db.collection('disputes').where('userId', '==', userId).get(),
        db.collection('security_logs').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(50).get()
      ]);

      additionalData = {
        escrowHistory: escrowHistory.docs.map(doc => doc.data()),
        disputeHistory: disputeHistory.docs.map(doc => doc.data()),
        securityLogs: securityLogs.docs.map(doc => doc.data())
      };
    }

    const responseTime = Date.now() - startTime;
    console.log(`getUserManagementData completed in ${responseTime}ms`);

    return createResponse(true, { user: userData, ...additionalData });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getUserManagementData failed in ${responseTime}ms:`, error);
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const updateUserTradingLimits = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userId, tradingLimits, reason } = data;

    if (!userId || !tradingLimits || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Validate trading limits
    if (tradingLimits.daily < 0 || tradingLimits.monthly < 0 || tradingLimits.singleTransaction < 0) {
      return createResponse(false, undefined, 'Invalid trading limits');
    }

    // Update user trading limits
    await db.collection('users').doc(userId).update({
      'tradingLimits': tradingLimits,
      updatedAt: Date.now(),
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'update_trading_limits', userId, reason, { tradingLimits });

    const responseTime = Date.now() - startTime;
    console.log(`updateUserTradingLimits completed in ${responseTime}ms`);

    return createResponse(true, { message: 'Trading limits updated successfully' });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`updateUserTradingLimits failed in ${responseTime}ms:`, error);
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const updateUserSecuritySettings = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userId, securitySettings, reason } = data;

    if (!userId || !securitySettings || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Update user security settings
    await db.collection('users').doc(userId).update({
      'securitySettings': securitySettings,
      updatedAt: Date.now(),
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'update_security_settings', userId, reason, { securitySettings });

    const responseTime = Date.now() - startTime;
    console.log(`updateUserSecuritySettings completed in ${responseTime}ms`);

    return createResponse(true, { message: 'Security settings updated successfully' });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`updateUserSecuritySettings failed in ${responseTime}ms:`, error);
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const updateUserGoldHoldings = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userId, goldHoldings, reason } = data;

    if (!userId || !goldHoldings || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Validate gold holdings data
    if (goldHoldings.totalWeight < 0 || goldHoldings.purity < 0 || goldHoldings.purity > 100) {
      return createResponse(false, undefined, 'Invalid gold holdings data');
    }

    // Update user gold holdings
    await db.collection('users').doc(userId).update({
      'goldHoldings': {
        ...goldHoldings,
        lastValuation: goldHoldings.totalWeight * 65, // Approximate gold price per gram
        valuationDate: Date.now(),
      },
      updatedAt: Date.now(),
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'update_gold_holdings', userId, reason, { goldHoldings });

    const responseTime = Date.now() - startTime;
    console.log(`updateUserGoldHoldings completed in ${responseTime}ms`);

    return createResponse(true, { message: 'Gold holdings updated successfully' });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`updateUserGoldHoldings failed in ${responseTime}ms:`, error);
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const bulkUserOperations = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userIds, operation, parameters, reason } = data;

    if (!userIds || !Array.isArray(userIds) || !operation || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    const batch = db.batch();
    const results = [];

    for (const userId of userIds) {
      try {
        const userRef = db.collection('users').doc(userId);
        
        switch (operation) {
          case 'suspend':
            batch.update(userRef, { status: 'suspended', updatedAt: Date.now() });
            break;
          case 'activate':
            batch.update(userRef, { status: 'active', updatedAt: Date.now() });
            break;
          case 'update_role':
            if (!parameters?.role) throw new Error('Role parameter required');
            batch.update(userRef, { role: parameters.role, updatedAt: Date.now() });
            break;
          case 'update_kyc':
            if (!parameters?.kycLevel) throw new Error('KYC level parameter required');
            batch.update(userRef, { kycLevel: parameters.kycLevel, updatedAt: Date.now() });
            break;
          case 'update_trading_limits':
            if (!parameters?.tradingLimits) throw new Error('Trading limits parameter required');
            batch.update(userRef, { tradingLimits: parameters.tradingLimits, updatedAt: Date.now() });
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
        
        results.push({ userId, status: 'success' });
      } catch (error) {
        results.push({ userId, status: 'failed', error: error.message });
      }
    }

    await batch.commit();

    // Log bulk admin action
    await logAdminAction(context.auth.uid, `bulk_${operation}`, 'multiple_users', reason, { 
      userIds, 
      operation, 
      parameters,
      results 
    });

    const responseTime = Date.now() - startTime;
    console.log(`bulkUserOperations completed in ${responseTime}ms`);

    return createResponse(true, { 
      message: 'Bulk operation completed', 
      results,
      successCount: results.filter(r => r.status === 'success').length,
      failureCount: results.filter(r => r.status === 'failed').length
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`bulkUserOperations failed in ${responseTime}ms:`, error);
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const getUserAnalytics = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userId, timeRange = '30d' } = data;

    if (!userId) {
      return createResponse(false, undefined, 'User ID required');
    }

    // Calculate time range
    const now = Date.now();
    const timeRanges = {
      '7d': now - (7 * 24 * 60 * 60 * 1000),
      '30d': now - (30 * 24 * 60 * 60 * 1000),
      '90d': now - (90 * 24 * 60 * 60 * 1000),
    };
    const startTime = timeRanges[timeRange] || timeRanges['30d'];

    // Get user analytics data
    const [escrowStats, disputeStats, loginStats, activityStats] = await Promise.all([
      // Escrow statistics
      db.collection('escrows')
        .where('userId', '==', userId)
        .where('createdAt', '>=', startTime)
        .get(),
      
      // Dispute statistics
      db.collection('disputes')
        .where('userId', '==', userId)
        .where('createdAt', '>=', startTime)
        .get(),
      
      // Login statistics
      db.collection('security_logs')
        .where('userId', '==', userId)
        .where('action', '==', 'login')
        .where('timestamp', '>=', startTime)
        .get(),
      
      // Activity statistics
      db.collection('user_activity')
        .where('userId', '==', userId)
        .where('timestamp', '>=', startTime)
        .get()
    ]);

    // Process analytics data
    const analytics = {
      escrowAnalytics: {
        total: escrowStats.docs.length,
        successful: escrowStats.docs.filter(doc => doc.data().status === 'completed').length,
        failed: escrowStats.docs.filter(doc => doc.data().status === 'failed').length,
        totalVolume: escrowStats.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0),
        averageTransactionSize: escrowStats.docs.length > 0 
          ? escrowStats.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0) / escrowStats.docs.length 
          : 0,
      },
      disputeAnalytics: {
        initiated: disputeStats.docs.filter(doc => doc.data().initiatorId === userId).length,
        involved: disputeStats.docs.length,
        resolved: disputeStats.docs.filter(doc => doc.data().status === 'resolved').length,
        won: disputeStats.docs.filter(doc => 
          doc.data().status === 'resolved' && 
          doc.data().winnerId === userId
        ).length,
        lost: disputeStats.docs.filter(doc => 
          doc.data().status === 'resolved' && 
          doc.data().winnerId !== userId
        ).length,
      },
      securityAnalytics: {
        totalLogins: loginStats.docs.length,
        failedLogins: loginStats.docs.filter(doc => doc.data().success === false).length,
        uniqueIPs: new Set(loginStats.docs.map(doc => doc.data().ipAddress)).size,
        uniqueDevices: new Set(loginStats.docs.map(doc => doc.data().deviceInfo)).size,
      },
      activityAnalytics: {
        totalActions: activityStats.docs.length,
        actionTypes: activityStats.docs.reduce((acc, doc) => {
          const actionType = doc.data().actionType;
          acc[actionType] = (acc[actionType] || 0) + 1;
          return acc;
        }, {}),
        peakActivityTime: activityStats.docs.reduce((acc, doc) => {
          const hour = new Date(doc.data().timestamp).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {}),
      }
    };

    const responseTime = Date.now() - startTime;
    console.log(`getUserAnalytics completed in ${responseTime}ms`);

    return createResponse(true, analytics);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getUserAnalytics failed in ${responseTime}ms:`, error);
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const forceUserLogout = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userId, reason } = data;

    if (!userId || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Clear all active sessions for the user
    await db.collection('users').doc(userId).update({
      'securitySettings.sessionManagement.activeSessions': [],
      updatedAt: Date.now(),
    });

    // Log the force logout
    await db.collection('security_logs').add({
      userId,
      action: 'force_logout',
      adminId: context.auth.uid,
      reason,
      timestamp: Date.now(),
      ipAddress: context.rawRequest.ip,
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'force_logout', userId, reason);

    const responseTime = Date.now() - startTime;
    console.log(`forceUserLogout completed in ${responseTime}ms`);

    return createResponse(true, { message: 'User logged out successfully' });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`forceUserLogout failed in ${responseTime}ms:`, error);
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const updateUserCompliance = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userId, complianceData, reason } = data;

    if (!userId || !complianceData || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Update user compliance data
    await db.collection('users').doc(userId).update({
      'kycLevel': complianceData.kycLevel,
      'kycStatus': complianceData.kycStatus,
      'complianceStatus': complianceData.complianceStatus,
      'riskScore': complianceData.riskScore || 0,
      updatedAt: Date.now(),
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'update_compliance', userId, reason, { complianceData });

    const responseTime = Date.now() - startTime;
    console.log(`updateUserCompliance completed in ${responseTime}ms`);

    return createResponse(true, { message: 'Compliance data updated successfully' });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`updateUserCompliance failed in ${responseTime}ms:`, error);
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const moveFundsToAddress = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Check admin permissions
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { escrowId, targetAddress, reason } = data;

    if (!escrowId || !targetAddress || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      return createResponse(false, undefined, 'Invalid Ethereum address format');
    }

    // Get escrow data
    const escrowDoc = await db.collection('escrows').doc(escrowId).get();
    if (!escrowDoc.exists) {
      return createResponse(false, undefined, 'Escrow not found');
    }

    const escrowData = escrowDoc.data();
    if (escrowData?.status !== 'funded') {
      return createResponse(false, undefined, 'Escrow must be in funded status');
    }

    // Create fund movement record
    const fundMovement = {
      id: `movement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      escrowId,
      fromAddress: escrowData?.escrowAddress,
      toAddress: targetAddress,
      amount: escrowData?.amount,
      reason,
      initiatedBy: context.auth.uid,
      timestamp: Date.now(),
      status: 'pending',
      transactionHash: null,
    };

    await db.collection('fund_movements').doc(fundMovement.id).set(fundMovement);

    // Update escrow status
    await db.collection('escrows').doc(escrowId).update({
      status: 'funds_moved',
      fundsMovedAt: Date.now(),
      fundsMovedTo: targetAddress,
      movementId: fundMovement.id,
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'move_funds', escrowId, reason, {
      targetAddress,
      amount: escrowData?.amount,
      movementId: fundMovement.id,
    });

    const responseTime = Date.now() - startTime;
    console.log(`moveFundsToAddress completed in ${responseTime}ms`);

    return createResponse(true, { 
      message: 'Fund movement initiated',
      movementId: fundMovement.id,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`moveFundsToAddress failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const suspendUser = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Check admin permissions
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { userId, reason, duration, durationType = 'days' } = data;

    if (!userId || !reason || !duration) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Calculate suspension end time
    const now = Date.now();
    const durationMs = duration * (durationType === 'hours' ? 3600000 : 86400000);
    const suspendedUntil = now + durationMs;

    // Update user status
    await db.collection('users').doc(userId).update({
      status: 'suspended',
      suspendedAt: now,
      suspendedUntil,
      suspendedBy: context.auth.uid,
      suspensionReason: reason,
      updatedAt: now,
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'suspend_user', userId, reason, {
      duration,
      durationType,
      suspendedUntil,
    });

    const responseTime = Date.now() - startTime;
    console.log(`suspendUser completed in ${responseTime}ms`);

    return createResponse(true, { 
      message: 'User suspended successfully',
      suspendedUntil: new Date(suspendedUntil).toISOString(),
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`suspendUser failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const forceContractPause = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Check admin permissions
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { contractAddress, reason } = data;

    if (!contractAddress || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Create contract pause record
    const pauseRecord = {
      id: `pause_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractAddress,
      reason,
      pausedBy: context.auth.uid,
      pausedAt: Date.now(),
      status: 'active',
    };

    await db.collection('contract_pauses').doc(pauseRecord.id).set(pauseRecord);

    // Update global pause status
    await db.collection('system_settings').doc('contracts').update({
      pausedContracts: firestore.FieldValue.arrayUnion(contractAddress),
      lastPauseUpdate: Date.now(),
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'pause_contract', contractAddress, reason, {
      pauseId: pauseRecord.id,
    });

    const responseTime = Date.now() - startTime;
    console.log(`forceContractPause completed in ${responseTime}ms`);

    return createResponse(true, { 
      message: 'Contract paused successfully',
      pauseId: pauseRecord.id,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`forceContractPause failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const reassignEscrow = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Check admin permissions
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { escrowId, newArbiterId, reason } = data;

    if (!escrowId || !newArbiterId || !reason) {
      return createResponse(false, undefined, 'Missing required parameters');
    }

    // Verify new arbiter exists and has arbiter role
    const arbiterDoc = await db.collection('users').doc(newArbiterId).get();
    if (!arbiterDoc.exists) {
      return createResponse(false, undefined, 'New arbiter not found');
    }

    const arbiterData = arbiterDoc.data();
    if (arbiterData?.role !== 'arbiter') {
      return createResponse(false, undefined, 'New arbiter must have arbiter role');
    }

    // Get escrow data
    const escrowDoc = await db.collection('escrows').doc(escrowId).get();
    if (!escrowDoc.exists) {
      return createResponse(false, undefined, 'Escrow not found');
    }

    const escrowData = escrowDoc.data();
    const previousArbiterId = escrowData?.arbiterId;

    // Update escrow arbiter
    await db.collection('escrows').doc(escrowId).update({
      arbiterId: newArbiterId,
      reassignedAt: Date.now(),
      reassignedBy: context.auth.uid,
      reassignmentReason: reason,
      previousArbiterId,
    });

    // Log admin action
    await logAdminAction(context.auth.uid, 'reassign_escrow', escrowId, reason, {
      previousArbiterId,
      newArbiterId,
    });

    const responseTime = Date.now() - startTime;
    console.log(`reassignEscrow completed in ${responseTime}ms`);

    return createResponse(true, { message: 'Escrow reassigned successfully' });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`reassignEscrow failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const getAdminActions = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Check admin permissions
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    const { limit = 50, offset = 0, actionType, status } = data;

    let query = db.collection('admin_actions').orderBy('timestamp', 'desc');

    if (actionType) {
      query = query.where('actionType', '==', actionType);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.limit(limit).offset(offset).get();
    const actions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const responseTime = Date.now() - startTime;
    console.log(`getAdminActions completed in ${responseTime}ms`);

    return createResponse(true, { actions });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getAdminActions failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const getSystemStats = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Check admin permissions
    if (!(await checkAdminPermissions(context))) {
      return createResponse(false, undefined, 'Insufficient permissions');
    }

    // Get various system statistics
    const [
      usersSnapshot,
      escrowsSnapshot,
      disputesSnapshot,
      actionsSnapshot,
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('escrows').get(),
      db.collection('disputes').get(),
      db.collection('admin_actions').get(),
    ]);

    const stats = {
      totalUsers: usersSnapshot.size,
      totalEscrows: escrowsSnapshot.size,
      totalDisputes: disputesSnapshot.size,
      totalAdminActions: actionsSnapshot.size,
      activeUsers: usersSnapshot.docs.filter(doc => doc.data().status === 'active').length,
      suspendedUsers: usersSnapshot.docs.filter(doc => doc.data().status === 'suspended').length,
      openEscrows: escrowsSnapshot.docs.filter(doc => ['draft', 'funded'].includes(doc.data().status)).length,
      disputedEscrows: escrowsSnapshot.docs.filter(doc => doc.data().status === 'disputed').length,
      recentActions: actionsSnapshot.docs
        .filter(doc => doc.data().timestamp > Date.now() - 86400000) // Last 24 hours
        .length,
    };

    const responseTime = Date.now() - startTime;
    console.log(`getSystemStats completed in ${responseTime}ms`);

    return createResponse(true, { stats });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getSystemStats failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
}); 