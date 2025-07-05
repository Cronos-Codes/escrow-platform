// Dispute API functions
export async function voteOnDispute(disputeId: string, side: 'buyer' | 'seller' | 'neutral') {
  const response = await fetch(`/api/disputes/${disputeId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ side })
  });
  if (!response.ok) throw new Error('Voting failed');
  return response.json();
}

export async function escalateDispute(disputeId: string, reason: string, level: number) {
  const response = await fetch(`/api/disputes/${disputeId}/escalate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, level })
  });
  if (!response.ok) throw new Error('Escalation failed');
  return response.json();
}

export async function adminOverrideDispute(disputeId: string, overrideData: any) {
  const response = await fetch(`/api/disputes/${disputeId}/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(overrideData)
  });
  if (!response.ok) throw new Error('Admin override failed');
  return response.json();
} 