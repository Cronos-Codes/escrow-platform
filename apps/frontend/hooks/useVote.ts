import { useState, useCallback } from 'react';
import { useAuth } from '@escrow/auth';
import { voteOnDispute } from '../api/dispute';

export function useVote(disputeId: string) {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVote, setLastVote] = useState<string | null>(null);

  const canVote = user?.roles?.includes('arbiter');

  const vote = useCallback(async (side: 'buyer' | 'seller' | 'neutral') => {
    if (!canVote) {
      setError('You are not eligible to vote.');
      return false;
    }
    setIsVoting(true);
    setError(null);
    try {
      await voteOnDispute(disputeId, side);
      setLastVote(side);
      setIsVoting(false);
      return true;
    } catch (e: any) {
      setError(e.message || 'Voting failed');
      setIsVoting(false);
      return false;
    }
  }, [canVote, disputeId]);

  return {
    canVote,
    isVoting,
    error,
    lastVote,
    vote,
  };
} 