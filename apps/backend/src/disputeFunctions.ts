import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { rateLimit } from './rateLimit';
import { checkRole } from './auth';
import { logAnalytics } from './fsmLogger';

// ============ Validation Schemas ============

const FileDisputeSchema = z.object({
  dealId: z.string().min(1),
  reason: z.string().min(10).max(5000),
  severity: z.number().min(1).max(5),
  riskLevel: z.enum(['low', 'med', 'high']),
  evidence: z.array(z.string()).optional(),
  contactInfo: z.string().optional()
});

const VoteDisputeSchema = z.object({
  disputeId: z.string().min(1),
  voteForInitiator: z.boolean(),
  reasoning: z.string().min(10).max(2000),
  evidence: z.array(z.string()).optional()
});

const ResolveDisputeSchema = z.object({
  disputeId: z.string().min(1),
  reasoning: z.string().min(10).max(2000),
  resolution: z.enum(['initiator_wins', 'respondent_wins', 'split', 'dismissed']),
  fundRedirect: z.object({
    from: z.string(),
    to: z.string(),
    amount: z.string(),
    reason: z.string()
  }).optional()
});

const EscalateDisputeSchema = z.object({
  disputeId: z.string().min(1),
  reason: z.string().min(10).max(2000),
  urgency: z.enum(['normal', 'high', 'critical'])
});

const RevokeDisputeSchema = z.object({
  disputeId: z.string().min(1),
  reason: z.string().min(10).max(2000)
});

const ForceRedirectSchema = z.object({
  disputeId: z.string().min(1),
  from: z.string(),
  to: z.string(),
  amount: z.string(),
  reason: z.string().min(10).max(2000)
});

const TrustScoreAdjustmentSchema = z.object({
  userId: z.string().min(1),
  adjustment: z.number().min(-100).max(100),
  reason: z.string().min(10).max(2000),
  evidence: z.array(z.string()).optional()
});

const BlacklistUserSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(10).max(2000),
  evidence: z.array(z.string()).optional(),
  duration: z.enum(['temporary', 'permanent']).optional()
});

// ============ Rate Limiting Configuration ============

const DISPUTE_RATE_LIMITS = {
  fileDispute: { maxRequests: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 disputes per day
  vote: { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 votes per hour
  escalate: { maxRequests: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 escalations per day
  adminOverride: { maxRequests: 10, windowMs: 60 * 60 * 1000 } // 10 overrides per hour
};

// ============ Firebase Functions ============

/**
 * Files a new dispute
 * Rate limit: 5 disputes per day per user
 */
export const fileDisputeFn = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Rate limiting
    await rateLimit(userId, 'fileDispute', DISPUTE_RATE_LIMITS.fileDispute);

    // Input validation
    const validatedData = FileDisputeSchema.parse(data);

    // Check if user is blacklisted
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    if (userData?.isBlacklisted) {
      throw new functions.https.HttpsError('permission-denied', 'User is blacklisted');
    }

    // Check if deal exists and user is involved
    const dealDoc = await admin.firestore().collection('deals').doc(validatedData.dealId).get();
    if (!dealDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Deal not found');
    }

    const dealData = dealDoc.data();
    if (dealData?.buyerId !== userId && dealData?.sellerId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'User not involved in deal');
    }

    // Create dispute document
    const disputeData = {
      dealId: validatedData.dealId,
      initiatorId: userId,
      reason: validatedData.reason,
      severity: validatedData.severity,
      riskLevel: validatedData.riskLevel,
      evidence: validatedData.evidence || [],
      contactInfo: validatedData.contactInfo,
      status: 'active',
      votesForInitiator: 0,
      votesForRespondent: 0,
      totalVotes: 0,
      resolution: null,
      timeCreated: admin.firestore.FieldValue.serverTimestamp(),
      timeResolved: null,
      auditTrail: [],
      escalationCount: 0,
      lastEscalationTime: null,
      requiresSuperArbiter: validatedData.severity >= 4,
      lastModifiedBy: userId,
      lastModifiedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const disputeRef = await admin.firestore().collection('disputes').add(disputeData);
    const disputeId = disputeRef.id;

    // Update audit trail
    await admin.firestore().collection('disputes').doc(disputeId).update({
      auditTrail: admin.firestore.FieldValue.arrayUnion({
        action: 'dispute_filed',
        userId: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: `Dispute filed with severity ${validatedData.severity}`
      })
    });

    // Log analytics
    await logAnalytics('dispute_filed', {
      userId,
      disputeId,
      dealId: validatedData.dealId,
      severity: validatedData.severity,
      riskLevel: validatedData.riskLevel
    });

    // Send notifications
    await sendDisputeNotifications(disputeId, 'dispute_filed', {
      initiatorId: userId,
      dealId: validatedData.dealId,
      severity: validatedData.severity
    });

    return {
      success: true,
      disputeId,
      message: 'Dispute filed successfully'
    };

  } catch (error) {
    console.error('Error filing dispute:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid input data', error.errors);
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to file dispute');
  }
});

