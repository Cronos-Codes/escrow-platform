import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { ethers } from 'ethers';
import { 
  transition, 
  EscrowState, 
  EscrowEvent, 
  EscrowFSMError 
} from '../../../packages/core/src/fsm';
import {
  CreateDealSchema,
  FundDealSchema,
  ApproveMilestoneSchema,
  ReleaseFundsSchema,
  RaiseDisputeSchema,
  CancelDealSchema,
  DealFilterSchema,
  type CreateDealInput,
  type FundDealInput,
  type ApproveMilestoneInput,
  type ReleaseFundsInput,
  type RaiseDisputeInput,
  type CancelDealInput,
  type DealFilter
} from '../../../packages/schemas/src/escrow';
import { logFSMEvent } from './fsmLogger';

const db = getFirestore();

// Escrow contract ABI (simplified for this implementation)
const ESCROW_ABI = [
  'function createDeal(address payer, address payee, address token, uint256 amount, string memory metadata) external returns (uint256)',
  'function fundDeal(uint256 dealId) external payable',
  'function approveMilestone(uint256 dealId) external',
  'function releaseFunds(uint256 dealId) external',
  'function raiseDispute(uint256 dealId, string memory reason) external',
  'function cancelDeal(uint256 dealId, string memory reason) external',
  'function getDealState(uint256 dealId) external view returns (uint8)',
  'function getDeal(uint256 dealId) external view returns (tuple(address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,string))',
  'event DealCreated(uint256 indexed dealId, address indexed payer, address indexed payee, address token, uint256 amount, string metadata)',
  'event DealFunded(uint256 indexed dealId, address indexed funder, uint256 amount)',
  'event DealApproved(uint256 indexed dealId, address indexed arbiter)',
  'event FundsReleased(uint256 indexed dealId, address indexed payee, uint256 amount)',
  'event DisputeRaised(uint256 indexed dealId, address indexed disputer, string reason)',
  'event DealCancelled(uint256 indexed dealId, address indexed canceller, string reason)',
  'event StateChanged(uint256 indexed dealId, uint8 oldState, uint8 newState)'
];

// Get provider and contract instance
function getProvider() {
  const rpcUrl = process.env.RPC_URL_TESTNET || process.env.RPC_URL_MAINNET;
  if (!rpcUrl) {
    throw new Error('RPC URL not configured');
  }
  return new ethers.JsonRpcProvider(rpcUrl);
}

function getEscrowContract(contractAddress: string) {
  const provider = getProvider();
  const privateKey = process.env.ESCROW_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Escrow private key not configured');
  }
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, ESCROW_ABI, wallet);
}

/**
 * Create a new escrow deal
 */
export const createDealFn = functions.https.onCall(async (data: CreateDealInput, context) => {
  try {
    // Validate input
    const validatedData = CreateDealSchema.parse(data);
    
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has creator role
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'User not found');
    }

    const userData = userDoc.data();
    if (!userData?.roles?.includes('CREATOR')) {
      throw new functions.https.HttpsError('permission-denied', 'User does not have creator role');
    }

    // Get contract address from environment
    const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new functions.https.HttpsError('internal', 'Contract address not configured');
    }

    const contract = getEscrowContract(contractAddress);

    // Create deal on blockchain
    const tx = await contract.createDeal(
      validatedData.payer,
      validatedData.payee,
      validatedData.token || ethers.ZeroAddress,
      ethers.parseEther(validatedData.amount),
      validatedData.metadata || ''
    );

    const receipt = await tx.wait();
    
    // Extract deal ID from event
    const dealCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'DealCreated';
      } catch {
        return false;
      }
    });

    if (!dealCreatedEvent) {
      throw new functions.https.HttpsError('internal', 'Failed to extract deal ID from transaction');
    }

    const parsedEvent = contract.interface.parseLog(dealCreatedEvent);
    const dealId = parsedEvent.args[0].toString();

    // Store deal in Firestore
    const dealData = {
      dealId,
      payer: validatedData.payer,
      payee: validatedData.payee,
      token: validatedData.token || null,
      amount: validatedData.amount,
      metadata: validatedData.metadata || null,
      state: EscrowState.Created,
      contractAddress,
      createdAt: Date.now(),
      createdBy: context.auth.uid,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };

    await db.collection('deals').doc(dealId).set(dealData);

    // Log FSM event
    await logFSMEvent({
      dealId,
      actor: context.auth.uid,
      prevState: EscrowState.Created,
      event: EscrowEvent.Create,
      newState: EscrowState.Created,
      metadata: { txHash: receipt.hash }
    });

    return {
      success: true,
      dealId,
      txHash: receipt.hash,
      deal: dealData
    };

  } catch (error) {
    console.error('createDealFn error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof EscrowFSMError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }

    throw new functions.https.HttpsError('internal', 'Failed to create deal');
  }
});

