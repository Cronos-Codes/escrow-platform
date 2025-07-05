import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { z } from 'zod';
import { sponsorService, SponsorProfile, GasAnalytics } from '@escrow/paymaster';
import { rateLimit } from './rateLimit';
import { logger } from './fsmLogger';

// ============ Zod Schemas for Validation ============

const CreateSponsorSchema = z.object({
  name: z.string().min(1, 'Sponsor name is required'),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  maxDailySpend: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  email: z.string().email('Invalid email address').optional(),
  company: z.string().optional(),
  kycVerified: z.boolean().default(false),
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted')
});

const DepositFundsSchema = z.object({
  sponsorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid sponsor address'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format'),
  transactionHash: z.string().optional()
});

const WhitelistUserSchema = z.object({
  sponsorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid sponsor address'),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid user address'),
  reason: z.string().optional(),
  trustScore: z.number().min(0).max(100).optional()
});

const RemoveWhitelistUserSchema = z.object({
  sponsorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid sponsor address'),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid user address')
});

const GetSponsorStatusSchema = z.object({
  sponsorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid sponsor address')
});

const RemoveSponsorSchema = z.object({
  sponsorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid sponsor address')
});

const UpdateGasUsageSchema = z.object({
  sponsorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid sponsor address'),
  gasCost: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid gas cost format'),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid user address')
});

// ============ Firebase Functions ============

/**
 * Creates a new sponsor
 * @param data Sponsor profile data
 * @param context Firebase function context
 * @returns Created sponsor object
 */