/**
 * Votes on a dispute (arbiters only)
 * Rate limit: 50 votes per hour per arbiter
 */
export const voteDisputeFn = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Role check
    const hasArbiterRole = await checkRole(userId, 'arbiter');
    if (!hasArbiterRole) {
      throw new functions.https.HttpsError('permission-denied', 'Must be arbiter to vote');
    }

    // Rate limiting
    await rateLimit(userId, 'vote', DISPUTE_RATE_LIMITS.vote);

    // Input validation
    const validatedData = VoteDisputeSchema.parse(data);

    // Check if dispute exists and is active
    const disputeDoc = await admin.firestore().collection('disputes').doc(validatedData.disputeId).get();
    if (!disputeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Dispute not found');
    }

    const disputeData = disputeDoc.data();
    if (disputeData?.status !== 'active') {
      throw new functions.https.HttpsError('failed-precondition', 'Dispute is not active');
    }

    // Check if user already voted
    const voteDoc = await admin.firestore()
      .collection('disputes')
      .doc(validatedData.disputeId)
      .collection('votes')
      .doc(userId)
      .get();

    if (voteDoc.exists) {
      throw new functions.https.HttpsError('already-exists', 'User already voted on this dispute');
    }

    // Record vote
    const voteData = {
      arbiterId: userId,
      voteForInitiator: validatedData.voteForInitiator,
      reasoning: validatedData.reasoning,
      evidence: validatedData.evidence || [],
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore()
      .collection('disputes')
      .doc(validatedData.disputeId)
      .collection('votes')
      .doc(userId)
      .set(voteData);

    // Update dispute vote counts
    const voteUpdate = validatedData.voteForInitiator
      ? { votesForInitiator: admin.firestore.FieldValue.increment(1) }
      : { votesForRespondent: admin.firestore.FieldValue.increment(1) };

    await admin.firestore().collection('disputes').doc(validatedData.disputeId).update({
      ...voteUpdate,
      totalVotes: admin.firestore.FieldValue.increment(1),
      lastModifiedBy: userId,
      lastModifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      auditTrail: admin.firestore.FieldValue.arrayUnion({
        action: 'vote_cast',
        userId: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: `Voted for ${validatedData.voteForInitiator ? 'initiator' : 'respondent'}`
      })
    });

    // Check if enough votes for resolution
    const updatedDisputeDoc = await admin.firestore().collection('disputes').doc(validatedData.disputeId).get();
    const updatedDisputeData = updatedDisputeDoc.data();
    
    if (updatedDisputeData?.totalVotes >= 3) {
      await resolveDisputeAutomatically(validatedData.disputeId, userId);
    }

    // Log analytics
    await logAnalytics('dispute_vote_cast', {
      userId,
      disputeId: validatedData.disputeId,
      voteForInitiator: validatedData.voteForInitiator
    });

    return {
      success: true,
      message: 'Vote recorded successfully'
    };

  } catch (error) {
    console.error('Error voting on dispute:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid input data', error.errors);
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to record vote');
  }
});

/**
 * Resolves a dispute (arbiters and super arbiters only)
 */
