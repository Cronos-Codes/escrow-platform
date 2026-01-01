import React, { useState } from 'react';
import { EscrowDashboard } from '../layouts/EscrowDashboard';
import { AnalyticsDashboard } from '../layouts/AnalyticsDashboard';
import { MetricCard } from '../widgets/MetricCard';
import { Chart } from '../charts/Chart';
import { DataTable } from '../widgets/DataTable';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '../../molecules/Card';
import { Title, Text } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';

// Enhanced mock data for escrow platform demonstration
const escrowTableData = [
  {
    id: 'ESC-001',
    dealTitle: 'Luxury Villa - Palm Jumeirah',
    buyer: 'Ahmed Al-Rashid',
    seller: 'Emirates Properties',
    amount: 2500000,
    status: 'funds_deposited',
    industry: 'Real Estate',
    progress: 65,
    createdAt: '2024-01-15T10:30:00Z',
    estimatedCompletion: '2024-02-15T10:30:00Z',
  },
  {
    id: 'ESC-002',
    dealTitle: 'Gold Bullion Collection - 50kg',
    buyer: 'Investment Holdings Ltd',
    seller: 'Precious Metals Corp',
    amount: 3200000,
    status: 'inspection_phase',
    industry: 'Commodities',
    progress: 80,
    createdAt: '2024-01-12T14:20:00Z',
    estimatedCompletion: '2024-01-25T14:20:00Z',
  },
  {
    id: 'ESC-003',
    dealTitle: 'Vintage Ferrari Collection',
    buyer: 'Classic Cars International',
    seller: 'Private Collector',
    amount: 850000,
    status: 'pending_verification',
    industry: 'Collectibles',
    progress: 25,
    createdAt: '2024-01-18T09:15:00Z',
    estimatedCompletion: '2024-02-28T09:15:00Z',
  },
  {
    id: 'ESC-004',
    dealTitle: 'Commercial Property - Business Bay',
    buyer: 'Global Investments',
    seller: 'Dubai Holdings',
    amount: 4500000,
    status: 'completed',
    industry: 'Real Estate',
    progress: 100,
    createdAt: '2024-01-05T16:45:00Z',
    estimatedCompletion: '2024-01-20T16:45:00Z',
  },
  {
    id: 'ESC-005',
    dealTitle: 'Cryptocurrency Portfolio',
    buyer: 'Crypto Ventures',
    seller: 'Digital Assets LLC',
    amount: 1200000,
    status: 'funds_deposited',
    industry: 'Digital Assets',
    progress: 45,
    createdAt: '2024-01-20T11:30:00Z',
    estimatedCompletion: '2024-02-10T11:30:00Z',
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending_verification: { variant: 'warning' as const, label: 'Pending Verification' },
    funds_deposited: { variant: 'default' as const, label: 'Funds Deposited' },
    inspection_phase: { variant: 'info' as const, label: 'Inspection Phase' },
    completed: { variant: 'success' as const, label: 'Completed' },
    disputed: { variant: 'destructive' as const, label: 'Disputed' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_verification;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const escrowTableColumns = [
  {
    key: 'dealTitle',
    label: 'Deal',
    sortable: true,
    render: (value: string, row: any) => (
      <div>
        <Text variant="body2" className="font-medium">{value}</Text>
        <Text variant="caption" color="secondary">{row.id}</Text>
      </div>
    ),
  },
  {
    key: 'buyer',
    label: 'Parties',
    render: (value: string, row: any) => (
      <div>
        <Text variant="caption" color="secondary">Buyer:</Text>
        <Text variant="body2" className="font-medium">{value}</Text>
        <Text variant="caption" color="secondary">Seller:</Text>
        <Text variant="body2">{row.seller}</Text>
      </div>
    ),
  },
  {
    key: 'amount',
    label: 'Amount',
    type: 'currency' as const,
    sortable: true,
    align: 'right' as const,
    render: (value: number) => (
      <Text variant="body2" className="font-medium">
        ${value.toLocaleString()}
      </Text>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => getStatusBadge(value),
  },
  {
    key: 'industry',
    label: 'Industry',
    sortable: true,
    render: (value: string) => (
      <Badge variant="outline">{value}</Badge>
    ),
  },
  {
    key: 'progress',
    label: 'Progress',
    align: 'center' as const,
    render: (value: number) => (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${value}%` }}
          />
        </div>
        <Text variant="caption" color="secondary">{value}%</Text>
      </div>
    ),
  },
];

const dashboardTabs = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'analytics', label: 'Analytics', icon: 'chart-bar' },
  { id: 'deals', label: 'All Deals', icon: 'document-text' },
];

export function DashboardExample() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <EscrowDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'deals':
        return (
          <Card>
            <CardHeader>
              <CardTitle>
                <Title as="h3" className="text-lg">All Escrow Deals</Title>
              </CardTitle>
              <CardAction>
                <Button>
                  <Icon name="plus" size="sm" />
                  New Deal
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={escrowTableData}
                columns={escrowTableColumns}
                showSearch={true}
                showPagination={true}
                pageSize={10}
                rowActions={[
                  {
                    label: 'View',
                    icon: <Icon name="eye" size="xs" />,
                    onClick: (row) => console.log('View deal:', row.id),
                  },
                  {
                    label: 'Edit',
                    icon: <Icon name="pencil" size="xs" />,
                    onClick: (row) => console.log('Edit deal:', row.id),
                  },
                ]}
              />
            </CardContent>
          </Card>
        );
      default:
        return <EscrowDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Title as="h1" className="text-3xl">
                Gold Escrow Platform
              </Title>
              <Text variant="body2" color="secondary">
                Secure, transparent, and efficient escrow management
              </Text>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Icon name="bell" size="sm" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="cog-6-tooth" size="sm" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {dashboardTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon as any} size="sm" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}