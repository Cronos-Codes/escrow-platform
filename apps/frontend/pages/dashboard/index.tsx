import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DashboardShell, GoldCard, GoldButton, ThemeProvider } from '@escrow/ui';
import { OverviewCard3D } from '../../components/dashboard/OverviewCard3D';
import { LineChart3D } from '../../components/dashboard/LineChart3D';
import { BarChartPhysics } from '../../components/dashboard/BarChartPhysics';
import { DataTable } from '../../components/dashboard/DataTable';
import { TrustScoreRing } from '../../components/dashboard/TrustScoreRing';
import { Heatmap3D } from '../../components/dashboard/Heatmap3D';
import { TimeframeRadial } from '../../components/dashboard/TimeframeRadial';
import { Timeframe, DealMetrics, PaymasterMetrics, DisputeMetrics, AdapterMetrics } from '@escrow/schemas';
import Head from 'next/head';

// Mock data for demonstration
const mockDealMetrics: DealMetrics = {
  totalDeals: { value: 1247, lastUpdated: Date.now() },
  openDeals: { value: 89, lastUpdated: Date.now() },
  closedDeals: { value: 1158, lastUpdated: Date.now() },
  disputedDeals: { value: 12, lastUpdated: Date.now() },
  avgDealDuration: { value: 72, lastUpdated: Date.now() },
  avgDealValue: { value: 45000, lastUpdated: Date.now() },
  recentDealsList: [
    {
      id: '1',
      title: 'Real Estate Transaction',
      amount: '$125,000',
      status: 'funded',
      createdAt: Date.now() - 3600000,
      parties: { buyer: 'Alice', seller: 'Bob' },
    },
    {
      id: '2',
      title: 'Precious Metals Deal',
      amount: '$75,000',
      status: 'released',
      createdAt: Date.now() - 7200000,
      parties: { buyer: 'Charlie', seller: 'Diana' },
    },
  ],
};

const mockPaymasterMetrics: PaymasterMetrics = {
  totalGasSponsored: { value: 12.5, lastUpdated: Date.now() },
  failedRelays: { value: 3, lastUpdated: Date.now() },
  avgGasPerDeal: { value: 0.02, lastUpdated: Date.now() },
  mostActiveSponsors: [
    { address: '0x1234...', totalSponsored: 5.2, dealsCount: 45, successRate: 98.5 },
    { address: '0x5678...', totalSponsored: 3.8, dealsCount: 32, successRate: 96.2 },
  ],
  highestValueRelays: [
    { id: '1', amount: '$250,000', gasUsed: '0.05', sponsor: '0x1234...', timestamp: Date.now() },
    { id: '2', amount: '$180,000', gasUsed: '0.03', sponsor: '0x5678...', timestamp: Date.now() },
  ],
};

const mockDisputeMetrics: DisputeMetrics = {
  totalDisputes: { value: 23, lastUpdated: Date.now() },
  avgResolutionTime: { value: 48, lastUpdated: Date.now() },
  outcomeBreakdown: {
    buyerWins: 8,
    sellerWins: 6,
    splitDecisions: 5,
    withdrawn: 4,
  },
  severityLevels: {
    low: 12,
    medium: 7,
    high: 3,
    critical: 1,
  },
  activeDisputes: [
    {
      id: '1',
      dealId: 'deal-123',
      reason: 'Quality dispute',
      severity: 'medium',
      createdAt: Date.now() - 86400000,
      status: 'open',
    },
  ],
};

const mockAdapterMetrics: AdapterMetrics = {
  realEstateCount: { value: 156, lastUpdated: Date.now() },
  shipmentActivity: { value: 89, lastUpdated: Date.now() },
  customsClearanceRate: { value: 94.5, lastUpdated: Date.now() },
  assayApprovals: { value: 67, lastUpdated: Date.now() },
  pluginMetrics: {
    'real-estate': { totalTransactions: 156, successRate: 98.2, avgValue: 125000, lastActivity: Date.now() },
    'metals': { totalTransactions: 89, successRate: 95.8, avgValue: 75000, lastActivity: Date.now() },
    'oil-gas': { totalTransactions: 45, successRate: 92.1, avgValue: 250000, lastActivity: Date.now() },
  },
};

// Sample chart data
const sampleLineData = Array.from({ length: 20 }, (_, i) => ({
  x: i,
  y: Math.sin(i * 0.5) * 100 + Math.random() * 20,
  timestamp: Date.now() - (20 - i) * 3600000,
}));

const sampleBarData = [
  { label: 'Q1', value: 1200, category: 'Sales' },
  { label: 'Q2', value: 1800, category: 'Sales' },
  { label: 'Q3', value: 1400, category: 'Sales' },
  { label: 'Q4', value: 2200, category: 'Sales' },
];

const sampleHeatmapData = Array.from({ length: 25 }, (_, i) => ({
  x: Math.floor(i / 5),
  y: i % 5,
  value: Math.random() * 1000,
  label: `Point ${Math.floor(i / 5)},${i % 5}`,
  timestamp: Date.now() - Math.random() * 86400000,
}));

