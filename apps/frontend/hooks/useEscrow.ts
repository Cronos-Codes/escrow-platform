import { useState, useCallback } from 'react';
import { useAuth } from '../../../packages/auth/src';
import { EscrowState, EscrowEvent } from '../../../packages/core/src/fsm';
import { 
  CreateDealInput, 
  FundDealInput, 
  ApproveMilestoneInput, 
  ReleaseFundsInput, 
  RaiseDisputeInput, 
  CancelDealInput,
  DealResponse,
  DealListResponse,
  DealFilter
} from '../../../packages/schemas/src/escrow';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/your-project/us-central1';

// Helper function to call Firebase Functions
async function callFunction<T>(functionName: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Function call failed');
  }

  const result = await response.json();
  return result.result;
}

export function useCreateDeal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createDeal = useCallback(async (dealData: CreateDealInput) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await callFunction<{ success: boolean; dealId: string; txHash: string; deal: DealResponse }>(
        'createDealFn',
        dealData
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    createDeal,
    loading,
    error,
  };
}

export function useFundDeal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fundDeal = useCallback(async (fundData: FundDealInput) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await callFunction<{ success: boolean; dealId: string; newState: EscrowState; txHash: string }>(
        'fundDealFn',
        fundData
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fund deal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    fundDeal,
    loading,
    error,
  };
}

export function useApproveMilestone() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const approveMilestone = useCallback(async (approvalData: ApproveMilestoneInput) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await callFunction<{ success: boolean; dealId: string; newState: EscrowState; txHash: string }>(
        'approveMilestoneFn',
        approvalData
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve milestone';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    approveMilestone,
    loading,
    error,
  };
}

export function useReleaseFunds() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const releaseFunds = useCallback(async (releaseData: ReleaseFundsInput) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await callFunction<{ success: boolean; dealId: string; newState: EscrowState; txHash: string }>(
        'releaseFundsFn',
        releaseData
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to release funds';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    releaseFunds,
    loading,
    error,
  };
}

export function useRaiseDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const raiseDispute = useCallback(async (disputeData: RaiseDisputeInput) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await callFunction<{ success: boolean; dealId: string; newState: EscrowState; txHash: string }>(
        'raiseDisputeFn',
        disputeData
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to raise dispute';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    raiseDispute,
    loading,
    error,
  };
}

export function useCancelDeal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const cancelDeal = useCallback(async (cancelData: CancelDealInput) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await callFunction<{ success: boolean; dealId: string; newState: EscrowState; txHash: string }>(
        'cancelDealFn',
        cancelData
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel deal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    cancelDeal,
    loading,
    error,
  };
}

export function useGetDeals() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getDeals = useCallback(async (filters: DealFilter = {}) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await callFunction<DealListResponse>(
        'getDealsFn',
        filters
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get deals';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    getDeals,
    loading,
    error,
  };
}

export function useGetDeal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getDeal = useCallback(async (dealId: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await callFunction<{ success: boolean; deal: DealResponse; logs: any[] }>(
        'getDealFn',
        dealId
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get deal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    getDeal,
    loading,
    error,
  };
}

// Utility hook for getting allowed actions based on current state
export function useAllowedActions(currentState: EscrowState, userRole: string) {
  const getAllowedActions = useCallback(() => {
    const actions: Array<{ event: EscrowEvent; label: string; description: string }> = [];

    switch (currentState) {
      case EscrowState.Created:
        if (userRole === 'PAYER') {
          actions.push({
            event: EscrowEvent.Fund,
            label: 'Fund Deal',
            description: 'Fund the escrow deal with the required amount'
          });
        }
        if (userRole === 'ADMIN') {
          actions.push({
            event: EscrowEvent.Cancel,
            label: 'Cancel Deal',
            description: 'Cancel the deal and refund any funds'
          });
        }
        break;

      case EscrowState.Funded:
        if (userRole === 'ARBITER') {
          actions.push({
            event: EscrowEvent.Approve,
            label: 'Approve Milestone',
            description: 'Approve the deal for release'
          });
        }
        if (userRole === 'PAYER' || userRole === 'PAYEE') {
          actions.push({
            event: EscrowEvent.Dispute,
            label: 'Raise Dispute',
            description: 'Raise a dispute on the deal'
          });
        }
        if (userRole === 'ADMIN') {
          actions.push({
            event: EscrowEvent.Cancel,
            label: 'Cancel Deal',
            description: 'Cancel the deal and refund funds'
          });
        }
        break;

      case EscrowState.Approved:
        if (userRole === 'ARBITER') {
          actions.push({
            event: EscrowEvent.Release,
            label: 'Release Funds',
            description: 'Release funds to the payee'
          });
        }
        if (userRole === 'PAYER' || userRole === 'PAYEE') {
          actions.push({
            event: EscrowEvent.Dispute,
            label: 'Raise Dispute',
            description: 'Raise a dispute on the deal'
          });
        }
        if (userRole === 'ADMIN') {
          actions.push({
            event: EscrowEvent.Cancel,
            label: 'Cancel Deal',
            description: 'Cancel the deal and refund funds'
          });
        }
        break;

      case EscrowState.Disputed:
        if (userRole === 'ADMIN') {
          actions.push({
            event: EscrowEvent.Cancel,
            label: 'Cancel Deal',
            description: 'Cancel the deal and refund funds'
          });
        }
        break;

      case EscrowState.Released:
      case EscrowState.Cancelled:
        // No actions available for terminal states
        break;
    }

    return actions;
  }, [currentState, userRole]);

  return { getAllowedActions };
}

// Hook for real-time deal updates (using Firebase real-time listeners)
export function useDealSubscription(dealId: string) {
  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This would be implemented with Firebase real-time listeners
  // For now, we'll use a polling approach
  const subscribeToDeal = useCallback(async () => {
    try {
      setLoading(true);
      // Implementation would use Firebase onSnapshot
      // For now, just fetch the deal
      const response = await fetch(`${API_BASE_URL}/getDealFn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dealId }),
      });

      if (response.ok) {
        const result = await response.json();
        setDeal(result.result.deal);
      } else {
        setError('Failed to fetch deal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to deal');
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  return {
    deal,
    loading,
    error,
    subscribeToDeal,
  };
} 