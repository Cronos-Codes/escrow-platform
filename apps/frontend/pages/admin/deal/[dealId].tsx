import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Card } from '../../../../packages/ui/src/Card';
import { Badge } from '../../../../packages/ui/src/Badge';
import { Button } from '../../../../packages/ui/src/Button';
import { useGetDeal } from '../../../hooks/useEscrow';
import { useAuth } from '../../../../packages/auth/src';
import { EscrowState, getStateDescription } from '../../../../packages/core/src/fsm';
import { DealResponse } from '../../../../packages/schemas/src/escrow';

const AdminDealDetailPage: NextPage = () => {
  const router = useRouter();
  const { dealId } = router.query;
  const { user } = useAuth();
  const { getDeal, loading, error } = useGetDeal();
  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (dealId && user) {
      loadDeal();
    }
  }, [dealId, user]);

  const loadDeal = async () => {
    try {
      const result = await getDeal(dealId as string);
      setDeal(result.deal);
      setLogs(result.logs);
    } catch (err) {
      console.error('Failed to load deal:', err);
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'back':
        router.push('/admin/deals');
        break;
      case 'edit':
        // Handle edit action
        break;
      case 'cancel':
        // Handle cancel action
        break;
      default:
        break;
    }
  };

  const getStateColor = (state: EscrowState) => {
    switch (state) {
      case EscrowState.Created:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case EscrowState.Funded:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case EscrowState.Approved:
        return 'bg-green-100 text-green-800 border-green-200';
      case EscrowState.Released:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case EscrowState.Disputed:
        return 'bg-red-100 text-red-800 border-red-200';
      case EscrowState.Cancelled:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string, token?: string) => {
    const numAmount = parseFloat(amount);
    return `${numAmount.toLocaleString()} ${token || 'ETH'}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You must be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Deal Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested deal could not be found.'}</p>
          <Button onClick={() => router.push('/admin/deals')}>
            Back to Deals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => handleAction('back')}
                className="mb-4"
              >
                ← Back to Deals
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Deal #{deal.dealId}
              </h1>
              <p className="text-gray-600">Detailed view and management</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleAction('edit')}>
                Edit
              </Button>
              {deal.state !== EscrowState.Released && deal.state !== EscrowState.Cancelled && (
                <Button variant="destructive" onClick={() => handleAction('cancel')}>
                  Cancel Deal
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Deal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Overview */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Deal Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Current State
                  </p>
                  <Badge className={`${getStateColor(deal.state)} text-sm`}>
                    {deal.state}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    {getStateDescription(deal.state)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(deal.amount, deal.token)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {deal.token ? 'Token Contract' : 'Native ETH'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Parties */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Parties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Payer
                  </p>
                  <p className="font-mono text-gray-900">{deal.payer}</p>
                  <p className="text-sm text-gray-600">{formatAddress(deal.payer)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Payee
                  </p>
                  <p className="font-mono text-gray-900">{deal.payee}</p>
                  <p className="text-sm text-gray-600">{formatAddress(deal.payee)}</p>
                </div>
              </div>
            </Card>

            {/* Metadata */}
            {deal.metadata && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Metadata</h2>
                <a
                  href={deal.metadata}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  {deal.metadata}
                </a>
              </Card>
            )}

            {/* FSM Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">State Timeline</h2>
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={`${getStateColor(log.newState)} text-xs`}>
                          {log.newState}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          by {formatAddress(log.actor)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {log.event} event triggered
                      </p>
                      {log.reason && (
                        <p className="text-sm text-gray-500 italic">
                          "{log.reason}"
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {deal.state === EscrowState.Created && (
                  <Button className="w-full" variant="outline">
                    Fund Deal
                  </Button>
                )}
                {deal.state === EscrowState.Funded && (
                  <Button className="w-full" variant="outline">
                    Approve Milestone
                  </Button>
                )}
                {deal.state === EscrowState.Approved && (
                  <Button className="w-full" variant="outline">
                    Release Funds
                  </Button>
                )}
                {(deal.state === EscrowState.Funded || deal.state === EscrowState.Approved) && (
                  <Button className="w-full" variant="outline">
                    Raise Dispute
                  </Button>
                )}
                {deal.state !== EscrowState.Released && deal.state !== EscrowState.Cancelled && (
                  <Button className="w-full" variant="destructive">
                    Cancel Deal
                  </Button>
                )}
              </div>
            </Card>

            {/* Deal Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Deal Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Deal ID
                  </p>
                  <p className="text-sm font-mono text-gray-900">{deal.dealId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Created
                  </p>
                  <p className="text-sm text-gray-900">{formatDate(deal.createdAt)}</p>
                </div>
                {deal.fundedAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Funded
                    </p>
                    <p className="text-sm text-gray-900">{formatDate(deal.fundedAt)}</p>
                  </div>
                )}
                {deal.approvedAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Approved
                    </p>
                    <p className="text-sm text-gray-900">{formatDate(deal.approvedAt)}</p>
                  </div>
                )}
                {deal.releasedAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Released
                    </p>
                    <p className="text-sm text-gray-900">{formatDate(deal.releasedAt)}</p>
                  </div>
                )}
                {deal.cancelledAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Cancelled
                    </p>
                    <p className="text-sm text-gray-900">{formatDate(deal.cancelledAt)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Contract Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Contract Address
                  </p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {deal.contractAddress || 'Not deployed'}
                  </p>
                </div>
                {deal.token && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Token Address
                    </p>
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {deal.token}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDealDetailPage; 