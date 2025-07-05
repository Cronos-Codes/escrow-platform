import { useState, useCallback } from 'react';
import { Property } from '@escrow/schemas';
import { ShipmentStatus } from '@escrow/schemas';

// Real Estate Adapter Hooks
export const useTokenizeDeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenizeDeed = useCallback(async (dealId: string, propertyData: Property): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, call the real estate service
      const response = await fetch('/api/real-estate/tokenize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dealId, propertyData }),
      });

      if (!response.ok) {
        throw new Error('Failed to tokenize deed');
      }

      const result = await response.json();
      return result.tokenId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tokenization failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tokenizeDeed, loading, error };
};

export const useVerifyPropertyDeed = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPropertyDeed = useCallback(async (dealId: string, signedDocHash: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/real-estate/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dealId, signedDocHash }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify property deed');
      }

      const result = await response.json();
      return result.verified;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { verifyPropertyDeed, loading, error };
};

export const useRevokePropertyToken = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokePropertyToken = useCallback(async (tokenId: string, reason: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/real-estate/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke property token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Revocation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { revokePropertyToken, loading, error };
};

// Precious Metals Adapter Hooks
export const useVerifyAssay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAssay = useCallback(async (batchId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/metals/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchId }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify assay');
      }

      const result = await response.json();
      return result.verified;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { verifyAssay, loading, error };
};

export const useRevokeBatch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokeBatch = useCallback(async (batchId: string, reason: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/metals/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchId, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke batch');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Revocation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { revokeBatch, loading, error };
};

// Oil & Gas Adapter Hooks
export const useTrackShipment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackShipment = useCallback(async (shipmentId: string): Promise<ShipmentStatus> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/oil-gas/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shipmentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to track shipment');
      }

      const result = await response.json();
      return result.status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tracking failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { trackShipment, loading, error };
};

export const useVerifyDelivery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyDelivery = useCallback(async (shipmentId: string, signedProofHash: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/oil-gas/verify-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shipmentId, signedProofHash }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify delivery');
      }

      const result = await response.json();
      return result.verified;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delivery verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { verifyDelivery, loading, error };
};

export const useRevokeShipment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokeShipment = useCallback(async (shipmentId: string, reason: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/oil-gas/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shipmentId, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to revoke shipment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Revocation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { revokeShipment, loading, error };
};

// Oracle Data Hooks
export const useFetchOracleData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOracleData = useCallback(async (jobId: string, params: any): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/oracles/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, params }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch oracle data');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Oracle fetch failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchOracleData, loading, error };
};

export const useSubscribeOracleEvents = () => {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const subscribeToEvents = useCallback(async (
    contractAddress: string,
    eventName: string,
    callback: (event: any) => void
  ): Promise<string> => {
    try {
      const response = await fetch('/api/oracles/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractAddress, eventName }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to oracle events');
      }

      const result = await response.json();
      const subscriptionId = result.subscriptionId;
      
      setSubscriptions(prev => [...prev, subscriptionId]);
      
      // Set up WebSocket connection for real-time events
      // In production, implement WebSocket connection here
      
      return subscriptionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Subscription failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const unsubscribeFromEvents = useCallback(async (subscriptionId: string): Promise<void> => {
    try {
      const response = await fetch('/api/oracles/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe from oracle events');
      }

      setSubscriptions(prev => prev.filter(id => id !== subscriptionId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unsubscription failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return { 
    subscribeToEvents, 
    unsubscribeFromEvents, 
    subscriptions, 
    error 
  };
}; 