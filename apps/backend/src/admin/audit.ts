import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';
import { createHmac, randomBytes } from 'crypto';
import { AuditLog, AuditLogSchema, AdminActionQueue, AdminActionQueueSchema } from '@escrow/schemas';

const db = firestore();

// Get admin audit signing key from environment
const getAuditSigningKey = (): string => {
  const key = process.env.ADMIN_AUDIT_SIGNING_KEY;
  if (!key) {
    throw new Error('ADMIN_AUDIT_SIGNING_KEY environment variable not set');
  }
  return key;
};

/**
 * Generate HMAC signature for audit log entry
 */
function generateAuditSignature(auditData: Omit<AuditLog, 'signature'>): string {
  const signingKey = getAuditSigningKey();
  const dataToSign = JSON.stringify(auditData);
  return createHmac('sha256', signingKey).update(dataToSign).digest('hex');
}

/**
 * Verify audit log signature
 */
export function verifyAuditSignature(auditLog: AuditLog): boolean {
  const { signature, ...dataWithoutSignature } = auditLog;
  const expectedSignature = generateAuditSignature(dataWithoutSignature);
  return signature === expectedSignature;
}

/**
 * Create and store an audit log entry
 */
export async function createAuditLog(
  actorId: string,
  actorRoles: string[],
  entity: string,
  entityId: string,
  action: string,
  before?: any,
  after?: any,
  metadata?: Record<string, any>,
  request?: functions.https.Request
): Promise<AuditLog> {
  const timestamp = Date.now();
  const auditId = `audit_${timestamp}_${randomBytes(8).toString('hex')}`;
  
  const auditData: Omit<AuditLog, 'signature'> = {
    id: auditId,
    actorId,
    actorRoles,
    entity,
    entityId,
    action,
    before,
    after,
    metadata,
    timestamp,
    ipAddress: request?.ip,
    userAgent: request?.headers['user-agent'],
  };

  const signature = generateAuditSignature(auditData);
  
  const auditLog: AuditLog = {
    ...auditData,
    signature,
  };

  // Validate the audit log before storing
  const validatedAuditLog = AuditLogSchema.parse(auditLog);

  // Store in Firestore
  await db.collection('auditLogs').doc(auditId).set(validatedAuditLog);

  // Log to console for monitoring
  console.log(`Audit log created: ${action} on ${entity}/${entityId} by ${actorId}`, {
    auditId,
    actorId,
    action,
    entity,
    entityId,
    timestamp,
  });

  return validatedAuditLog;
}

/**
 * Queue a high-risk admin action for approval
 */
export async function queueHighRiskAction(
  actionType: string,
  targetEntity: string,
  targetId: string,
  requesterId: string,
  requesterRoles: string[],
  reason: string,
  metadata?: Record<string, any>
): Promise<AdminActionQueue> {
  const timestamp = Date.now();
  const actionId = `action_${timestamp}_${randomBytes(8).toString('hex')}`;
  const expiresAt = timestamp + (24 * 60 * 60 * 1000); // 24 hours

  const actionQueue: AdminActionQueue = {
    id: actionId,
    actionType,
    targetEntity,
    targetId,
    requesterId,
    requesterRoles,
    status: 'pending',
    reason,
    metadata,
    createdAt: timestamp,
    expiresAt,
  };

  // Validate before storing
  const validatedAction = AdminActionQueueSchema.parse(actionQueue);

  // Store in Firestore
  await db.collection('adminActionsQueue').doc(actionId).set(validatedAction);

  console.log(`High-risk action queued: ${actionType} on ${targetEntity}/${targetId}`, {
    actionId,
    requesterId,
    reason,
    expiresAt,
  });

  return validatedAction;
}

/**
 * Approve a queued high-risk action
 */
