import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../packages/auth';

// ============ Types ============

interface Vote {
  arbiterId: string;
  voteForInitiator: boolean;
  reasoning: string;
  timestamp: Date;
}

interface Dispute {
  id: string;
  dealId: string;
  initiatorId: string;
  reason: string;
  severity: number;
  riskLevel: 'low' | 'med' | 'high';
  status: 'active' | 'resolved' | 'escalated' | 'revoked';
  votesForInitiator: number;
  votesForRespondent: number;
  totalVotes: number;
  resolution?: string;
  timeCreated: Date;
  timeResolved?: Date;
}

interface VotingPanelProps {
  dispute: Dispute;
  votes: Vote[];
  onVote: (voteForInitiator: boolean, reasoning: string) => Promise<void>;
  isLoading?: boolean;
  userRole?: 'arbiter' | 'super_arbiter' | 'admin';
}

// ============ Component ============

export const VotingPanel: React.FC<VotingPanelProps> = ({
  dispute,
  votes,
  onVote,
  isLoading = false,
  userRole
}) => {
  const { user } = useAuth();
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [voteForInitiator, setVoteForInitiator] = useState<boolean | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<Vote | null>(null);

  // ============ Effects ============

  useEffect(() => {
    if (user && votes.length > 0) {
      const userVoteData = votes.find(vote => vote.arbiterId === user.uid);
      if (userVoteData) {
        setUserVote(userVoteData);
      }
    }
  }, [user, votes]);

  // ============ Calculations ============

  const totalVotes = dispute.totalVotes;
  const initiatorPercentage = totalVotes > 0 ? (dispute.votesForInitiator / totalVotes) * 100 : 0;
  const respondentPercentage = totalVotes > 0 ? (dispute.votesForRespondent / totalVotes) * 100 : 0;
  const needsMoreVotes = totalVotes < 3;
  const canVote = userRole === 'arbiter' || userRole === 'super_arbiter';
  const hasVoted = userVote !== null;
  const isResolved = dispute.status === 'resolved';

  // ============ Handlers ============

  const handleVoteSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (voteForInitiator === null || !reasoning.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onVote(voteForInitiator, reasoning.trim());
      setShowVoteForm(false);
      setVoteForInitiator(null);
      setReasoning('');
    } catch (error) {
      console.error('Vote submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [voteForInitiator, reasoning, onVote]);

  const handleVoteSelection = useCallback((forInitiator: boolean) => {
    setVoteForInitiator(forInitiator);
  }, []);

  // ============ Render ============

  if (!canVote) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">Only arbiters can vote on disputes.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Voting Panel</h2>
          <p className="text-gray-600 mt-1">Cast your vote on this dispute</p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            dispute.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
            dispute.riskLevel === 'med' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {dispute.riskLevel.toUpperCase()} RISK
          </div>
        </div>
      </div>

      {/* Dispute Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Dispute Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Deal ID:</span>
            <span className="ml-2 font-medium">{dispute.dealId}</span>
          </div>
          <div>
            <span className="text-gray-600">Severity:</span>
            <span className="ml-2 font-medium">{dispute.severity}/5</span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="ml-2 font-medium capitalize">{dispute.status}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Votes:</span>
            <span className="ml-2 font-medium">{totalVotes}</span>
          </div>
        </div>
        <div className="mt-3">
          <span className="text-gray-600">Reason:</span>
          <p className="text-gray-900 mt-1">{dispute.reason}</p>
        </div>
      </div>

      {/* Voting Meter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Current Vote Distribution</h3>
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${initiatorPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-0 top-0 h-full bg-blue-500"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${respondentPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="absolute right-0 top-0 h-full bg-red-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {dispute.votesForInitiator} - {dispute.votesForRespondent}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Initiator ({dispute.votesForInitiator} votes)</span>
          <span>Respondent ({dispute.votesForRespondent} votes)</span>
        </div>
      </div>

      {/* Vote Status */}
      <AnimatePresence>
        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-green-800 font-medium">Vote Submitted</span>
                <p className="text-green-700 text-sm mt-1">
                  You voted for {userVote?.voteForInitiator ? 'initiator' : 'respondent'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {needsMoreVotes && !isResolved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800">
                {3 - totalVotes} more vote{3 - totalVotes !== 1 ? 's' : ''} needed for resolution
              </span>
            </div>
          </motion.div>
        )}

        {isResolved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-blue-800 font-medium">Dispute Resolved</span>
                <p className="text-blue-700 text-sm mt-1">
                  Resolution: {dispute.resolution?.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vote Form */}
      {!hasVoted && !isResolved && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Cast Your Vote</h3>
            <button
              onClick={() => setShowVoteForm(!showVoteForm)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showVoteForm ? 'Cancel' : 'Vote Now'}
            </button>
          </div>

          <AnimatePresence>
            {showVoteForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleVoteSubmit}
                className="space-y-4"
              >
                {/* Vote Selection Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => handleVoteSelection(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      voteForInitiator === true
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">👤</div>
                      <div className="font-semibold">Initiator</div>
                      <div className="text-sm text-gray-600 mt-1">Vote for the person who filed the dispute</div>
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => handleVoteSelection(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      voteForInitiator === false
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">🏛️</div>
                      <div className="font-semibold">Respondent</div>
                      <div className="text-sm text-gray-600 mt-1">Vote for the other party in the dispute</div>
                    </div>
                  </motion.button>
                </div>

                {/* Reasoning */}
                {voteForInitiator !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700">
                      Reasoning *
                    </label>
                    <textarea
                      id="reasoning"
                      value={reasoning}
                      onChange={(e) => setReasoning(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Explain your decision based on the evidence and circumstances..."
                      required
                    />
                    <div className="text-xs text-gray-500">
                      {reasoning.length}/2000 characters
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                {voteForInitiator !== null && reasoning.trim() && (
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Vote...
                      </div>
                    ) : (
                      `Vote for ${voteForInitiator ? 'Initiator' : 'Respondent'}`
                    )}
                  </motion.button>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Vote History */}
      {votes.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Vote History</h3>
          <div className="space-y-3">
            {votes.map((vote, index) => (
              <motion.div
                key={vote.arbiterId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      vote.voteForInitiator ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium text-sm">
                      Arbiter {vote.arbiterId.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(vote.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{vote.reasoning}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}; 