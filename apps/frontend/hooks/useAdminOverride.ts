import { useState, useCallback } from 'react';
import { adminOverrideDispute } from '../api/dispute';
import { useAuth } from '@escrow/auth';

export function useAdminOverride() {
  const { user } = useAuth();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (disputeId: string, overrideData: any) => {
    if (!user?.roles?.includes('admin') && !user?.roles?.includes('super_arbiter')) {
      setError('You do not have permission for admin override.');
      return false;
    }
    setIsExecuting(true);
    setError(null);
    try {
      await adminOverrideDispute(disputeId, overrideData);
      setIsExecuting(false);
      return true;
    } catch (e: any) {
      setError(e.message || 'Override failed');
      setIsExecuting(false);
      return false;
    }
  }, [user]);

  return {
    executeOverride: execute,
    isExecuting,
    error,
  };
} 