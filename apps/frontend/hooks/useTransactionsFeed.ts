import { useState, useEffect, useCallback, useRef } from 'react';
import { TransactionData, generateMockTransactions } from '../types/transaction';

export interface UseTransactionsFeedOptions {
  /**
   * Polling interval in milliseconds (default: 2000ms)
   */
  pollInterval?: number;
  
  /**
   * Maximum number of active transactions to display
   */
  maxActive?: number;
  
  /**
   * Enable mock data generation
   */
  useMockData?: boolean;
  
  /**
   * API endpoint for real transactions (future)
   */
  apiEndpoint?: string;
  
  /**
   * WebSocket URL for real-time updates (future)
   */
  websocketUrl?: string;
}

export interface UseTransactionsFeedReturn {
  transactions: TransactionData[];
  activeCount: number;
  addTransaction: (transaction: TransactionData) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<TransactionData>) => void;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for managing real-time transaction feed
 * Supports both mock data and future API/WebSocket integration
 */
export function useTransactionsFeed(
  options: UseTransactionsFeedOptions = {}
): UseTransactionsFeedReturn {
  const {
    pollInterval = 2000,
    maxActive = 30,
    useMockData = true,
    apiEndpoint,
    websocketUrl,
  } = options;

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  /**
   * Fetch transactions from API (future implementation)
   */
  const fetchTransactions = useCallback(async () => {
    if (!apiEndpoint || useMockData) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, useMockData]);

  /**
   * Generate mock transactions periodically
   */
  const generateMockData = useCallback(() => {
    if (!useMockData) {
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Generate 1-3 new transactions every poll interval
    const newTransactionCount = Math.floor(Math.random() * 3) + 1;
    
    setTransactions((prev) => {
      // Ensure prev is an array
      if (!prev || !Array.isArray(prev)) {
        prev = [];
      }
      
      // Remove completed transactions older than 10 seconds
      const filtered = prev.filter((tx) => {
        if (!tx) return false;
        if (tx.status === 'completed') {
          const age = now - tx.timestamp;
          return age < 10000; // Keep for 10 seconds
        }
        return true;
      });

      // Generate new transactions
      const newTransactions = generateMockTransactions(newTransactionCount);
      
      // Combine and limit to maxActive
      const combined = [...filtered, ...newTransactions];
      const sorted = combined.sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));
      
      return sorted.slice(0, maxActive);
    });

    lastUpdateRef.current = now;
  }, [useMockData, maxActive]);

  /**
   * Initialize WebSocket connection (future)
   */
  useEffect(() => {
    if (!websocketUrl || useMockData) {
      return;
    }

    try {
      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transaction') {
            addTransaction(data.transaction);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        setError(new Error('WebSocket connection error'));
        console.error('WebSocket error:', err);
      };

      ws.onclose = () => {
        wsRef.current = null;
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    } catch (err) {
      console.error('Error initializing WebSocket:', err);
    }
  }, [websocketUrl, useMockData]);

  /**
   * Set up polling for API or mock data
   */
  useEffect(() => {
    if (useMockData) {
      // Generate initial batch
      generateMockData();
      
      // Set up interval for mock data generation
      intervalRef.current = setInterval(() => {
        generateMockData();
      }, pollInterval);
    } else if (apiEndpoint) {
      // Fetch initial data
      fetchTransactions();
      
      // Set up polling interval
      intervalRef.current = setInterval(() => {
        fetchTransactions();
      }, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [useMockData, apiEndpoint, pollInterval, fetchTransactions, generateMockData]);

  /**
   * Add a new transaction
   */
  const addTransaction = useCallback((transaction: TransactionData) => {
    if (!transaction) return;
    
    setTransactions((prev) => {
      // Ensure prev is an array
      if (!prev || !Array.isArray(prev)) {
        prev = [];
      }
      
      // Avoid duplicates
      if (prev.some((tx) => tx && tx.id === transaction.id)) {
        return prev;
      }
      
      const updated = [transaction, ...prev];
      return updated.slice(0, maxActive);
    });
  }, [maxActive]);

  /**
   * Remove a transaction by ID
   */
  const removeTransaction = useCallback((id: string) => {
    if (!id) return;
    
    setTransactions((prev) => {
      if (!prev || !Array.isArray(prev)) {
        return [];
      }
      return prev.filter((tx) => tx && tx.id !== id);
    });
  }, []);

  /**
   * Update an existing transaction
   */
  const updateTransaction = useCallback((id: string, updates: Partial<TransactionData>) => {
    if (!id || !updates) return;
    
    setTransactions((prev) => {
      if (!prev || !Array.isArray(prev)) {
        return [];
      }
      return prev.map((tx) => (tx && tx.id === id ? { ...tx, ...updates } : tx));
    });
  }, []);

  const activeCount = transactions && Array.isArray(transactions) 
    ? transactions.filter((tx) => tx && tx.status === 'active').length 
    : 0;

  return {
    transactions,
    activeCount,
    addTransaction,
    removeTransaction,
    updateTransaction,
    isLoading,
    error,
  };
}