/**
 * Fund an escrow deal
 */
export const fundDealFn = functions.https.onCall(async (data: FundDealInput, context) => {
  try {
    // Validate input
    const validatedData = FundDealSchema.parse(data);
    
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Get deal from Firestore
    const dealDoc = await db.collection('deals').doc(validatedData.dealId).get();
    if (!dealDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Deal not found');
    }

    const dealData = dealDoc.data();
    if (!dealData) {
      throw new functions.https.HttpsError('not-found', 'Deal data not found');
    }

    // Check if deal is in correct state
    if (dealData.state !== EscrowState.Created) {
      throw new functions.https.HttpsError('failed-precondition', 'Deal is not in Created state');
    }

    // Check if user is the payer
    if (dealData.payer !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only payer can fund the deal');
    }

    const contract = getEscrowContract(dealData.contractAddress);

    // Fund deal on blockchain
    let tx;
    if (dealData.token) {
      // ERC20 token funding
      const tokenContract = new ethers.Contract(
        dealData.token,
        ['function transferFrom(address,address,uint256)'],
        contract.signer
      );
      
      tx = await tokenContract.transferFrom(
        context.auth.uid,
        dealData.contractAddress,
        ethers.parseEther(dealData.amount)
      );
    } else {
      // Native ETH funding
      tx = await contract.fundDeal(validatedData.dealId, {
        value: ethers.parseEther(dealData.amount)
      });
    }

    const receipt = await tx.wait();

    // Update deal state in Firestore
    const newState = transition(EscrowState.Created, EscrowEvent.Fund);
    await db.collection('deals').doc(validatedData.dealId).update({
      state: newState,
      fundedAt: Date.now(),
      fundedBy: context.auth.uid,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });

    // Log FSM event
    await logFSMEvent({
      dealId: validatedData.dealId,
      actor: context.auth.uid,
      prevState: EscrowState.Created,
      event: EscrowEvent.Fund,
      newState,
      metadata: { txHash: receipt.hash }
    });

    return {
      success: true,
      dealId: validatedData.dealId,
      newState,
      txHash: receipt.hash
    };

  } catch (error) {
    console.error('fundDealFn error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof EscrowFSMError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }

    throw new functions.https.HttpsError('internal', 'Failed to fund deal');
  }
});

/**
 * Approve a milestone
 */
export const approveMilestoneFn = functions.https.onCall(async (data: ApproveMilestoneInput, context) => {
  try {
    // Validate input
    const validatedData = ApproveMilestoneSchema.parse(data);
    
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has arbiter role
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'User not found');
    }

    const userData = userDoc.data();
    if (!userData?.roles?.includes('ARBITER')) {
      throw new functions.https.HttpsError('permission-denied', 'User does not have arbiter role');
    }

    // Get deal from Firestore
    const dealDoc = await db.collection('deals').doc(validatedData.dealId).get();
    if (!dealDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Deal not found');
    }

    const dealData = dealDoc.data();
    if (!dealData) {
      throw new functions.https.HttpsError('not-found', 'Deal data not found');
    }

    // Check if deal is in correct state
    if (dealData.state !== EscrowState.Funded) {
      throw new functions.https.HttpsError('failed-precondition', 'Deal is not in Funded state');
    }

    const contract = getEscrowContract(dealData.contractAddress);

    // Approve milestone on blockchain
    const tx = await contract.approveMilestone(validatedData.dealId);
    const receipt = await tx.wait();

    // Update deal state in Firestore
    const newState = transition(EscrowState.Funded, EscrowEvent.Approve);
    await db.collection('deals').doc(validatedData.dealId).update({
      state: newState,
      approvedAt: Date.now(),
      approvedBy: context.auth.uid,
      approvalReason: validatedData.reason,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });

    // Log FSM event
    await logFSMEvent({
      dealId: validatedData.dealId,
      actor: context.auth.uid,
      prevState: EscrowState.Funded,
      event: EscrowEvent.Approve,
      newState,
      metadata: { 
        txHash: receipt.hash,
        reason: validatedData.reason
      }
    });

    return {
      success: true,
      dealId: validatedData.dealId,
      newState,
      txHash: receipt.hash
    };

  } catch (error) {
    console.error('approveMilestoneFn error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof EscrowFSMError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }

    throw new functions.https.HttpsError('internal', 'Failed to approve milestone');
  }
});

