import { Card, CardHeader, CardTitle, CardContent, CardAction } from '../../../molecules/Card';
import { MetricCard } from '../../widgets/MetricCard';
import { Chart } from '../../charts/Chart';
import { useChart } from '../../charts/Chart/useChart';
import { Title, Text } from '../../../atoms/Typography';
import { Button } from '../../../atoms/Button';
import { Icon } from '../../../atoms/Icon';
import { Progress } from '../../../atoms/Progress';
import { cn } from '../../../utils/cn';

// Mock data for escrow platform
const escrowMetrics = {
  totalValue: {
    current: 2450000,
    previous: 2100000,
    change: 16.7,
  },
  activeDeals: {
    current: 156,
    previous: 142,
    change: 9.9,
  },
  completionRate: {
    current: 94.2,
    previous: 91.8,
    change: 2.6,
  },
  avgDealSize: {
    current: 15700,
    previous: 14800,
    change: 6.1,
  },
};

const dealVolumeData = {
  series: [
    {
      name: 'Deal Volume',
      data: [120, 145, 167, 189, 156, 178, 203, 187, 165, 198, 234, 267],
    },
    {
      name: 'Completed',
      data: [110, 138, 159, 178, 147, 168, 192, 176, 155, 186, 220, 251],
    },
  ],
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const industryBreakdown = {
  series: [35, 25, 20, 15, 5],
  labels: ['Real Estate', 'Commodities', 'Digital Assets', 'Collectibles', 'Other'],
};

const recentDeals = [
  {
    id: 'ESC-001',
    title: 'Luxury Property - Dubai Marina',
    amount: 850000,
    status: 'pending_verification',
    buyer: 'Ahmed Al-Rashid',
    seller: 'Marina Properties LLC',
    progress: 25,
    daysRemaining: 14,
  },
  {
    id: 'ESC-002',
    title: 'Gold Bullion - 10kg',
    amount: 650000,
    status: 'funds_deposited',
    buyer: 'Investment Corp',
    seller: 'Precious Metals Ltd',
    progress: 60,
    daysRemaining: 7,
  },
  {
    id: 'ESC-003',
    title: 'Vintage Car Collection',
    amount: 320000,
    status: 'inspection_phase',
    buyer: 'Classic Cars Inc',
    seller: 'Private Collector',
    progress: 80,
    daysRemaining: 3,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending_verification':
      return 'warning';
    case 'funds_deposited':
      return 'default';
    case 'inspection_phase':
      return 'gold';
    case 'completed':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending_verification':
      return 'Pending Verification';
    case 'funds_deposited':
      return 'Funds Deposited';
    case 'inspection_phase':
      return 'Inspection Phase';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

export interface EscrowDashboardProps {
  className?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  onTimeRangeChange?: (range: 'day' | 'week' | 'month' | 'year') => void;
}

export function EscrowDashboard({
  className,
  timeRange = 'month',
  onTimeRangeChange
}: EscrowDashboardProps) {
  const chartOptions = useChart({
    xaxis: { categories: dealVolumeData.categories },
    colorScheme: 'gold',
  });

  const pieChartOptions = useChart({
    labels: industryBreakdown.labels,
    colorScheme: 'default',
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
        },
      },
    },
    legend: {
      show: true,
      position: 'bottom',
    },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Title as="h2" className="text-2xl mb-1">
            Escrow Dashboard
          </Title>
          <Text variant="body2" color="secondary">
            Monitor your escrow transactions and platform performance
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Text variant="body2" color="secondary">
            Time Range:
          </Text>
          <div className="flex gap-1">
            {(['day', 'week', 'month', 'year'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onTimeRangeChange?.(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Escrow Value"
          value={escrowMetrics.totalValue.current}
          change={escrowMetrics.totalValue.change}
          changePeriod="vs last month"
          icon="banknotes"
          iconColor="success"
          variant="gold"
          valueFormatter={(value) => `$${(value as number).toLocaleString()}`}
          chartData={[120, 145, 167, 189, 156, 178, 203, 187, 165, 198]}
          chartColor="hsl(var(--gold-500))"
        />

        <MetricCard
          title="Active Deals"
          value={escrowMetrics.activeDeals.current}
          change={escrowMetrics.activeDeals.change}
          changePeriod="vs last month"
          icon="document-text"
          iconColor="primary"
          chartData={[85, 92, 78, 95, 88, 102, 96, 89, 94, 98]}
        />

        <MetricCard
          title="Completion Rate"
          value={`${escrowMetrics.completionRate.current}%`}
          change={escrowMetrics.completionRate.change}
          changePeriod="vs last month"
          icon="check-circle"
          iconColor="success"
          progress={escrowMetrics.completionRate.current}
        />

        <MetricCard
          title="Avg Deal Size"
          value={escrowMetrics.avgDealSize.current}
          change={escrowMetrics.avgDealSize.change}
          changePeriod="vs last month"
          icon="chart-bar"
          iconColor="warning"
          valueFormatter={(value) => `$${(value as number).toLocaleString()}`}
          chartData={[12, 15, 18, 14, 16, 19, 17, 15, 18, 20]}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Volume Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <Title as="h3" className="text-lg">
                Deal Volume Trends
              </Title>
            </CardTitle>
            <CardAction>
              <Button variant="outline" size="sm">
                <Icon name="arrow-down-tray" size="sm" />
                Export
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Chart
              type="area"
              series={dealVolumeData.series}
              options={chartOptions}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Industry Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Title as="h3" className="text-lg">
                Industry Breakdown
              </Title>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="donut"
              series={industryBreakdown.series}
              options={pieChartOptions}
              height={280}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Title as="h3" className="text-lg">
              Recent Deals
            </Title>
          </CardTitle>
          <CardAction>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">
                    <Text variant="subTitle2" color="secondary">Deal</Text>
                  </th>
                  <th className="text-right py-3 px-2">
                    <Text variant="subTitle2" color="secondary">Amount</Text>
                  </th>
                  <th className="text-left py-3 px-2">
                    <Text variant="subTitle2" color="secondary">Status</Text>
                  </th>
                  <th className="text-left py-3 px-2">
                    <Text variant="subTitle2" color="secondary">Progress</Text>
                  </th>
                  <th className="text-right py-3 px-2">
                    <Text variant="subTitle2" color="secondary">Days Left</Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal) => (
                  <tr key={deal.id} className="border-b border-border last:border-0">
                    <td className="py-4 px-2">
                      <div>
                        <Text variant="body2" className="font-medium">
                          {deal.title}
                        </Text>
                        <Text variant="caption" color="secondary">
                          {deal.id} • {deal.buyer} → {deal.seller}
                        </Text>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Text variant="body2" className="font-medium">
                        ${deal.amount.toLocaleString()}
                      </Text>
                    </td>
                    <td className="py-4 px-2">
                      <div className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(deal.status) === 'warning' && 'bg-yellow-100 text-yellow-700',
                        getStatusColor(deal.status) === 'default' && 'bg-blue-100 text-blue-700',
                        getStatusColor(deal.status) === 'gold' && 'bg-gold-100 text-gold-700',
                        getStatusColor(deal.status) === 'success' && 'bg-green-100 text-green-700'
                      )}>
                        {getStatusLabel(deal.status)}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={deal.progress}
                          variant={getStatusColor(deal.status) as any}
                          className="flex-1"
                        />
                        <Text variant="caption" color="secondary">
                          {deal.progress}%
                        </Text>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Text variant="body2" color={deal.daysRemaining <= 3 ? 'error' : 'default'}>
                        {deal.daysRemaining}d
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}