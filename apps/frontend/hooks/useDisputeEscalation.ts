import { useState, useCallback } from 'react';
import { escalateDispute } from '../api/dispute';
import { useAuth } from '@escrow/auth';

export function useDisputeEscalation() {
  const { user } = useAuth();
  const [isEscalating, setIsEscalating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const escalate = useCallback(async (disputeId: string, reason: string, level: number) => {
    if (!user?.roles?.includes('arbiter') && !user?.roles?.includes('admin')) {
      setError('You do not have permission to escalate.');
      return false;
    }
    setIsEscalating(true);
    setError(null);
    try {
      await escalateDispute(disputeId, reason, level);
      setIsEscalating(false);
      return true;
    } catch (e: any) {
      setError(e.message || 'Escalation failed');
      setIsEscalating(false);
      return false;
    }
  }, [user]);

  return {
    escalateDispute: escalate,
    isEscalating,
    error,
  };
} 