import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { sponsorService, GasAnalytics } from '@escrow/paymaster';

interface SponsorUsageChartProps {
  sponsorAddress: string;
  className?: string;
}

type ChartType = 'daily' | 'weekly' | 'monthly';
type MetricType = 'gas' | 'transactions' | 'users';

const COLORS = {
  gas: '#3B82F6',
  transactions: '#10B981',
  users: '#F59E0B',
  background: 'rgba(59, 130, 246, 0.1)',
  grid: '#374151'
};

const formatValue = (value: number, metric: MetricType) => {
  switch (metric) {
    case 'gas':
      return `${value.toFixed(4)} ETH`;
    case 'transactions':
      return value.toFixed(0);
    case 'users':
      return value.toFixed(0);
    default:
      return value.toString();
  }
};

const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4">
        <p className="text-gray-600 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatValue(entry.value, metric)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SponsorUsageChart: React.FC<SponsorUsageChartProps> = ({ 
  sponsorAddress, 
  className = '' 
}) => {
  const [analytics, setAnalytics] = useState<GasAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>('daily');
  const [metric, setMetric] = useState<MetricType>('gas');
  const [timeRange, setTimeRange] = useState(7); // days

  useEffect(() => {
    loadAnalytics();
  }, [sponsorAddress]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const sponsorStatus = await sponsorService.getSponsorStatus(sponsorAddress);
      setAnalytics(sponsorStatus.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartData = () => {
    if (!analytics) return [];

    const data = analytics[chartType];
    const limitedData = data.slice(-timeRange);

    return limitedData.map(item => ({
      ...item,
      gasCost: parseFloat(item.gasCost),
      transactions: item.transactions,
      uniqueUsers: Array.isArray(item.uniqueUsers) ? item.uniqueUsers.length : item.uniqueUsers
    }));
  };

  const getPieData = () => {
    if (!analytics) return [];

    const data = getChartData();
    const totalGas = data.reduce((sum, item) => sum + item.gasCost, 0);
    const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);
    const totalUsers = data.reduce((sum, item) => sum + item.uniqueUsers, 0);

    return [
      { name: 'Gas Cost', value: totalGas, color: COLORS.gas },
      { name: 'Transactions', value: totalTransactions, color: COLORS.transactions },
      { name: 'Unique Users', value: totalUsers, color: COLORS.users }
    ];
  };

  const renderChart = () => {
    const data = getChartData();

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No data available for the selected time range</p>
          </div>
        </div>
      );
    }

    const metricKey = metric === 'gas' ? 'gasCost' : metric === 'transactions' ? 'transactions' : 'uniqueUsers';

    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[metric]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS[metric]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.3} />
          <XAxis 
            dataKey={chartType === 'daily' ? 'date' : chartType === 'weekly' ? 'week' : 'month'}
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value) => formatValue(value, metric)}
          />
          <Tooltip 
            content={<CustomTooltip metric={metric} />}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Area
            type="monotone"
            dataKey={metricKey}
            stroke={COLORS[metric]}
            strokeWidth={3}
            fill={`url(#gradient-${metric})`}
            dot={{ fill: COLORS[metric], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: COLORS[metric], strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    const data = getPieData();

    if (data.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatValue(value, 'gas')}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setChartType('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setChartType('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setMetric('gas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              metric === 'gas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Gas Cost
          </button>
          <button
            onClick={() => setMetric('transactions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              metric === 'transactions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setMetric('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              metric === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Users
          </button>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={7}>Last 7 entries</option>
          <option value={14}>Last 14 entries</option>
          <option value={30}>Last 30 entries</option>
          <option value={90}>Last 90 entries</option>
        </select>
      </div>

      {/* Main Chart */}
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {metric === 'gas' ? 'Gas Cost' : metric === 'transactions' ? 'Transaction Count' : 'Unique Users'} 
          {' '}Over Time
        </h3>
        {renderChart()}
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Gas Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {getChartData().reduce((sum, item) => sum + item.gasCost, 0).toFixed(4)} ETH
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {getChartData().reduce((sum, item) => sum + item.transactions, 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {getChartData().reduce((sum, item) => sum + item.uniqueUsers, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pie Chart */}
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution</h3>
        {renderPieChart()}
      </motion.div>
    </div>
  );
}; 