export const resolveDisputeFn = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Role check
    const hasArbiterRole = await checkRole(userId, 'arbiter');
    const hasSuperArbiterRole = await checkRole(userId, 'super_arbiter');
    
    if (!hasArbiterRole && !hasSuperArbiterRole) {
      throw new functions.https.HttpsError('permission-denied', 'Must be arbiter or super arbiter to resolve disputes');
    }

    // Input validation
    const validatedData = ResolveDisputeSchema.parse(data);

    // Check if dispute exists and is active
    const disputeDoc = await admin.firestore().collection('disputes').doc(validatedData.disputeId).get();
    if (!disputeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Dispute not found');
    }

    const disputeData = disputeDoc.data();
    if (disputeData?.status !== 'active') {
      throw new functions.https.HttpsError('failed-precondition', 'Dispute is not active');
    }

    // Update dispute
    const updateData = {
      status: 'resolved',
      resolution: validatedData.resolution,
      timeResolved: admin.firestore.FieldValue.serverTimestamp(),
      lastModifiedBy: userId,
      lastModifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      auditTrail: admin.firestore.FieldValue.arrayUnion({
        action: 'dispute_resolved',
        userId: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: `Resolved as ${validatedData.resolution}`
      })
    };

    await admin.firestore().collection('disputes').doc(validatedData.disputeId).update(updateData);

    // Handle fund redirection if specified
    if (validatedData.fundRedirect) {
      await handleFundRedirect(validatedData.disputeId, validatedData.fundRedirect, userId);
    }

    // Update trust scores
    await updateTrustScores(validatedData.disputeId, validatedData.resolution);

    // Send notifications
    await sendDisputeNotifications(validatedData.disputeId, 'dispute_resolved', {
      resolution: validatedData.resolution,
      resolvedBy: userId
    });

    // Log analytics
    await logAnalytics('dispute_resolved', {
      userId,
      disputeId: validatedData.disputeId,
      resolution: validatedData.resolution
    });

    return {
      success: true,
      message: 'Dispute resolved successfully'
    };

  } catch (error) {
    console.error('Error resolving dispute:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid input data', error.errors);
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to resolve dispute');
  }
});

/**
 * Escalates a dispute to super arbiter
 * Rate limit: 3 escalations per day per user
 */
export const escalateDisputeFn = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Role check
    const hasEscalationRole = await checkRole(userId, 'escalation');
    const hasSuperArbiterRole = await checkRole(userId, 'super_arbiter');
    
    if (!hasEscalationRole && !hasSuperArbiterRole) {
      throw new functions.https.HttpsError('permission-denied', 'Must have escalation role to escalate disputes');
    }

    // Rate limiting
    await rateLimit(userId, 'escalate', DISPUTE_RATE_LIMITS.escalate);

    // Input validation
    const validatedData = EscalateDisputeSchema.parse(data);

    // Check if dispute exists and is active
    const disputeDoc = await admin.firestore().collection('disputes').doc(validatedData.disputeId).get();
    if (!disputeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Dispute not found');
    }

    const disputeData = disputeDoc.data();
    if (disputeData?.status !== 'active') {
      throw new functions.https.HttpsError('failed-precondition', 'Dispute is not active');
    }

    // Check escalation limits
    if (disputeData.escalationCount >= 2) {
      throw new functions.https.HttpsError('resource-exhausted', 'Maximum escalations reached for this dispute');
    }

    // Check cooldown period
    if (disputeData.lastEscalationTime) {
      const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
      const timeSinceLastEscalation = Date.now() - disputeData.lastEscalationTime.toMillis();
      
      if (timeSinceLastEscalation < cooldownPeriod) {
        throw new functions.https.HttpsError('failed-precondition', 'Escalation cooldown period not met');
      }
    }

    // Update dispute
    await admin.firestore().collection('disputes').doc(validatedData.disputeId).update({
      status: 'escalated',
      escalationCount: admin.firestore.FieldValue.increment(1),
      lastEscalationTime: admin.firestore.FieldValue.serverTimestamp(),
      requiresSuperArbiter: true,
      lastModifiedBy: userId,
      lastModifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      auditTrail: admin.firestore.FieldValue.arrayUnion({
        action: 'dispute_escalated',
        userId: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: `Escalated with urgency: ${validatedData.urgency}`
      })
    });

    // Send notifications
    await sendDisputeNotifications(validatedData.disputeId, 'dispute_escalated', {
      escalatedBy: userId,
      urgency: validatedData.urgency
    });

    // Log analytics
    await logAnalytics('dispute_escalated', {
      userId,
      disputeId: validatedData.disputeId,
      urgency: validatedData.urgency
    });

    return {
      success: true,
      message: 'Dispute escalated successfully'
    };

  } catch (error) {
    console.error('Error escalating dispute:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid input data', error.errors);
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to escalate dispute');
  }
});

