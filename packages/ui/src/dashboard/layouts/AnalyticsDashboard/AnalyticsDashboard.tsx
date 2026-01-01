import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '../../../molecules/Card';
import { MetricCard } from '../../widgets/MetricCard';
import { Chart } from '../../charts/Chart';
import { useChart } from '../../charts/Chart/useChart';
import { Title, Text } from '../../../atoms/Typography';
import { Button } from '../../../atoms/Button';
import { Icon } from '../../../atoms/Icon';
import { Progress } from '../../../atoms/Progress';
import { cn } from '../../../utils/cn';

// Analytics data for escrow platform
const analyticsData = {
  platformMetrics: {
    day: {
      totalTransactions: 1247,
      transactionChange: 5.2,
      totalVolume: 8450000,
      volumeChange: 12.4,
      avgProcessingTime: '2.4 hours',
      timeChange: -8.3,
    },
    week: {
      totalTransactions: 8734,
      transactionChange: 8.7,
      totalVolume: 59150000,
      volumeChange: 15.6,
      avgProcessingTime: '2.1 hours',
      timeChange: -12.1,
    },
    month: {
      totalTransactions: 34567,
      transactionChange: 18.9,
      totalVolume: 234500000,
      volumeChange: 22.3,
      avgProcessingTime: '1.8 hours',
      timeChange: -15.7,
    },
  },
  transactionFlow: {
    day: {
      series: [
        { name: 'Initiated', data: [45, 52, 38, 65, 49, 72, 58, 63, 47, 59, 68, 71] },
        { name: 'Completed', data: [38, 47, 33, 58, 42, 65, 51, 56, 41, 52, 61, 64] },
        { name: 'Disputed', data: [3, 2, 2, 4, 3, 3, 2, 3, 2, 3, 3, 2] },
      ],
      categories: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    },
    week: {
      series: [
        { name: 'Initiated', data: [320, 380, 290, 450, 340, 420, 380] },
        { name: 'Completed', data: [280, 340, 250, 390, 300, 370, 330] },
        { name: 'Disputed', data: [15, 18, 12, 22, 16, 19, 17] },
      ],
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    month: {
      series: [
        { name: 'Initiated', data: [2100, 2400, 1900, 2800, 2200, 2600, 2300, 2500, 2100, 2700, 2900, 3100] },
        { name: 'Completed', data: [1900, 2200, 1700, 2500, 1950, 2350, 2050, 2250, 1850, 2400, 2600, 2800] },
        { name: 'Disputed', data: [85, 95, 75, 110, 88, 102, 92, 98, 82, 105, 115, 125] },
      ],
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
  },
  topIndustries: {
    day: [
      { industry: 'Real Estate', volume: 3200000, transactions: 45, growth: 8.2 },
      { industry: 'Commodities', volume: 2100000, transactions: 67, growth: 12.5 },
      { industry: 'Digital Assets', volume: 1800000, transactions: 89, growth: -2.1 },
      { industry: 'Collectibles', volume: 950000, transactions: 23, growth: 15.7 },
      { industry: 'Vehicles', volume: 400000, transactions: 12, growth: 5.3 },
    ],
    week: [
      { industry: 'Real Estate', volume: 22400000, transactions: 315, growth: 10.8 },
      { industry: 'Commodities', volume: 14700000, transactions: 469, growth: 15.2 },
      { industry: 'Digital Assets', volume: 12600000, transactions: 623, growth: 1.7 },
      { industry: 'Collectibles', volume: 6650000, transactions: 161, growth: 18.9 },
      { industry: 'Vehicles', volume: 2800000, transactions: 84, growth: 7.8 },
    ],
    month: [
      { industry: 'Real Estate', volume: 89600000, transactions: 1260, growth: 15.2 },
      { industry: 'Commodities', volume: 58800000, transactions: 1876, growth: 18.7 },
      { industry: 'Digital Assets', volume: 50400000, transactions: 2492, growth: 5.3 },
      { industry: 'Collectibles', volume: 26600000, transactions: 644, growth: 22.1 },
      { industry: 'Vehicles', volume: 11200000, transactions: 336, growth: 9.4 },
    ],
  },
  userActivity: {
    day: [
      { region: 'Middle East', users: 1247, sessions: 3456, avgSession: '12m 34s' },
      { region: 'North America', users: 892, sessions: 2341, avgSession: '15m 12s' },
      { region: 'Europe', users: 634, sessions: 1789, avgSession: '18m 45s' },
      { region: 'Asia Pacific', users: 456, sessions: 1234, avgSession: '14m 23s' },
      { region: 'Africa', users: 234, sessions: 567, avgSession: '11m 56s' },
    ],
    week: [
      { region: 'Middle East', users: 8729, sessions: 24192, avgSession: '13m 45s' },
      { region: 'North America', users: 6244, sessions: 16387, avgSession: '16m 23s' },
      { region: 'Europe', users: 4438, sessions: 12523, avgSession: '19m 12s' },
      { region: 'Asia Pacific', users: 3192, sessions: 8638, avgSession: '15m 34s' },
      { region: 'Africa', users: 1638, sessions: 3969, avgSession: '12m 45s' },
    ],
    month: [
      { region: 'Middle East', users: 34916, sessions: 96768, avgSession: '14m 12s' },
      { region: 'North America', users: 24976, sessions: 65548, avgSession: '17m 45s' },
      { region: 'Europe', users: 17752, sessions: 50092, avgSession: '20m 23s' },
      { region: 'Asia Pacific', users: 12768, sessions: 34552, avgSession: '16m 12s' },
      { region: 'Africa', users: 6552, sessions: 15876, avgSession: '13m 34s' },
    ],
  },
};

const timeOptions = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

function TrendIndicator({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  return (
    <span className={cn(
      'flex items-center gap-1 text-sm font-medium',
      isPositive && 'text-green-600',
      isNegative && 'text-red-600',
      !isPositive && !isNegative && 'text-muted-foreground'
    )}>
      {isPositive && <Icon name="arrow-trending-up" size="xs" />}
      {isNegative && <Icon name="arrow-trending-down" size="xs" />}
      {Math.abs(value)}%
    </span>
  );
}

export interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [timeType, setTimeType] = useState<'day' | 'week' | 'month'>('month');
  
  const metrics = analyticsData.platformMetrics[timeType];
  const transactionFlow = analyticsData.transactionFlow[timeType];
  const topIndustries = analyticsData.topIndustries[timeType];
  const userActivity = analyticsData.userActivity[timeType];

  const chartOptions = useChart({
    xaxis: { categories: transactionFlow.categories },
    colorScheme: 'gold',
  });

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Title as="h2" className="text-2xl mb-1">
            Analytics Overview
          </Title>
          <Text variant="body2" color="secondary">
            Comprehensive platform analytics and performance insights
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Text variant="body2" color="secondary">
            Show by:
          </Text>
          <div className="flex gap-1">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeType === option.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTimeType(option.value as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Transactions"
          value={metrics.totalTransactions}
          change={metrics.transactionChange}
          changePeriod={`vs last ${timeType}`}
          icon="document-duplicate"
          iconColor="primary"
          variant="default"
        />
        
        <MetricCard
          title="Transaction Volume"
          value={metrics.totalVolume}
          change={metrics.volumeChange}
          changePeriod={`vs last ${timeType}`}
          icon="banknotes"
          iconColor="success"
          variant="gold"
          valueFormatter={(value) => `$${(value as number).toLocaleString()}`}
        />
        
        <MetricCard
          title="Avg Processing Time"
          value={metrics.avgProcessingTime}
          change={metrics.timeChange}
          changePeriod={`vs last ${timeType}`}
          icon="clock"
          iconColor="warning"
        />
      </div>

      {/* Transaction Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Title as="h3" className="text-lg">
              Transaction Flow Analysis
            </Title>
          </CardTitle>
          <CardAction>
            <Button variant="outline" size="sm">
              <Icon name="arrow-down-tray" size="sm" />
              Export Data
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Chart
            type="line"
            series={transactionFlow.series}
            options={chartOptions}
            height={350}
          />
        </CardContent>
      </Card>

      {/* Industry Performance & User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Industries */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Title as="h3" className="text-lg">
                Top Industries by Volume
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
            <div className="space-y-4">
              {topIndustries.map((industry, index) => (
                <div key={industry.industry} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <Text variant="body2" className="font-medium">
                        {industry.industry}
                      </Text>
                      <Text variant="caption" color="secondary">
                        {industry.transactions} transactions
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text variant="body2" className="font-medium">
                      ${industry.volume.toLocaleString()}
                    </Text>
                    <TrendIndicator value={industry.growth} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Activity by Region */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Title as="h3" className="text-lg">
                User Activity by Region
              </Title>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userActivity.map((region) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text variant="body2" className="font-medium">
                      {region.region}
                    </Text>
                    <Text variant="caption" color="secondary">
                      {region.users.toLocaleString()} users
                    </Text>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Text variant="caption" color="secondary">
                      {region.sessions.toLocaleString()} sessions
                    </Text>
                    <Text variant="caption" color="secondary">
                      Avg: {region.avgSession}
                    </Text>
                  </div>
                  <Progress 
                    value={(region.users / Math.max(...userActivity.map(r => r.users))) * 100} 
                    variant="gold"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}