// Sample table data
const sampleTableData = [
  { id: '1', name: 'Alice Johnson', role: 'buyer', deals: 15, value: '$450,000', status: 'active' },
  { id: '2', name: 'Bob Smith', role: 'seller', deals: 23, value: '$780,000', status: 'active' },
  { id: '3', name: 'Charlie Brown', role: 'broker', deals: 8, value: '$120,000', status: 'pending' },
  { id: '4', name: 'Diana Prince', role: 'buyer', deals: 12, value: '$320,000', status: 'active' },
];

const tableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'deals', label: 'Deals', sortable: true },
  { key: 'value', label: 'Total Value', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

// Animated counter component
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({ 
  value, 
  prefix = '', 
  suffix = '' 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="text-3xl font-bold text-gold">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

// Metric card component
const MetricCard: React.FC<{
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}> = ({ title, value, prefix, suffix, icon, trend, trendValue }) => {
  return (
    <GoldCard variant="default" className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-success' : 'text-error'
            }`}>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d={
                  trend === 'up' 
                    ? "M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 10.586z"
                    : "M12 13a1 1 0 110 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L12 9.414z"
                } clipRule="evenodd" />
              </svg>
              {trendValue}
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </GoldCard>
  );
};

// Activity item component
const ActivityItem: React.FC<{
  activity: {
    id: number;
    type: string;
    amount: number;
    time: string;
    status: string;
  };
}> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'escrow_created':
        return (
          <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'escrow_completed':
        return (
          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'dispute_opened':
        return (
          <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-gold';
      case 'disputed':
        return 'text-error';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 dark:text-white">
            ${activity.amount.toLocaleString()}
          </p>
          <span className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
            {activity.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {activity.time}
        </p>
      </div>
    </motion.div>
  );
};

// Sidebar navigation component
const SidebarNav: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', icon: '📊', active: true },
    { name: 'Escrows', icon: '💼', active: false },
    { name: 'Disputes', icon: '⚖️', active: false },
    { name: 'Analytics', icon: '📈', active: false },
    { name: 'Settings', icon: '⚙️', active: false },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item, index) => (
        <motion.button
          key={item.name}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
            item.active
              ? 'bg-gold/10 text-gold border border-gold/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ x: 5 }}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="font-medium">{item.name}</span>
        </motion.button>
      ))}
    </nav>
  );
};

// Header content component
const HeaderContent: React.FC = () => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
          <span className="text-black font-bold text-sm">U</span>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          User Name
        </span>
      </div>
      
      <button className="relative p-2 rounded-lg hover:bg-gold/10 transition-colors">
        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></span>
      </button>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const cardsY = useTransform(scrollY, [0, 300], [0, -50]);
  const chartsY = useTransform(scrollY, [0, 400], [0, -30]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Head>
        <title>Dashboard - Gold Escrow</title>
        <meta name="description" content="Gold Escrow platform dashboard" />
      </Head>

      <DashboardShell
        sidebarContent={<SidebarNav />}
        headerContent={<HeaderContent />}
      >
        <div className="space-y-6">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's what's happening with your escrows.
            </p>
          </motion.div>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Escrows"
              value={mockDealMetrics.totalDeals.value}
              icon={
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              trend="up"
              trendValue="+12% this month"
            />
            
            <MetricCard
              title="Active Escrows"
              value={mockDealMetrics.openDeals.value}
              icon={
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend="up"
              trendValue="+5% this week"
            />
            
            <MetricCard
              title="Total Value"
              value={mockDealMetrics.avgDealValue.value}
              prefix="$"
              icon={
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              trend="up"
              trendValue="+8% this month"
            />
            
            <MetricCard
              title="Pending Disputes"
              value={mockDealMetrics.disputedDeals.value}
              icon={
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
              trend="down"
              trendValue="-2 this week"
        />
      </div>

          {/* Recent activity and quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent activity */}
            <div className="lg:col-span-2">
              <GoldCard variant="default" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h2>
                  <GoldButton variant="ghost" size="sm">
                    View All
                  </GoldButton>
                </div>
                
                <div className="space-y-2">
                  {mockDealMetrics.recentDealsList.map((activity, index) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
            </div>
              </GoldCard>
            </div>

            {/* Quick actions */}
            <div className="space-y-6">
              <GoldCard variant="default" className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h2>
                
                <div className="space-y-3">
                  <GoldButton
                    variant="primary"
                    className="w-full"
                    onClick={() => console.log('Create escrow')}
                  >
                    Create New Escrow
                  </GoldButton>
                  
                  <GoldButton
                    variant="outline"
                    className="w-full"
                    onClick={() => console.log('View disputes')}
                  >
                    View Disputes
                  </GoldButton>
                  
                  <GoldButton
                    variant="outline"
                    className="w-full"
                    onClick={() => console.log('Generate report')}
                  >
                    Generate Report
                  </GoldButton>
          </div>
              </GoldCard>

              {/* System status */}
              <GoldCard variant="default" className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  System Status
                </h2>
                
          <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Platform Status
                    </span>
                    <span className="flex items-center text-success text-sm">
                      <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                      Operational
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      API Response
                    </span>
                    <span className="text-sm text-gold">~45ms</span>
            </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Uptime
                    </span>
                    <span className="text-sm text-gold">99.9%</span>
            </div>
          </div>
              </GoldCard>
            </div>
          </div>
      </div>
    </DashboardShell>
    </ThemeProvider>
  );
};

export default DashboardPage; 