/**
 * Revokes a dispute (admin and super arbiters only)
 */
export const revokeDisputeFn = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Role check
    const hasAdminRole = await checkRole(userId, 'admin');
    const hasSuperArbiterRole = await checkRole(userId, 'super_arbiter');
    
    if (!hasAdminRole && !hasSuperArbiterRole) {
      throw new functions.https.HttpsError('permission-denied', 'Must be admin or super arbiter to revoke disputes');
    }

    // Input validation
    const validatedData = RevokeDisputeSchema.parse(data);

    // Check if dispute exists and is active
    const disputeDoc = await admin.firestore().collection('disputes').doc(validatedData.disputeId).get();
    if (!disputeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Dispute not found');
    }

    const disputeData = disputeDoc.data();
    if (disputeData?.status !== 'active') {
      throw new functions.https.HttpsError('failed-precondition', 'Dispute is not active');
    }

    // Update dispute
    await admin.firestore().collection('disputes').doc(validatedData.disputeId).update({
      status: 'revoked',
      lastModifiedBy: userId,
      lastModifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      auditTrail: admin.firestore.FieldValue.arrayUnion({
        action: 'dispute_revoked',
        userId: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: validatedData.reason
      })
    });

    // Send notifications
    await sendDisputeNotifications(validatedData.disputeId, 'dispute_revoked', {
      revokedBy: userId,
      reason: validatedData.reason
    });

    // Log analytics
    await logAnalytics('dispute_revoked', {
      userId,
      disputeId: validatedData.disputeId
    });

    return {
      success: true,
      message: 'Dispute revoked successfully'
    };

  } catch (error) {
    console.error('Error revoking dispute:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid input data', error.errors);
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to revoke dispute');
  }
});

/**
 * Forces fund redirection (admin and super arbiters only)
 * Rate limit: 10 overrides per hour per admin
 */
export const forceRedirectFn = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Role check
    const hasAdminRole = await checkRole(userId, 'admin');
    const hasSuperArbiterRole = await checkRole(userId, 'super_arbiter');
    
    if (!hasAdminRole && !hasSuperArbiterRole) {
      throw new functions.https.HttpsError('permission-denied', 'Must be admin or super arbiter to force fund redirection');
    }

    // Rate limiting
    await rateLimit(userId, 'adminOverride', DISPUTE_RATE_LIMITS.adminOverride);

    // Input validation
    const validatedData = ForceRedirectSchema.parse(data);

    // Check if dispute exists
    const disputeDoc = await admin.firestore().collection('disputes').doc(validatedData.disputeId).get();
    if (!disputeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Dispute not found');
    }

    // Handle fund redirection
    await handleFundRedirect(validatedData.disputeId, validatedData, userId);

    // Update dispute audit trail
    await admin.firestore().collection('disputes').doc(validatedData.disputeId).update({
      auditTrail: admin.firestore.FieldValue.arrayUnion({
        action: 'fund_redirected',
        userId: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: `Funds redirected from ${validatedData.from} to ${validatedData.to}: ${validatedData.amount}`
      })
    });

    // Send notifications
    await sendDisputeNotifications(validatedData.disputeId, 'fund_redirected', {
      redirectedBy: userId,
      from: validatedData.from,
      to: validatedData.to,
      amount: validatedData.amount
    });

    // Log analytics
    await logAnalytics('fund_redirected', {
      userId,
      disputeId: validatedData.disputeId,
      amount: validatedData.amount
    });

    return {
      success: true,
      message: 'Fund redirection executed successfully'
    };

  } catch (error) {
    console.error('Error forcing fund redirection:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid input data', error.errors);
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to execute fund redirection');
  }
});

