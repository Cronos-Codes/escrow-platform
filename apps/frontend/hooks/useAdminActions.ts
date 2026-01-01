import { useState, useCallback } from 'react';
import { useAuth } from '../../../packages/auth/src';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/your-project/us-central1';

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

export function useAdminActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const promoteUser = useCallback(async (userId: string, newRole: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callFunction('promoteUser', { userId, newRole, reason });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeEscrow = useCallback(async (escrowId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callFunction('revokeEscrow', { escrowId, reason });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke escrow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moveFundsToAddress = useCallback(async (escrowId: string, targetAddress: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callFunction('moveFundsToAddress', { escrowId, targetAddress, reason });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move funds');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const suspendUser = useCallback(async (userId: string, reason: string, duration: number, durationType: string = 'days') => {
    setLoading(true);
    setError(null);
    try {
      const result = await callFunction('suspendUser', { userId, reason, duration, durationType });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    promoteUser,
    revokeEscrow,
    moveFundsToAddress,
    suspendUser,
    loading,
    error,
  };
} 