export async function approveHighRiskAction(
  actionId: string,
  approverId: string,
  approverRoles: string[]
): Promise<AdminActionQueue> {
  const actionRef = db.collection('adminActionsQueue').doc(actionId);
  const actionDoc = await actionRef.get();

  if (!actionDoc.exists) {
    throw new Error('Action not found');
  }

  const action = actionDoc.data() as AdminActionQueue;
  
  if (action.status !== 'pending') {
    throw new Error(`Action is not pending. Current status: ${action.status}`);
  }

  if (Date.now() > action.expiresAt) {
    // Mark as expired
    await actionRef.update({
      status: 'expired',
    });
    throw new Error('Action has expired');
  }

  const updatedAction: AdminActionQueue = {
    ...action,
    status: 'approved',
    approvedBy: approverId,
    approvedAt: Date.now(),
  };

  await actionRef.update(updatedAction);

  // Create audit log for the approval
  await createAuditLog(
    approverId,
    approverRoles,
    'adminAction',
    actionId,
    'approve',
    action,
    updatedAction,
    { originalAction: action }
  );

  return updatedAction;
}

/**
 * Reject a queued high-risk action
 */
export async function rejectHighRiskAction(
  actionId: string,
  rejecterId: string,
  rejecterRoles: string[],
  rejectionReason: string
): Promise<AdminActionQueue> {
  const actionRef = db.collection('adminActionsQueue').doc(actionId);
  const actionDoc = await actionRef.get();

  if (!actionDoc.exists) {
    throw new Error('Action not found');
  }

  const action = actionDoc.data() as AdminActionQueue;
  
  if (action.status !== 'pending') {
    throw new Error(`Action is not pending. Current status: ${action.status}`);
  }

  const updatedAction: AdminActionQueue = {
    ...action,
    status: 'rejected',
    approvedBy: rejecterId,
    approvedAt: Date.now(),
    rejectionReason,
  };

  await actionRef.update(updatedAction);

  // Create audit log for the rejection
  await createAuditLog(
    rejecterId,
    rejecterRoles,
    'adminAction',
    actionId,
    'reject',
    action,
    updatedAction,
    { rejectionReason }
  );

  return updatedAction;
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(
  filters: {
    actorId?: string;
    entity?: string;
    entityId?: string;
    action?: string;
    startTime?: number;
    endTime?: number;
  } = {},
  limit: number = 100,
  offset: number = 0
): Promise<{ logs: AuditLog[]; total: number }> {
  let query = db.collection('auditLogs').orderBy('timestamp', 'desc');

  // Apply filters
  if (filters.actorId) {
    query = query.where('actorId', '==', filters.actorId);
  }
  if (filters.entity) {
    query = query.where('entity', '==', filters.entity);
  }
  if (filters.entityId) {
    query = query.where('entityId', '==', filters.entityId);
  }
  if (filters.action) {
    query = query.where('action', '==', filters.action);
  }
  if (filters.startTime) {
    query = query.where('timestamp', '>=', filters.startTime);
  }
  if (filters.endTime) {
    query = query.where('timestamp', '<=', filters.endTime);
  }

  // Get total count
  const totalSnapshot = await query.get();
  const total = totalSnapshot.size;

  // Apply pagination
  query = query.limit(limit).offset(offset);
  const snapshot = await query.get();

  const logs: AuditLog[] = [];
  snapshot.forEach(doc => {
    const log = doc.data() as AuditLog;
    // Verify signature
    if (verifyAuditSignature(log)) {
      logs.push(log);
    } else {
      console.error(`Invalid audit log signature: ${log.id}`);
    }
  });

  return { logs, total };
}

/**
 * Clean up expired actions
 */
export async function cleanupExpiredActions(): Promise<number> {
  const now = Date.now();
  const expiredQuery = db.collection('adminActionsQueue')
    .where('status', '==', 'pending')
    .where('expiresAt', '<', now);

  const snapshot = await expiredQuery.get();
  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    batch.update(doc.ref, { status: 'expired' });
    count++;
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Cleaned up ${count} expired actions`);
  }

  return count;
}