/**
 * Adjusts trust score (trust monitors only)
 */
export const trustScoreAdjustmentFn = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Role check
    const hasTrustMonitorRole = await checkRole(userId, 'trust_monitor');
    if (!hasTrustMonitorRole) {
      throw new functions.https.HttpsError('permission-denied', 'Must be trust monitor to adjust trust scores');
    }

    // Input validation
    const validatedData = TrustScoreAdjustmentSchema.parse(data);

    // Check if target user exists
    const userDoc = await admin.firestore().collection('users').doc(validatedData.userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const currentScore = userData?.trustScore || 500;
    const newScore = Math.max(0, Math.min(1000, currentScore + validatedData.adjustment));

    // Update user trust score
    await admin.firestore().collection('users').doc(validatedData.userId).update({
      trustScore: newScore,
      trustScoreHistory: admin.firestore.FieldValue.arrayUnion({
        adjustment: validatedData.adjustment,
        reason: validatedData.reason,
        adjustedBy: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        evidence: validatedData.evidence || []
      })
    });

    // Log analytics
    await logAnalytics('trust_score_adjusted', {
      userId: validatedData.userId,
      adjustedBy: userId,
      adjustment: validatedData.adjustment,
      newScore
    });

    return {
      success: true,
      message: 'Trust score adjusted successfully',
      newScore
    };

  } catch (error) {
    console.error('Error adjusting trust score:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid input data', error.errors);
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to adjust trust score');
  }
});

/**
 * Blacklists a user (trust monitors only)
 */
export const blacklistUserFn = functions.https.onCall(async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Role check
    const hasTrustMonitorRole = await checkRole(userId, 'trust_monitor');
    if (!hasTrustMonitorRole) {
      throw new functions.https.HttpsError('permission-denied', 'Must be trust monitor to blacklist users');
    }

    // Input validation
    const validatedData = BlacklistUserSchema.parse(data);

    // Check if target user exists
    const userDoc = await admin.firestore().collection('users').doc(validatedData.userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    // Update user
    await admin.firestore().collection('users').doc(validatedData.userId).update({
      isBlacklisted: true,
      blacklistReason: validatedData.reason,
      blacklistedBy: userId,
      blacklistedAt: admin.firestore.FieldValue.serverTimestamp(),
      blacklistDuration: validatedData.duration || 'permanent',
      trustScore: 0,
      blacklistEvidence: validatedData.evidence || []
    });

    // Send notifications
    await sendUserNotifications(validatedData.userId, 'user_blacklisted', {
      blacklistedBy: userId,
      reason: validatedData.reason
    });

    // Log analytics
    await logAnalytics('user_blacklisted', {
      userId: validatedData.userId,
      blacklistedBy: userId,
      reason: validatedData.reason
    });

    return {
      success: true,
      message: 'User blacklisted successfully'
    };

  } catch (error) {
    console.error('Error blacklisting user:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid input data', error.errors);
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to blacklist user');
  }
});

// ============ Helper Functions ============

/**
 * Automatically resolves a dispute when enough votes are cast
 */
async function resolveDisputeAutomatically(disputeId: string, resolvedBy: string) {
  const disputeDoc = await admin.firestore().collection('disputes').doc(disputeId).get();
  const disputeData = disputeDoc.data();

  if (!disputeData) return;

  let resolution: string;
  if (disputeData.votesForInitiator > disputeData.votesForRespondent) {
    resolution = 'initiator_wins';
  } else if (disputeData.votesForRespondent > disputeData.votesForInitiator) {
    resolution = 'respondent_wins';
  } else {
    resolution = 'split';
  }

  await admin.firestore().collection('disputes').doc(disputeId).update({
    status: 'resolved',
    resolution,
    timeResolved: admin.firestore.FieldValue.serverTimestamp(),
    lastModifiedBy: resolvedBy,
    lastModifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    auditTrail: admin.firestore.FieldValue.arrayUnion({
      action: 'dispute_resolved_automatically',
      userId: resolvedBy,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: `Automatically resolved as ${resolution}`
    })
  });

  // Update trust scores
  await updateTrustScores(disputeId, resolution);

  // Send notifications
  await sendDisputeNotifications(disputeId, 'dispute_resolved', {
    resolution,
    resolvedBy
  });
}

