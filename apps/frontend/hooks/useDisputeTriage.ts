import { useState, useCallback } from 'react';

export function useDisputeTriage() {
  const [isTriageLoading, setIsTriageLoading] = useState(false);

  const triageDispute = useCallback(async (description: string) => {
    setIsTriageLoading(true);
    try {
      const response = await fetch('/api/disputes/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      if (!response.ok) throw new Error('Triage failed');
      const result = await response.json();
      setIsTriageLoading(false);
      return result;
    } catch (error) {
      setIsTriageLoading(false);
      throw error;
    }
  }, []);

  return {
    triageDispute,
    isTriageLoading,
  };
} 