export const createSponsorFn = onCall({
  maxInstances: 10,
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  try {
    // Rate limiting
    const clientIP = request.rawRequest.ip;
    if (!rateLimit.checkLimit(clientIP, 'createSponsor', 5, 60000)) { // 5 requests per minute
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
    }

    // Validate input
    const validatedData = CreateSponsorSchema.parse(request.data);

    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has admin role
    const userRoles = request.auth.token.roles || [];
    if (!userRoles.includes('admin')) {
      throw new HttpsError('permission-denied', 'Admin role required');
    }

    // Create sponsor
    const sponsor = await sponsorService.createSponsor({
      ...validatedData,
      createdAt: Date.now()
    });

    // Log analytics event
    logger.info('sponsor_created', {
      sponsorAddress: sponsor.address,
      name: sponsor.name,
      maxDailySpend: sponsor.maxDailySpend,
      createdBy: request.auth.uid,
      timestamp: Date.now()
    });

    return {
      success: true,
      data: sponsor
    };
  } catch (error) {
    logger.error('createSponsorFn error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: request.data,
      userId: request.auth?.uid
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', `Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }

    throw new HttpsError('internal', 'Failed to create sponsor');
  }
});

/**
 * Deposits funds to a sponsor
 * @param data Deposit data
 * @param context Firebase function context
 * @returns Updated sponsor balance
 */
export const depositSponsorFn = onCall({
  maxInstances: 20,
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  try {
    // Rate limiting
    const clientIP = request.rawRequest.ip;
    if (!rateLimit.checkLimit(clientIP, 'depositSponsor', 10, 60000)) { // 10 requests per minute
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
    }

    // Validate input
    const validatedData = DepositFundsSchema.parse(request.data);

    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has admin or sponsor role
    const userRoles = request.auth.token.roles || [];
    const isAdmin = userRoles.includes('admin');
    const isSponsor = userRoles.includes('sponsor');
    
    if (!isAdmin && !isSponsor) {
      throw new HttpsError('permission-denied', 'Admin or sponsor role required');
    }

    // If not admin, verify the sponsor address matches the user
    if (!isAdmin) {
      const userAddress = request.auth.token.address;
      if (userAddress !== validatedData.sponsorAddress) {
        throw new HttpsError('permission-denied', 'Can only deposit to own sponsor account');
      }
    }

    // Deposit funds
    const newBalance = await sponsorService.depositFunds(
      validatedData.sponsorAddress,
      validatedData.amount,
      validatedData.transactionHash
    );

    // Log analytics event
    logger.info('sponsor_funded', {
      sponsorAddress: validatedData.sponsorAddress,
      amount: validatedData.amount,
      newBalance,
      transactionHash: validatedData.transactionHash,
      fundedBy: request.auth.uid,
      timestamp: Date.now()
    });

    return {
      success: true,
      data: { newBalance }
    };
  } catch (error) {
    logger.error('depositSponsorFn error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: request.data,
      userId: request.auth?.uid
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', `Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }

    throw new HttpsError('internal', 'Failed to deposit funds');
  }
});

/**
 * Gets sponsor status and analytics
 * @param data Sponsor address
 * @param context Firebase function context
 * @returns Sponsor status with analytics
 */
export const getSponsorStatusFn = onCall({
  maxInstances: 50,
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  try {
    // Rate limiting
    const clientIP = request.rawRequest.ip;
    if (!rateLimit.checkLimit(clientIP, 'getSponsorStatus', 30, 60000)) { // 30 requests per minute
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
    }

    // Validate input
    const validatedData = GetSponsorStatusSchema.parse(request.data);

    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check permissions
    const userRoles = request.auth.token.roles || [];
    const isAdmin = userRoles.includes('admin');
    const isSponsor = userRoles.includes('sponsor');
    
    if (!isAdmin && !isSponsor) {
      throw new HttpsError('permission-denied', 'Admin or sponsor role required');
    }

    // If not admin, verify the sponsor address matches the user
    if (!isAdmin) {
      const userAddress = request.auth.token.address;
      if (userAddress !== validatedData.sponsorAddress) {
        throw new HttpsError('permission-denied', 'Can only view own sponsor account');
      }
    }

    // Get sponsor status
    const sponsorStatus = await sponsorService.getSponsorStatus(validatedData.sponsorAddress);

    return {
      success: true,
      data: sponsorStatus
    };
  } catch (error) {
    logger.error('getSponsorStatusFn error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: request.data,
      userId: request.auth?.uid
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', `Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }

    throw new HttpsError('internal', 'Failed to get sponsor status');
  }
});

/**
 * Whitelists a user for a sponsor
 * @param data Whitelist data
 * @param context Firebase function context
 * @returns Updated whitelist
 */
export const whitelistUserFn = onCall({
  maxInstances: 20,
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  try {
    // Rate limiting
    const clientIP = request.rawRequest.ip;
    if (!rateLimit.checkLimit(clientIP, 'whitelistUser', 20, 60000)) { // 20 requests per minute
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
    }

    // Validate input
    const validatedData = WhitelistUserSchema.parse(request.data);

    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has admin or operator role
    const userRoles = request.auth.token.roles || [];
    const isAdmin = userRoles.includes('admin');
    const isOperator = userRoles.includes('operator');
    
    if (!isAdmin && !isOperator) {
      throw new HttpsError('permission-denied', 'Admin or operator role required');
    }

    // Whitelist user
    const updatedWhitelist = await sponsorService.whitelistUser(
      validatedData.sponsorAddress,
      validatedData.userAddress,
      validatedData.reason,
      validatedData.trustScore
    );

    // Log analytics event
    logger.info('user_whitelisted', {
      sponsorAddress: validatedData.sponsorAddress,
      userAddress: validatedData.userAddress,
      reason: validatedData.reason,
      trustScore: validatedData.trustScore,
      whitelistedBy: request.auth.uid,
      timestamp: Date.now()
    });

    return {
      success: true,
      data: { whitelistedUsers: updatedWhitelist }
    };
  } catch (error) {
    logger.error('whitelistUserFn error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: request.data,
      userId: request.auth?.uid
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', `Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }

    throw new HttpsError('internal', 'Failed to whitelist user');
  }
});

/**
 * Removes a user from sponsor's whitelist
 * @param data Remove whitelist data
 * @param context Firebase function context
 * @returns Updated whitelist
 */
export const removeWhitelistedUserFn = onCall({
  maxInstances: 20,
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  try {
    // Rate limiting
    const clientIP = request.rawRequest.ip;
    if (!rateLimit.checkLimit(clientIP, 'removeWhitelistedUser', 20, 60000)) { // 20 requests per minute
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
    }

    // Validate input
    const validatedData = RemoveWhitelistUserSchema.parse(request.data);

    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has admin or operator role
    const userRoles = request.auth.token.roles || [];
    const isAdmin = userRoles.includes('admin');
    const isOperator = userRoles.includes('operator');
    
    if (!isAdmin && !isOperator) {
      throw new HttpsError('permission-denied', 'Admin or operator role required');
    }

    // Remove user from whitelist
    const updatedWhitelist = await sponsorService.removeWhitelistedUser(
      validatedData.sponsorAddress,
      validatedData.userAddress
    );

    // Log analytics event
    logger.info('user_removed_from_whitelist', {
      sponsorAddress: validatedData.sponsorAddress,
      userAddress: validatedData.userAddress,
      removedBy: request.auth.uid,
      timestamp: Date.now()
    });

    return {
      success: true,
      data: { whitelistedUsers: updatedWhitelist }
    };
  } catch (error) {
    logger.error('removeWhitelistedUserFn error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: request.data,
      userId: request.auth?.uid
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', `Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }

    throw new HttpsError('internal', 'Failed to remove whitelisted user');
  }
});

/**
 * Removes a sponsor
 * @param data Sponsor address
 * @param context Firebase function context
 * @returns Success status
 */
export const removeSponsorFn = onCall({
  maxInstances: 10,
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  try {
    // Rate limiting
    const clientIP = request.rawRequest.ip;
    if (!rateLimit.checkLimit(clientIP, 'removeSponsor', 5, 60000)) { // 5 requests per minute
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
    }

    // Validate input
    const validatedData = RemoveSponsorSchema.parse(request.data);

    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has admin role
    const userRoles = request.auth.token.roles || [];
    if (!userRoles.includes('admin')) {
      throw new HttpsError('permission-denied', 'Admin role required');
    }

    // Remove sponsor
    const success = await sponsorService.removeSponsor(validatedData.sponsorAddress);

    // Log analytics event
    logger.info('sponsor_removed', {
      sponsorAddress: validatedData.sponsorAddress,
      removedBy: request.auth.uid,
      timestamp: Date.now()
    });

    return {
      success: true,
      data: { removed: success }
    };
  } catch (error) {
    logger.error('removeSponsorFn error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: request.data,
      userId: request.auth?.uid
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', `Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }

    throw new HttpsError('internal', 'Failed to remove sponsor');
  }
});

/**
 * Updates gas usage for a sponsor
 * @param data Gas usage data
 * @param context Firebase function context
 * @returns Success status
 */
export const updateGasUsageFn = onCall({
  maxInstances: 100,
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  try {
    // Rate limiting
    const clientIP = request.rawRequest.ip;
    if (!rateLimit.checkLimit(clientIP, 'updateGasUsage', 100, 60000)) { // 100 requests per minute
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
    }

    // Validate input
    const validatedData = UpdateGasUsageSchema.parse(request.data);

    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Update gas usage
    await sponsorService.updateGasUsage(
      validatedData.sponsorAddress,
      validatedData.gasCost,
      validatedData.userAddress
    );

    // Log analytics event
    logger.info('gas_paid', {
      sponsorAddress: validatedData.sponsorAddress,
      userAddress: validatedData.userAddress,
      gasCost: validatedData.gasCost,
      timestamp: Date.now()
    });

    return {
      success: true,
      data: { updated: true }
    };
  } catch (error) {
    logger.error('updateGasUsageFn error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: request.data,
      userId: request.auth?.uid
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', `Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }

    throw new HttpsError('internal', 'Failed to update gas usage');
  }
});

/**
 * Gets all sponsors with optional filtering
 * @param data Filter options
 * @param context Firebase function context
 * @returns Array of sponsors
 */
export const getAllSponsorsFn = onCall({
  maxInstances: 20,
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  try {
    // Rate limiting
    const clientIP = request.rawRequest.ip;
    if (!rateLimit.checkLimit(clientIP, 'getAllSponsors', 20, 60000)) { // 20 requests per minute
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
    }

    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has admin role
    const userRoles = request.auth.token.roles || [];
    if (!userRoles.includes('admin')) {
      throw new HttpsError('permission-denied', 'Admin role required');
    }

    // Get filters from request data
    const filters = request.data?.filters || {};

    // Get all sponsors
    const sponsors = await sponsorService.getAllSponsors(filters);

    return {
      success: true,
      data: { sponsors }
    };
  } catch (error) {
    logger.error('getAllSponsorsFn error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: request.data,
      userId: request.auth?.uid
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', 'Failed to get sponsors');
  }
});

// ============ Firestore Triggers ============

/**
 * Trigger when a sponsor document is deleted
 * Archives sponsor data and cleans up related documents
 */
export const onSponsorDeleted = onDocumentDeleted('sponsors/{sponsorId}', async (event) => {
  try {
    const sponsorId = event.params.sponsorId;
    const sponsorData = event.data?.data();

    if (sponsorData) {
      logger.info('sponsor_document_deleted', {
        sponsorId,
        sponsorData,
        timestamp: Date.now()
      });

      // Additional cleanup logic can be added here
      // For example, cleaning up analytics, whitelist entries, etc.
    }
  } catch (error) {
    logger.error('onSponsorDeleted error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sponsorId: event.params.sponsorId,
      timestamp: Date.now()
    });
  }
}); 