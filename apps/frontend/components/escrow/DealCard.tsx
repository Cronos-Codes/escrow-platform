import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../packages/ui/src/Card';
import { Badge } from '../../../packages/ui/src/Badge';
import { Button } from '../../../packages/ui/src/Button';
import { EscrowState, getStateDescription } from '../../../packages/core/src/fsm';
import { DealResponse } from '../../../packages/schemas/src/escrow';

interface DealCardProps {
  deal: DealResponse;
  onAction?: (action: string, dealId: string) => void;
  showActions?: boolean;
  userRole?: string;
}

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

const getStateIcon = (state: EscrowState) => {
  switch (state) {
    case EscrowState.Created:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case EscrowState.Funded:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      );
    case EscrowState.Approved:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case EscrowState.Released:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case EscrowState.Disputed:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    case EscrowState.Cancelled:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default:
      return null;
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
  });
};

export function DealCard({ deal, onAction, showActions = true, userRole }: DealCardProps) {
  const handleAction = (action: string) => {
    onAction?.(action, deal.dealId);
  };

  const getAvailableActions = () => {
    if (!showActions || !userRole) return [];

    const actions: Array<{ key: string; label: string; variant: 'default' | 'outline' | 'destructive' }> = [];

    switch (deal.state) {
      case EscrowState.Created:
        if (userRole === 'PAYER') {
          actions.push({ key: 'fund', label: 'Fund Deal', variant: 'default' });
        }
        if (userRole === 'ADMIN') {
          actions.push({ key: 'cancel', label: 'Cancel', variant: 'destructive' });
        }
        break;

      case EscrowState.Funded:
        if (userRole === 'ARBITER') {
          actions.push({ key: 'approve', label: 'Approve', variant: 'default' });
        }
        if (userRole === 'PAYER' || userRole === 'PAYEE') {
          actions.push({ key: 'dispute', label: 'Dispute', variant: 'outline' });
        }
        if (userRole === 'ADMIN') {
          actions.push({ key: 'cancel', label: 'Cancel', variant: 'destructive' });
        }
        break;

      case EscrowState.Approved:
        if (userRole === 'ARBITER') {
          actions.push({ key: 'release', label: 'Release', variant: 'default' });
        }
        if (userRole === 'PAYER' || userRole === 'PAYEE') {
          actions.push({ key: 'dispute', label: 'Dispute', variant: 'outline' });
        }
        if (userRole === 'ADMIN') {
          actions.push({ key: 'cancel', label: 'Cancel', variant: 'destructive' });
        }
        break;

      case EscrowState.Disputed:
        if (userRole === 'ADMIN') {
          actions.push({ key: 'cancel', label: 'Cancel', variant: 'destructive' });
        }
        break;

      case EscrowState.Released:
      case EscrowState.Cancelled:
        // No actions for terminal states
        break;
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Badge className={`${getStateColor(deal.state)} flex items-center space-x-1`}>
              {getStateIcon(deal.state)}
              <span>{deal.state}</span>
            </Badge>
            <span className="text-sm text-gray-500 font-mono">#{deal.dealId}</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {formatAmount(deal.amount, deal.token)}
            </p>
            <p className="text-xs text-gray-500">
              {deal.token ? 'Token' : 'Native ETH'}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">
          {getStateDescription(deal.state)}
        </p>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payer</p>
            <p className="text-sm font-mono text-gray-900">{formatAddress(deal.payer)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payee</p>
            <p className="text-sm font-mono text-gray-900">{formatAddress(deal.payee)}</p>
          </div>
        </div>

        {/* Metadata */}
        {deal.metadata && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Metadata</p>
            <a
              href={deal.metadata}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 break-all"
            >
              {deal.metadata}
            </a>
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-1 mb-4">
          <p className="text-xs text-gray-500">
            Created: {formatDate(deal.createdAt)}
          </p>
          {deal.fundedAt && (
            <p className="text-xs text-gray-500">
              Funded: {formatDate(deal.fundedAt)}
            </p>
          )}
          {deal.approvedAt && (
            <p className="text-xs text-gray-500">
              Approved: {formatDate(deal.approvedAt)}
            </p>
          )}
          {deal.releasedAt && (
            <p className="text-xs text-gray-500">
              Released: {formatDate(deal.releasedAt)}
            </p>
          )}
          {deal.cancelledAt && (
            <p className="text-xs text-gray-500">
              Cancelled: {formatDate(deal.cancelledAt)}
            </p>
          )}
        </div>

        {/* Actions */}
        {availableActions.length > 0 && (
          <div className="flex space-x-2 pt-4 border-t border-gray-200">
            {availableActions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant}
                size="sm"
                onClick={() => handleAction(action.key)}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* View Details Link */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('view')}
            className="w-full text-blue-600 hover:text-blue-800"
          >
            View Details →
          </Button>
        </div>
      </Card>
    </motion.div>
  );
} 