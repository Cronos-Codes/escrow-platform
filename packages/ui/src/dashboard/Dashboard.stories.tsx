import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DashboardExample } from './examples/DashboardExample';
import { EscrowDashboard } from './layouts/EscrowDashboard';
import { AnalyticsDashboard } from './layouts/AnalyticsDashboard';
import { MetricCard } from './widgets/MetricCard';
import { Chart } from './charts/Chart';
import { useChart } from './charts/Chart/useChart';
import { DataTable } from './widgets/DataTable';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { Title, Text } from '../atoms/Typography';
import { LineChart } from 'recharts';
import { BarChart } from 'recharts';
import { LineChart } from 'recharts';
import { PieChart } from 'recharts';
import { BarChart } from 'recharts';
import { LineChart } from 'recharts';

const meta: Meta<typeof DashboardExample> = {
  title: 'Dashboard/Complete Platform',
  component: DashboardExample,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete Gold Escrow Platform dashboard with integrated slash-admin components and patterns.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const timeSeriesData = [
  { date: '2024-01-01', revenue: 4500, orders: 45, customers: 12 },
  { date: '2024-01-02', revenue: 5200, orders: 52, customers: 15 },
  { date: '2024-01-03', revenue: 4800, orders: 48, customers: 11 },
  { date: '2024-01-04', revenue: 6100, orders: 61, customers: 18 },
  { date: '2024-01-05', revenue: 5800, orders: 58, customers: 16 },
  { date: '2024-01-06', revenue: 7200, orders: 72, customers: 22 },
  { date: '2024-01-07', revenue: 6900, orders: 69, customers: 20 },
];

const categoryData = [
  { name: 'Gold Bars', value: 45, color: '#FFD700' },
  { name: 'Gold Coins', value: 30, color: '#FFA500' },
  { name: 'Jewelry', value: 15, color: '#FF8C00' },
  { name: 'Bullion', value: 10, color: '#FF7F50' },
];

const tableData = [
  {
    id: '1',
    customer: 'John Doe',
    product: 'Gold Bar 1oz',
    amount: 2500,
    status: 'completed',
    date: '2024-01-15',
    escrowId: 'ESC-001',
  },
  {
    id: '2',
    customer: 'Jane Smith',
    product: 'Gold Coin Set',
    amount: 1800,
    status: 'pending',
    date: '2024-01-14',
    escrowId: 'ESC-002',
  },
  {
    id: '3',
    customer: 'Bob Johnson',
    product: 'Gold Jewelry',
    amount: 3200,
    status: 'in_progress',
    date: '2024-01-13',
    escrowId: 'ESC-003',
  },
];

// Line Chart Stories
export const LineChartExample: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        <LineChart
          data={timeSeriesData}
          series={[
            { dataKey: 'revenue', name: 'Revenue', color: '#3B82F6' },
            { dataKey: 'orders', name: 'Orders', color: '#10B981' },
          ]}
          xAxisKey="date"
          height={300}
          showGrid
          showTooltip
          showLegend
          xAxis={{
            tickFormatter: (value) => new Date(value).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
          }}
          yAxis={{
            tickFormatter: (value) => `$${(value / 1000).toFixed(0)}k`,
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive line chart with multiple series, tooltips, and custom formatting.',
      },
    },
  },
};

// Bar Chart Stories
export const BarChartExample: Story = {
  render: () => (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Daily Performance</h3>
      <BarChart
        data={timeSeriesData}
        series={[
          { dataKey: 'revenue', name: 'Revenue', color: '#3B82F6' },
          { dataKey: 'orders', name: 'Orders', color: '#10B981' },
        ]}
        xAxisKey="date"
        height={300}
        showGrid
        showTooltip
        showLegend
        xAxis={{
          tickFormatter: (value) => new Date(value).toLocaleDateString('en-US', { 
            weekday: 'short' 
          }),
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Bar chart with multiple series and custom formatting.',
      },
    },
  },
};

// Pie Chart Stories
export const PieChartExample: Story = {
  render: () => (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
      <PieChart
        data={categoryData}
        height={300}
        innerRadius={60}
        showTooltip
        showLegend
        centerContent={
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">100%</div>
            <div className="text-sm text-gray-500">Total Sales</div>
          </div>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Donut chart with center content and custom colors.',
      },
    },
  },
};

