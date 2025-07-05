import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { DealCard } from '../../components/escrow/DealCard';
import { Button } from '../../../packages/ui/src/Button';
import { Input } from '../../../packages/ui/src/Input';
import { Select } from '../../../packages/ui/src/Select';
import { Card } from '../../../packages/ui/src/Card';
import { Badge } from '../../../packages/ui/src/Badge';
import { useGetDeals } from '../../hooks/useEscrow';
import { useAuth } from '../../../packages/auth/src';
import { EscrowState } from '../../../packages/core/src/fsm';
import { DealResponse, DealFilter } from '../../../packages/schemas/src/escrow';

const AdminDealsPage: NextPage = () => {
  const { user } = useAuth();
  const { getDeals, loading, error } = useGetDeals();
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [filters, setFilters] = useState<DealFilter>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [totalDeals, setTotalDeals] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (user) {
      loadDeals();
    }
  }, [user, filters]);

  const loadDeals = async () => {
    try {
      const result = await getDeals(filters);
      setDeals(result.deals);
      setTotalDeals(result.total);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to load deals:', err);
    }
  };

  const handleFilterChange = (key: keyof DealFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleDealAction = (action: string, dealId: string) => {
    switch (action) {
      case 'view':
        window.location.href = `/admin/deals/${dealId}`;
        break;
      case 'fund':
        // Handle fund action
        break;
      case 'approve':
        // Handle approve action
        break;
      case 'release':
        // Handle release action
        break;
      case 'dispute':
        // Handle dispute action
        break;
      case 'cancel':
        // Handle cancel action
        break;
      default:
        break;
    }
  };

  const getStats = () => {
    const stats = {
      total: deals.length,
      created: deals.filter(d => d.state === EscrowState.Created).length,
      funded: deals.filter(d => d.state === EscrowState.Funded).length,
      approved: deals.filter(d => d.state === EscrowState.Approved).length,
      released: deals.filter(d => d.state === EscrowState.Released).length,
      disputed: deals.filter(d => d.state === EscrowState.Disputed).length,
      cancelled: deals.filter(d => d.state === EscrowState.Cancelled).length,
    };

    return stats;
  };

  const stats = getStats();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deals Dashboard</h1>
          <p className="text-gray-600">Manage and monitor all escrow deals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.created}</p>
            <p className="text-sm text-gray-600">Created</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.funded}</p>
            <p className="text-sm text-gray-600">Funded</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.released}</p>
            <p className="text-sm text-gray-600">Released</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.disputed}</p>
            <p className="text-sm text-gray-600">Disputed</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
            <p className="text-sm text-gray-600">Cancelled</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <Select
                value={filters.state || ''}
                onChange={(value) => handleFilterChange('state', value || undefined)}
                options={[
                  { value: '', label: 'All States' },
                  { value: EscrowState.Created, label: 'Created' },
                  { value: EscrowState.Funded, label: 'Funded' },
                  { value: EscrowState.Approved, label: 'Approved' },
                  { value: EscrowState.Released, label: 'Released' },
                  { value: EscrowState.Disputed, label: 'Disputed' },
                  { value: EscrowState.Cancelled, label: 'Cancelled' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payer Address
              </label>
              <Input
                type="text"
                placeholder="0x..."
                value={filters.payer || ''}
                onChange={(e) => handleFilterChange('payer', e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payee Address
              </label>
              <Input
                type="text"
                placeholder="0x..."
                value={filters.payee || ''}
                onChange={(e) => handleFilterChange('payee', e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
                options={[
                  { value: 'createdAt', label: 'Created Date' },
                  { value: 'amount', label: 'Amount' },
                  { value: 'state', label: 'State' },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort Order:</label>
              <Select
                value={filters.sortOrder}
                onChange={(value) => handleFilterChange('sortOrder', value)}
                options={[
                  { value: 'desc', label: 'Descending' },
                  { value: 'asc', label: 'Ascending' },
                ]}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' })}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Deals List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Deals ({totalDeals})
            </h2>
            <Button onClick={() => window.location.href = '/deals/create'}>
              Create New Deal
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadDeals}>Retry</Button>
              </div>
            </Card>
          ) : deals.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
              <p className="text-gray-600 mb-4">
                {Object.keys(filters).length > 3 ? 'Try adjusting your filters.' : 'Get started by creating your first deal.'}
              </p>
              <Button onClick={() => window.location.href = '/deals/create'}>
                Create Deal
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                  <DealCard
                    key={deal.dealId}
                    deal={deal}
                    onAction={handleDealAction}
                    showActions={true}
                    userRole="ADMIN"
                  />
                ))}
              </div>

              {/* Pagination */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                      Page {filters.page}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={!hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDealsPage; 