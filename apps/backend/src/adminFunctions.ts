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