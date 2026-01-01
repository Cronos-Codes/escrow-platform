import * as functions from 'firebase-functions';

// Export health check endpoint
export { healthCheckFn } from './healthCheck';

// Export authentication functions
export {
  loginPhone,
  verifyPhoneOtp,
  loginEmail,
  verifyEmailOtp,
  walletLogin
} from './auth';

// Export escrow functions
export {
  createDealFn,
  fundDealFn,
  approveMilestoneFn,
  releaseFundsFn,
  raiseDisputeFn,
  cancelDealFn,
  getDealsFn,
  getDealFn
} from './escrowFunctions';

// Export dispute functions
export {
  fileDisputeFn,
  voteDisputeFn,
  resolveDisputeFn
} from './disputeFunctions';

// Export paymaster functions
export {
  createSponsorFn,
  depositSponsorFn,
  getSponsorStatusFn,
  whitelistUserFn
} from './paymasterFunctions';

// Export admin functions
export {
  promoteUser,
  revokeEscrow,
  getUserManagementData
} from './adminFunctions';

// Legacy hello endpoint (can be removed in production)
export const helloEscrow = functions.https.onRequest((request, response) => {
  response.json({
    message: 'Hello from Escrow Backend',
    timestamp: new Date().toISOString(),
    phase: 'Production Ready',
    status: 'All systems operational'
  });
}); 