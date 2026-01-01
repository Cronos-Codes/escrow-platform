import { useState, useEffect, useCallback } from 'react';

// Timeframe type - matches @escrow/schemas
export type Timeframe = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

export interface UserDashboardData {
  wallet: {
    totalBalance: number;
    cryptoBalance: number;
    fiatBalance: number;
    goldValue: number;
    currency: string;
    change24h: string;
    trend: 'up' | 'down' | 'stable';
  };
  escrows: {
    active: number;
    pending: number;
    completed: number;
    totalValue: number;
    recentEscrows: Array<{
      id: string;
      title: string;
      amount: number;
      status: string;
      createdAt: number;
      counterparty: string;
    }>;
  };
  transactions: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    recentTransactions: Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
      timestamp: string;
      status: string;
    }>;
  };
  disputes: {
    open: number;
    resolved: number;
    escalated: number;
  };
  analytics: {
    chartData: Array<{
      month: string;
      balance: number;
      escrows: number;
    }>;
    performanceMetrics: {
      successRate: number;
      avgDealDuration: number;
      totalVolume: number;
    };
  };
}

interface UseDashboardReturn {
  data: UserDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTimeframe: (timeframe: Timeframe) => void;
  timeframe: Timeframe;
}

export const useDashboard = (userId?: string): UseDashboardReturn => {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');

  const fetchDashboardData = useCallback(async () => {
    const abortController = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          timeframe,
          userId: userId || 'demo-user-id'
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch dashboard data: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          // If not JSON, use the text or status
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, timeframe]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchDashboardData();
    
    return () => {
      abortController.abort();
    };
  }, [fetchDashboardData]);

  const updateTimeframe = useCallback((newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
    updateTimeframe,
    timeframe,
  };
};

export default useDashboard;