/**
 * Release funds
 */
export const releaseFundsFn = functions.https.onCall(async (data: ReleaseFundsInput, context) => {
  try {
    // Validate input
    const validatedData = ReleaseFundsSchema.parse(data);
    
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has arbiter role
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'User not found');
    }

    const userData = userDoc.data();
    if (!userData?.roles?.includes('ARBITER')) {
      throw new functions.https.HttpsError('permission-denied', 'User does not have arbiter role');
    }

    // Get deal from Firestore
    const dealDoc = await db.collection('deals').doc(validatedData.dealId).get();
    if (!dealDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Deal not found');
    }

    const dealData = dealDoc.data();
    if (!dealData) {
      throw new functions.https.HttpsError('not-found', 'Deal data not found');
    }

    // Check if deal is in correct state
    if (dealData.state !== EscrowState.Approved) {
      throw new functions.https.HttpsError('failed-precondition', 'Deal is not in Approved state');
    }

    const contract = getEscrowContract(dealData.contractAddress);

    // Release funds on blockchain
    const tx = await contract.releaseFunds(validatedData.dealId);
    const receipt = await tx.wait();

    // Update deal state in Firestore
    const newState = transition(EscrowState.Approved, EscrowEvent.Release);
    await db.collection('deals').doc(validatedData.dealId).update({
      state: newState,
      releasedAt: Date.now(),
      releasedBy: context.auth.uid,
      releaseReason: validatedData.reason,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });

    // Log FSM event
    await logFSMEvent({
      dealId: validatedData.dealId,
      actor: context.auth.uid,
      prevState: EscrowState.Approved,
      event: EscrowEvent.Release,
      newState,
      metadata: { 
        txHash: receipt.hash,
        reason: validatedData.reason
      }
    });

    return {
      success: true,
      dealId: validatedData.dealId,
      newState,
      txHash: receipt.hash
    };

  } catch (error) {
    console.error('releaseFundsFn error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof EscrowFSMError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }

    throw new functions.https.HttpsError('internal', 'Failed to release funds');
  }
});

/**
 * Raise a dispute
 */
export const raiseDisputeFn = functions.https.onCall(async (data: RaiseDisputeInput, context) => {
  try {
    // Validate input
    const validatedData = RaiseDisputeSchema.parse(data);
    
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Get deal from Firestore
    const dealDoc = await db.collection('deals').doc(validatedData.dealId).get();
    if (!dealDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Deal not found');
    }

    const dealData = dealDoc.data();
    if (!dealData) {
      throw new functions.https.HttpsError('not-found', 'Deal data not found');
    }

    // Check if user is involved in the deal
    if (dealData.payer !== context.auth.uid && dealData.payee !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'User is not involved in this deal');
    }

    // Check if deal is in correct state
    if (dealData.state !== EscrowState.Funded && dealData.state !== EscrowState.Approved) {
      throw new functions.https.HttpsError('failed-precondition', 'Deal is not in Funded or Approved state');
    }

    const contract = getEscrowContract(dealData.contractAddress);

    // Raise dispute on blockchain
    const tx = await contract.raiseDispute(validatedData.dealId, validatedData.reason);
    const receipt = await tx.wait();

    // Update deal state in Firestore
    const newState = transition(dealData.state, EscrowEvent.Dispute);
    await db.collection('deals').doc(validatedData.dealId).update({
      state: newState,
      disputedAt: Date.now(),
      disputedBy: context.auth.uid,
      disputeReason: validatedData.reason,
      disputeEvidence: validatedData.evidence || null,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });

    // Log FSM event
    await logFSMEvent({
      dealId: validatedData.dealId,
      actor: context.auth.uid,
      prevState: dealData.state,
      event: EscrowEvent.Dispute,
      newState,
      metadata: { 
        txHash: receipt.hash,
        reason: validatedData.reason,
        evidence: validatedData.evidence
      }
    });

    return {
      success: true,
      dealId: validatedData.dealId,
      newState,
      txHash: receipt.hash
    };

  } catch (error) {
    console.error('raiseDisputeFn error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof EscrowFSMError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }

    throw new functions.https.HttpsError('internal', 'Failed to raise dispute');
  }
});