// Metric Cards Stories
export const MetricCardsExample: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Revenue"
        value={45600}
        previousValue={38200}
        change={19.4}
        changePeriod="vs last month"
        icon="information-circle"
        iconColor="success"
        valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
      />
      
      <MetricCard
        title="Active Orders"
        value={156}
        previousValue={142}
        change={9.9}
        changePeriod="vs last month"
        icon="information-circle"
        iconColor="primary"
        loading={false}
      />
      
      <MetricCard
        title="New Customers"
        value={89}
        previousValue={95}
        change={-6.3}
        changePeriod="vs last month"
        icon="information-circle"
        iconColor="warning"
        trend="down"
        trendColor="error"
      />
      
      <MetricCard
        title="Avg Order Value"
        value={2847}
        description="Average transaction amount"
        icon="information-circle"
        iconColor="secondary"
        valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
        variant="gradient"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'KPI metric cards with trends, comparisons, and different variants.',
      },
    },
  },
};

// Data Table Stories
export const DataTableExample: Story = {
  render: () => {
    const columns = [
      {
        key: 'escrowId',
        label: 'Escrow ID',
        sortable: true,
      },
      {
        key: 'customer',
        label: 'Customer',
        sortable: true,
      },
      {
        key: 'product',
        label: 'Product',
        sortable: true,
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'currency' as const,
        sortable: true,
        align: 'right' as const,
      },
      {
        key: 'status',
        label: 'Status',
        render: (value: string) => {
          const variants = {
            completed: 'success',
            pending: 'warning',
            in_progress: 'info',
          } as const;
          
          return (
            <Badge variant={variants[value as keyof typeof variants] || 'secondary'}>
              {value.replace('_', ' ').toUpperCase()}
            </Badge>
          );
        },
      },
      {
        key: 'date',
        label: 'Date',
        type: 'date' as const,
        sortable: true,
      },
    ];

    const rowActions = [
      {
        label: 'View',
        icon: <Icon name="eye" size="xs" />,
        onClick: (row: any) => console.log('View', row),
      },
      {
        label: 'Edit',
        icon: <Icon name="information-circle" size="xs" />,
        onClick: (row: any) => console.log('Edit', row),
      },
    ];

    return (
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <p className="text-sm text-gray-500 mt-1">
            Latest escrow transactions and their status
          </p>
        </div>
        
        <DataTable
          data={tableData}
          columns={columns}
          rowActions={rowActions}
          showSearch
          showPagination
          pageSize={5}
          onRowClick={(row) => console.log('Row clicked:', row)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive data table with search, sorting, pagination, and row actions.',
      },
    },
  },
};

// Loading States
export const LoadingStatesExample: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Loading Metric"
          value={0}
          loading={true}
        />
        <MetricCard
          title="Error Metric"
          value={0}
          error="Failed to load data"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={[]}
          series={[]}
          xAxisKey="date"
          loading={true}
        />
        
        <BarChart
          data={[]}
          series={[]}
          xAxisKey="date"
          emptyMessage="No data available for this period"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading and error states for dashboard components.',
      },
    },
  },
};

// Complete Dashboard Example
export const CompleteDashboardExample: Story = {
  render: () => <DashboardExample />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Complete dashboard example with all components integrated together.',
      },
    },
  },
};

// Interactive Features
export const InteractiveFeaturesExample: Story = {
  render: () => {
    const [selectedMetric, setSelectedMetric] = React.useState('revenue');
    
    return (
      <div className="space-y-6">
        <div className="flex space-x-4">
          {['revenue', 'orders', 'customers'].map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedMetric === metric
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend
          </h3>
          <LineChart
            data={timeSeriesData}
            series={[
              {
                dataKey: selectedMetric,
                name: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
                color: '#3B82F6',
              },
            ]}
            xAxisKey="date"
            height={300}
            showGrid
            showTooltip
            onDataPointClick={(data, series) => {
              alert(`Clicked on ${series}: ${JSON.stringify(data)}`);
            }}
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive dashboard with dynamic metric selection and click handlers.',
      },
    },
  },
};