/**
 * Handles fund redirection logic
 */
async function handleFundRedirect(disputeId: string, redirectData: any, executedBy: string) {
  // This would integrate with the escrow contract
  // For now, we log the redirection
  
  await admin.firestore().collection('fundRedirects').add({
    disputeId,
    from: redirectData.from,
    to: redirectData.to,
    amount: redirectData.amount,
    reason: redirectData.reason,
    executedBy,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending' // Would be updated by blockchain confirmation
  });

  // Log analytics
  await logAnalytics('fund_redirect_initiated', {
    disputeId,
    executedBy,
    amount: redirectData.amount
  });
}

/**
 * Updates trust scores based on dispute resolution
 */
async function updateTrustScores(disputeId: string, resolution: string) {
  const disputeDoc = await admin.firestore().collection('disputes').doc(disputeId).get();
  const disputeData = disputeDoc.data();

  if (!disputeData) return;

  const initiatorId = disputeData.initiatorId;
  const dealDoc = await admin.firestore().collection('deals').doc(disputeData.dealId).get();
  const dealData = dealDoc.data();

  if (!dealData) return;

  const respondentId = dealData.buyerId === initiatorId ? dealData.sellerId : dealData.buyerId;

  // Update initiator trust score
  const initiatorDoc = await admin.firestore().collection('users').doc(initiatorId).get();
  const initiatorData = initiatorDoc.data();
  const initiatorCurrentScore = initiatorData?.trustScore || 500;

  let initiatorAdjustment = 0;
  if (resolution === 'initiator_wins') {
    initiatorAdjustment = 25;
  } else if (resolution === 'respondent_wins') {
    initiatorAdjustment = -50;
  }

  if (initiatorAdjustment !== 0) {
    const newInitiatorScore = Math.max(0, Math.min(1000, initiatorCurrentScore + initiatorAdjustment));
    await admin.firestore().collection('users').doc(initiatorId).update({
      trustScore: newInitiatorScore,
      disputesWon: admin.firestore.FieldValue.increment(resolution === 'initiator_wins' ? 1 : 0),
      disputesLost: admin.firestore.FieldValue.increment(resolution === 'respondent_wins' ? 1 : 0)
    });
  }

  // Update respondent trust score (opposite of initiator)
  const respondentDoc = await admin.firestore().collection('users').doc(respondentId).get();
  const respondentData = respondentDoc.data();
  const respondentCurrentScore = respondentData?.trustScore || 500;

  let respondentAdjustment = 0;
  if (resolution === 'respondent_wins') {
    respondentAdjustment = 25;
  } else if (resolution === 'initiator_wins') {
    respondentAdjustment = -50;
  }

  if (respondentAdjustment !== 0) {
    const newRespondentScore = Math.max(0, Math.min(1000, respondentCurrentScore + respondentAdjustment));
    await admin.firestore().collection('users').doc(respondentId).update({
      trustScore: newRespondentScore,
      disputesWon: admin.firestore.FieldValue.increment(resolution === 'respondent_wins' ? 1 : 0),
      disputesLost: admin.firestore.FieldValue.increment(resolution === 'initiator_wins' ? 1 : 0)
    });
  }
}

/**
 * Sends dispute-related notifications
 */
async function sendDisputeNotifications(disputeId: string, eventType: string, data: any) {
  // This would integrate with notification service
  // For now, we log the notification event
  
  await admin.firestore().collection('notifications').add({
    type: eventType,
    disputeId,
    data,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending'
  });
}

/**
 * Sends user-related notifications
 */
async function sendUserNotifications(userId: string, eventType: string, data: any) {
  // This would integrate with notification service
  // For now, we log the notification event
  
  await admin.firestore().collection('notifications').add({
    type: eventType,
    userId,
    data,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending'
  });
} 