import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Escrow {
  id: string;
  amount: number;
  status: 'pending' | 'locked' | 'released' | 'disputed';
  buyerLocation: { lat: number; lng: number };
  sellerLocation: { lat: number; lng: number };
  createdAt: Date;
  aiControlled: boolean;
  blockchainHash?: string;
  buyerName: string;
  sellerName: string;
}

export const useEscrowData = () => {
  const { data: session } = useSession();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEscrows = async () => {
      try {
        setLoading(true);
        
        // If no session, return empty array (will use demo data)
        if (!session) {
          setEscrows([]);
          setLoading(false);
          return;
        }

        // Fetch escrows from API based on user role
        const response = await fetch('/api/escrows', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch escrows');
        }

        const data = await response.json();
        
        // Transform API data to match our interface
        const transformedEscrows: Escrow[] = data.escrows.map((escrow: any) => ({
          id: escrow.id,
          amount: escrow.amount,
          status: escrow.status,
          buyerLocation: {
            lat: escrow.buyerLocation?.lat || 0,
            lng: escrow.buyerLocation?.lng || 0,
          },
          sellerLocation: {
            lat: escrow.sellerLocation?.lat || 0,
            lng: escrow.sellerLocation?.lng || 0,
          },
          createdAt: new Date(escrow.createdAt),
          aiControlled: escrow.aiControlled || false,
          blockchainHash: escrow.blockchainHash,
          buyerName: escrow.buyerName || 'Unknown Buyer',
          sellerName: escrow.sellerName || 'Unknown Seller',
        }));

        setEscrows(transformedEscrows);
        setError(null);
      } catch (err) {
        console.error('Error fetching escrows:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch escrows');
        setEscrows([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchEscrows();
  }, [session]);

  // Real-time updates (WebSocket or polling)
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/escrows/updates', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.updates) {
            setEscrows(prev => {
              const updated = [...prev];
              data.updates.forEach((update: any) => {
                const index = updated.findIndex(e => e.id === update.id);
                if (index !== -1) {
                  updated[index] = {
                    ...updated[index],
                    ...update,
                  };
                }
              });
              return updated;
            });
          }
        }
      } catch (err) {
        console.error('Error fetching updates:', err);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [session]);

  return {
    escrows,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Trigger refetch logic here
    },
  };
};