/**
 * Cancel a deal
 */
export const cancelDealFn = functions.https.onCall(async (data: CancelDealInput, context) => {
  try {
    // Validate input
    const validatedData = CancelDealSchema.parse(data);
    
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user has admin role
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'User not found');
    }

    const userData = userDoc.data();
    if (!userData?.roles?.includes('ADMIN')) {
      throw new functions.https.HttpsError('permission-denied', 'User does not have admin role');
    }

    // Get deal from Firestore
    const dealDoc = await db.collection('deals').doc(validatedData.dealId).get();
    if (!dealDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Deal not found');
    }

    const dealData = dealDoc.data();
    if (!dealData) {
      throw new functions.https.HttpsError('not-found', 'Deal data not found');
    }

    // Check if deal can be cancelled
    if (dealData.state === EscrowState.Released) {
      throw new functions.https.HttpsError('failed-precondition', 'Cannot cancel released deals');
    }

    const contract = getEscrowContract(dealData.contractAddress);

    // Cancel deal on blockchain
    const tx = await contract.cancelDeal(validatedData.dealId, validatedData.reason);
    const receipt = await tx.wait();

    // Update deal state in Firestore
    const newState = transition(dealData.state, EscrowEvent.Cancel);
    await db.collection('deals').doc(validatedData.dealId).update({
      state: newState,
      cancelledAt: Date.now(),
      cancelledBy: context.auth.uid,
      cancellationReason: validatedData.reason,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });

    // Log FSM event
    await logFSMEvent({
      dealId: validatedData.dealId,
      actor: context.auth.uid,
      prevState: dealData.state,
      event: EscrowEvent.Cancel,
      newState,
      metadata: { 
        txHash: receipt.hash,
        reason: validatedData.reason
      }
    });

    return {
      success: true,
      dealId: validatedData.dealId,
      newState,
      txHash: receipt.hash
    };

  } catch (error) {
    console.error('cancelDealFn error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    if (error instanceof EscrowFSMError) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }

    throw new functions.https.HttpsError('internal', 'Failed to cancel deal');
  }
});

/**
 * Get deals with filtering and pagination
 */
export const getDealsFn = functions.https.onCall(async (data: DealFilter, context) => {
  try {
    // Validate input
    const validatedData = DealFilterSchema.parse(data);
    
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Build query
    let query = db.collection('deals');

    // Apply filters
    if (validatedData.state) {
      query = query.where('state', '==', validatedData.state);
    }
    if (validatedData.payer) {
      query = query.where('payer', '==', validatedData.payer);
    }
    if (validatedData.payee) {
      query = query.where('payee', '==', validatedData.payee);
    }
    if (validatedData.token) {
      query = query.where('token', '==', validatedData.token);
    }

    // Apply sorting
    query = query.orderBy(validatedData.sortBy, validatedData.sortOrder);

    // Apply pagination
    const offset = (validatedData.page - 1) * validatedData.limit;
    query = query.offset(offset).limit(validatedData.limit + 1); // +1 to check if there are more

    const snapshot = await query.get();
    const deals = snapshot.docs.slice(0, validatedData.limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const hasMore = snapshot.docs.length > validatedData.limit;

    return {
      success: true,
      deals,
      total: deals.length,
      page: validatedData.page,
      limit: validatedData.limit,
      hasMore
    };

  } catch (error) {
    console.error('getDealsFn error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError('internal', 'Failed to get deals');
  }
});

/**
 * Get a single deal by ID
 */
export const getDealFn = functions.https.onCall(async (dealId: string, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Get deal from Firestore
    const dealDoc = await db.collection('deals').doc(dealId).get();
    if (!dealDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Deal not found');
    }

    const dealData = dealDoc.data();
    if (!dealData) {
      throw new functions.https.HttpsError('not-found', 'Deal data not found');
    }

    // Get FSM logs
    const logsSnapshot = await db.collection('deals').doc(dealId).collection('fsmLogs').orderBy('timestamp', 'desc').get();
    const logs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      deal: {
        id: dealDoc.id,
        ...dealData
      },
      logs
    };

  } catch (error) {
    console.error('getDealFn error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError('internal', 'Failed to get deal');
  }
}); 