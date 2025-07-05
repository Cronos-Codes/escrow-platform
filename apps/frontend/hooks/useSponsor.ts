import { useState, useCallback } from 'react';
import { sponsorService, Sponsor, SponsorProfile } from '@escrow/paymaster';

// ============ Create Sponsor Hook ============

export const useCreateSponsor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSponsor = useCallback(async (profile: SponsorProfile): Promise<Sponsor | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const sponsor = await sponsorService.createSponsor(profile);
      return sponsor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sponsor';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createSponsor,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Deposit Sponsor Hook ============

export const useDepositSponsor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depositSponsor = useCallback(async (
    sponsorAddress: string, 
    amount: string, 
    transactionHash?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const newBalance = await sponsorService.depositFunds(sponsorAddress, amount, transactionHash);
      return newBalance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit funds';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    depositSponsor,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Whitelist User Hook ============

export const useWhitelistUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whitelistUser = useCallback(async (
    sponsorAddress: string,
    userAddress: string,
    reason?: string,
    trustScore?: number
  ): Promise<string[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedWhitelist = await sponsorService.whitelistUser(
        sponsorAddress,
        userAddress,
        reason,
        trustScore
      );
      return updatedWhitelist;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to whitelist user';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeWhitelistedUser = useCallback(async (
    sponsorAddress: string,
    userAddress: string
  ): Promise<string[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedWhitelist = await sponsorService.removeWhitelistedUser(
        sponsorAddress,
        userAddress
      );
      return updatedWhitelist;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove whitelisted user';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    whitelistUser,
    removeWhitelistedUser,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Get Sponsor Status Hook ============

export const useGetSponsorStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sponsorStatus, setSponsorStatus] = useState<Sponsor | null>(null);

  const getSponsorStatus = useCallback(async (sponsorAddress: string): Promise<Sponsor | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const status = await sponsorService.getSponsorStatus(sponsorAddress);
      setSponsorStatus(status);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get sponsor status';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getSponsorStatus,
    sponsorStatus,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Remove Sponsor Hook ============

export const useRemoveSponsor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeSponsor = useCallback(async (sponsorAddress: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await sponsorService.removeSponsor(sponsorAddress);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove sponsor';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    removeSponsor,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Revoke Escrow Hook ============

export const useRevokeEscrow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokeEscrow = useCallback(async (
    escrowId: string, 
    reason: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // This would call the paymaster contract's revokeEscrow function
      // For now, we'll simulate the call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Escrow revoked:', { escrowId, reason });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke escrow';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    revokeEscrow,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Force Transfer Hook ============

export const useForceTransfer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forceTransfer = useCallback(async (
    fromAddress: string,
    toAddress: string,
    amount: string,
    reason: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // This would call the paymaster contract's forceWithdraw function
      // For now, we'll simulate the call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Force transfer executed:', { fromAddress, toAddress, amount, reason });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute force transfer';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    forceTransfer,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Get All Sponsors Hook ============

export const useGetAllSponsors = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  const getAllSponsors = useCallback(async (filters?: {
    isActive?: boolean;
    minBalance?: string;
    maxBalance?: string;
  }): Promise<Sponsor[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const allSponsors = await sponsorService.getAllSponsors(filters);
      setSponsors(allSponsors);
      return allSponsors;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get sponsors';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getAllSponsors,
    sponsors,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Update Gas Usage Hook ============

export const useUpdateGasUsage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGasUsage = useCallback(async (
    sponsorAddress: string,
    gasCost: string,
    userAddress: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await sponsorService.updateGasUsage(sponsorAddress, gasCost, userAddress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update gas usage';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateGasUsage,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Sponsor Analytics Hook ============

export const useSponsorAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  const getAnalytics = useCallback(async (sponsorAddress: string): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const sponsorStatus = await sponsorService.getSponsorStatus(sponsorAddress);
      setAnalytics(sponsorStatus.analytics);
      return sponsorStatus.analytics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get analytics';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getAnalytics,
    analytics,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// ============ Composite Hook for Sponsor Management ============

export const useSponsorManagement = () => {
  const createSponsorHook = useCreateSponsor();
  const depositSponsorHook = useDepositSponsor();
  const whitelistUserHook = useWhitelistUser();
  const getSponsorStatusHook = useGetSponsorStatus();
  const removeSponsorHook = useRemoveSponsor();
  const revokeEscrowHook = useRevokeEscrow();
  const forceTransferHook = useForceTransfer();
  const getAllSponsorsHook = useGetAllSponsors();
  const updateGasUsageHook = useUpdateGasUsage();
  const analyticsHook = useSponsorAnalytics();

  return {
    // Create and manage sponsors
    createSponsor: createSponsorHook.createSponsor,
    depositSponsor: depositSponsorHook.depositSponsor,
    removeSponsor: removeSponsorHook.removeSponsor,
    
    // Whitelist management
    whitelistUser: whitelistUserHook.whitelistUser,
    removeWhitelistedUser: whitelistUserHook.removeWhitelistedUser,
    
    // Status and analytics
    getSponsorStatus: getSponsorStatusHook.getSponsorStatus,
    getAllSponsors: getAllSponsorsHook.getAllSponsors,
    getAnalytics: analyticsHook.getAnalytics,
    
    // Admin actions
    revokeEscrow: revokeEscrowHook.revokeEscrow,
    forceTransfer: forceTransferHook.forceTransfer,
    
    // Gas usage
    updateGasUsage: updateGasUsageHook.updateGasUsage,
    
    // State
    isLoading: createSponsorHook.isLoading || 
               depositSponsorHook.isLoading || 
               whitelistUserHook.isLoading || 
               getSponsorStatusHook.isLoading || 
               removeSponsorHook.isLoading || 
               revokeEscrowHook.isLoading || 
               forceTransferHook.isLoading || 
               getAllSponsorsHook.isLoading || 
               updateGasUsageHook.isLoading || 
               analyticsHook.isLoading,
    
    error: createSponsorHook.error || 
           depositSponsorHook.error || 
           whitelistUserHook.error || 
           getSponsorStatusHook.error || 
           removeSponsorHook.error || 
           revokeEscrowHook.error || 
           forceTransferHook.error || 
           getAllSponsorsHook.error || 
           updateGasUsageHook.error || 
           analyticsHook.error,
    
    clearError: () => {
      createSponsorHook.clearError();
      depositSponsorHook.clearError();
      whitelistUserHook.clearError();
      getSponsorStatusHook.clearError();
      removeSponsorHook.clearError();
      revokeEscrowHook.clearError();
      forceTransferHook.clearError();
      getAllSponsorsHook.clearError();
      updateGasUsageHook.clearError();
      analyticsHook.clearError();
    },
    
    // Data
    sponsorStatus: getSponsorStatusHook.sponsorStatus,
    sponsors: getAllSponsorsHook.sponsors,
    analytics: analyticsHook.analytics
  };
}; 