import type { NextApiRequest, NextApiResponse } from 'next';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

const createResponse = <T>(success: boolean, data?: T, error?: string): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

// Generate mock data for development
function generateMockData(timeframe: string) {
  const now = Date.now();
  
  // Generate chart data for last 6 months
  const chartData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const baseBalance = 100000 + (5 - i) * 5000;
    const variance = Math.random() * 10000 - 5000;
    
    chartData.push({
      month: monthNames[date.getMonth()],
      balance: baseBalance + variance,
      escrows: 5 + Math.floor(Math.random() * 10),
    });
  }

  // Generate recent transactions
  const transactionTypes = ['escrow_created', 'deposit', 'escrow_release', 'withdrawal'];
  const transactionDescriptions = [
    'Gold Escrow - Premium Bars',
    'Bank Transfer Deposit',
    'Escrow Release - Industrial Gold',
    'Withdrawal to Bank Account',
    'Cryptocurrency Deposit',
    'Gold Purchase Transaction',
    'Escrow Completion Payment',
    'Wire Transfer Received',
  ];
  const statuses = ['completed', 'pending', 'active'];

  const recentTransactions = [];
  for (let i = 0; i < 10; i++) {
    const daysAgo = i;
    const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const amount = (Math.random() * 50000 + 5000) * (Math.random() > 0.3 ? 1 : -1);
    
    recentTransactions.push({
      id: `txn-${i + 1}`,
      type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
      amount,
      description: transactionDescriptions[Math.floor(Math.random() * transactionDescriptions.length)],
      timestamp,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }

  return {
    wallet: {
      totalBalance: 125430.50 + Math.random() * 10000,
      cryptoBalance: 89320.75 + Math.random() * 5000,
      fiatBalance: 36109.75 + Math.random() * 3000,
      goldValue: 45000.00 + Math.random() * 2000,
      currency: 'USD',
      change24h: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 5).toFixed(1)}%`,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
    escrows: {
      active: 3 + Math.floor(Math.random() * 5),
      pending: 1 + Math.floor(Math.random() * 3),
      completed: 12 + Math.floor(Math.random() * 10),
      totalValue: 750000 + Math.random() * 100000,
      recentEscrows: [
        {
          id: 'esc-1',
          title: 'Gold Bullion Escrow',
          amount: 50000,
          status: 'active',
          createdAt: now - 2 * 24 * 60 * 60 * 1000,
          counterparty: '0x1234...5678',
        },
        {
          id: 'esc-2',
          title: 'Silver Bars Transaction',
          amount: 25000,
          status: 'pending',
          createdAt: now - 1 * 24 * 60 * 60 * 1000,
          counterparty: '0xabcd...efgh',
        },
      ],
    },
    transactions: {
      total: 156 + Math.floor(Math.random() * 50),
      pending: 2 + Math.floor(Math.random() * 5),
      completed: 152 + Math.floor(Math.random() * 40),
      failed: 2 + Math.floor(Math.random() * 3),
      recentTransactions,
    },
    disputes: {
      open: Math.floor(Math.random() * 2),
      resolved: 3 + Math.floor(Math.random() * 5),
      escalated: Math.floor(Math.random() * 2),
    },
    analytics: {
      chartData,
      performanceMetrics: {
        successRate: 95 + Math.random() * 4,
        avgDealDuration: 24 + Math.random() * 48,
        totalVolume: 1500000 + Math.random() * 500000,
      },
    },
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Allow both GET and POST for easier testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json(createResponse(false, undefined, 'Method not allowed'));
  }

  try {
    const timeframe = req.body?.timeframe || req.query.timeframe || '30d';
    // Check multiple sources for userId: body (from our hook), query, or headers
    const userId = req.body?.userId || req.query.userId as string || req.headers['x-user-id'] as string;

    // For development, allow demo user if no userId provided
    const effectiveUserId = userId || 'demo-user-id';
    
    if (process.env.NODE_ENV === 'production' && !userId) {
      return res.status(401).json(createResponse(false, undefined, 'User not authenticated'));
    }

    // Simulate slight delay for realistic API behavior
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generate and return mock data
    const dashboardData = generateMockData(timeframe as string);

    return res.status(200).json(createResponse(true, dashboardData));

  } catch (error) {
    console.error('Dashboard API error:', error);
    return res.status(500).json(
      createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error')
    );
  }
}
