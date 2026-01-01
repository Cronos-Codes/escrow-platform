import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/shared/Layout';
import { DisputeForm } from '../components/dispute/DisputeForm';
import { TimelineView, TimelineEvent } from '../components/dispute/TimelineView';
import { VotingPanel } from '../components/dispute/VotingPanel';
import { EscalationPanel } from '../components/dispute/EscalationPanel';
import { AdminOverrideModal } from '../components/dispute/AdminOverrideModal';

const mockDispute = {
  id: 'd1',
  dealId: 'deal-001',
  initiatorId: 'user-123',
  reason: 'Quality not as described',
  severity: 3,
  riskLevel: 'med' as 'med',
  status: 'active' as 'active',
  votesForInitiator: 2,
  votesForRespondent: 1,
  totalVotes: 3,
  resolution: undefined,
  timeCreated: new Date(),
};

const mockTimeline: TimelineEvent[] = [
  { id: '1', type: 'filed', actor: 'Alice', role: 'buyer', timestamp: new Date(), details: 'Dispute filed.' },
  { id: '2', type: 'triaged', actor: 'AI', role: 'system', timestamp: new Date(), details: 'Triage complete.' },
  { id: '3', type: 'voted', actor: 'Bob', role: 'arbiter', timestamp: new Date(), details: 'Vote cast.' },
];

export default function DisputesPage() {
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <Layout>
      <Head>
        <title>Disputes - Gold Escrow</title>
      </Head>
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Dispute Resolution Center</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">File a New Dispute</h2>
            <DisputeForm dealId="" onSubmit={async () => {}} onCancel={() => {}} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Dispute Timeline</h2>
            <TimelineView events={mockTimeline} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Voting Panel</h2>
            <VotingPanel dispute={mockDispute} votes={[]} onVote={async () => {}} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Escalation Panel</h2>
            <EscalationPanel disputeId={mockDispute.id} currentLevel={1} maxLevel={3} canEscalate={true} escalationHistory={[]} onEscalationComplete={() => {}} />
          </div>
        </div>
        <div className="mb-8">
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => setShowAdminModal(true)}>
            Open Admin Override Modal
          </button>
        </div>
        <AdminOverrideModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} disputeId={mockDispute.id} disputeData={{
          id: mockDispute.id,
          title: 'Dispute Example',
          amount: 10000,
          status: mockDispute.status,
          buyer: 'Alice',
          seller: 'Bob',
          currentVotes: { buyer: 1, seller: 2, neutral: 0 },
          totalVotes: 3,
        }} />
      </div>
    </Layout>
  );
} 