import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { 
  Timeframe, 
  DealMetrics, 
  PaymasterMetrics, 
  DisputeMetrics, 
  AdapterMetrics,
  UserActivityMetrics,
  SystemPerformanceMetrics,
  TimeframeSchema 
} from '@escrow/schemas';

// Initialize Firebase Admin
if (!firestore.apps.length) {
  initializeApp();
}

const db = firestore();

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

// Helper function to get time range from timeframe
const getTimeRange = (timeframe: Timeframe): { start: number; end: number } => {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  
  switch (timeframe) {
    case '1h':
      return { start: now - hour, end: now };
    case '24h':
      return { start: now - day, end: now };
    case '7d':
      return { start: now - 7 * day, end: now };
    case '30d':
      return { start: now - 30 * day, end: now };
    case '90d':
      return { start: now - 90 * day, end: now };
    case '1y':
      return { start: now - 365 * day, end: now };
    case 'all':
      return { start: 0, end: now };
    default:
      return { start: now - day, end: now };
  }
};

// Helper function to calculate percentage change
const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper function to determine trend
const getTrend = (change: number): 'up' | 'down' | 'stable' => {
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
};

export const getDealMetrics = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const validation = TimeframeSchema.safeParse(data.timeframe);
    if (!validation.success) {
      return createResponse(false, undefined, 'Invalid timeframe format');
    }

    const timeframe = validation.data;
    const { start, end } = getTimeRange(timeframe);

    // Get deals from Firestore
    const dealsSnapshot = await db.collection('escrows')
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();

    const deals = dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate metrics
    const totalDeals = deals.length;
    const openDeals = deals.filter(deal => ['draft', 'funded'].includes(deal.status)).length;
    const closedDeals = deals.filter(deal => ['released', 'resolved'].includes(deal.status)).length;
    const disputedDeals = deals.filter(deal => ['disputed'].includes(deal.status)).length;

    // Calculate average deal duration (in hours)
    const completedDeals = deals.filter(deal => ['released', 'resolved'].includes(deal.status));
    const avgDealDuration = completedDeals.length > 0 
      ? completedDeals.reduce((sum, deal) => sum + (deal.updatedAt - deal.createdAt), 0) / completedDeals.length / (1000 * 60 * 60)
      : 0;

    // Calculate average deal value
    const totalValue = deals.reduce((sum, deal) => sum + parseFloat(deal.amount || '0'), 0);
    const avgDealValue = deals.length > 0 ? totalValue / deals.length : 0;

    // Get recent deals (last 10)
    const recentDealsList = deals
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(deal => ({
        id: deal.id,
        title: deal.title || `Deal ${deal.id.slice(0, 8)}`,
        amount: deal.amount,
        status: deal.status,
        createdAt: deal.createdAt,
        parties: {
          buyer: deal.parties?.buyer || 'Unknown',
          seller: deal.parties?.seller || 'Unknown',
        },
      }));

    const metrics: DealMetrics = {
      totalDeals: {
        value: totalDeals,
        lastUpdated: Date.now(),
      },
      openDeals: {
        value: openDeals,
        lastUpdated: Date.now(),
      },
      closedDeals: {
        value: closedDeals,
        lastUpdated: Date.now(),
      },
      disputedDeals: {
        value: disputedDeals,
        lastUpdated: Date.now(),
      },
      avgDealDuration: {
        value: avgDealDuration,
        lastUpdated: Date.now(),
      },
      avgDealValue: {
        value: avgDealValue,
        lastUpdated: Date.now(),
      },
      recentDealsList,
    };

    const responseTime = Date.now() - startTime;
    console.log(`getDealMetrics completed in ${responseTime}ms`);

    return createResponse(true, metrics);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getDealMetrics failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const getPaymasterMetrics = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const validation = TimeframeSchema.safeParse(data.timeframe);
    if (!validation.success) {
      return createResponse(false, undefined, 'Invalid timeframe format');
    }

    const timeframe = validation.data;
    const { start, end } = getTimeRange(timeframe);

    // Get paymaster transactions from Firestore
    const transactionsSnapshot = await db.collection('paymaster_transactions')
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .get();

    const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate metrics
    const totalGasSponsored = transactions.reduce((sum, tx) => sum + parseFloat(tx.gasUsed || '0'), 0);
    const failedRelays = transactions.filter(tx => tx.status === 'failed').length;
    const avgGasPerDeal = transactions.length > 0 ? totalGasSponsored / transactions.length : 0;

    // Get most active sponsors
    const sponsorStats = transactions.reduce((acc, tx) => {
      const sponsor = tx.sponsor || 'unknown';
      if (!acc[sponsor]) {
        acc[sponsor] = { totalSponsored: 0, dealsCount: 0, successCount: 0 };
      }
      acc[sponsor].totalSponsored += parseFloat(tx.gasUsed || '0');
      acc[sponsor].dealsCount += 1;
      if (tx.status === 'success') acc[sponsor].successCount += 1;
      return acc;
    }, {} as Record<string, { totalSponsored: number; dealsCount: number; successCount: number }>);

    const mostActiveSponsors = Object.entries(sponsorStats)
      .map(([address, stats]) => ({
        address,
        totalSponsored: stats.totalSponsored,
        dealsCount: stats.dealsCount,
        successRate: stats.dealsCount > 0 ? (stats.successCount / stats.dealsCount) * 100 : 0,
      }))
      .sort((a, b) => b.totalSponsored - a.totalSponsored)
      .slice(0, 10);

    // Get highest value relays
    const highestValueRelays = transactions
      .filter(tx => tx.status === 'success')
      .sort((a, b) => parseFloat(b.amount || '0') - parseFloat(a.amount || '0'))
      .slice(0, 10)
      .map(tx => ({
        id: tx.id,
        amount: tx.amount,
        gasUsed: tx.gasUsed,
        sponsor: tx.sponsor || 'unknown',
        timestamp: tx.timestamp,
      }));

    const metrics: PaymasterMetrics = {
      totalGasSponsored: {
        value: totalGasSponsored,
        lastUpdated: Date.now(),
      },
      failedRelays: {
        value: failedRelays,
        lastUpdated: Date.now(),
      },
      avgGasPerDeal: {
        value: avgGasPerDeal,
        lastUpdated: Date.now(),
      },
      mostActiveSponsors,
      highestValueRelays,
    };

    const responseTime = Date.now() - startTime;
    console.log(`getPaymasterMetrics completed in ${responseTime}ms`);

    return createResponse(true, metrics);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getPaymasterMetrics failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const getDisputeMetrics = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const validation = TimeframeSchema.safeParse(data.timeframe);
    if (!validation.success) {
      return createResponse(false, undefined, 'Invalid timeframe format');
    }

    const timeframe = validation.data;
    const { start, end } = getTimeRange(timeframe);

    // Get disputes from Firestore
    const disputesSnapshot = await db.collection('disputes')
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();

    const disputes = disputesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate metrics
    const totalDisputes = disputes.length;
    
    // Calculate average resolution time
    const resolvedDisputes = disputes.filter(dispute => dispute.status === 'resolved');
    const avgResolutionTime = resolvedDisputes.length > 0
      ? resolvedDisputes.reduce((sum, dispute) => sum + (dispute.resolvedAt - dispute.createdAt), 0) / resolvedDisputes.length / (1000 * 60 * 60)
      : 0;

    // Outcome breakdown
    const outcomeBreakdown = {
      buyerWins: resolvedDisputes.filter(d => d.outcome === 'buyer_wins').length,
      sellerWins: resolvedDisputes.filter(d => d.outcome === 'seller_wins').length,
      splitDecisions: resolvedDisputes.filter(d => d.outcome === 'split').length,
      withdrawn: resolvedDisputes.filter(d => d.outcome === 'withdrawn').length,
    };

    // Severity levels
    const severityLevels = {
      low: disputes.filter(d => d.severity === 'low').length,
      medium: disputes.filter(d => d.severity === 'medium').length,
      high: disputes.filter(d => d.severity === 'high').length,
      critical: disputes.filter(d => d.severity === 'critical').length,
    };

    // Active disputes
    const activeDisputes = disputes
      .filter(d => d.status !== 'resolved')
      .map(dispute => ({
        id: dispute.id,
        dealId: dispute.dealId,
        reason: dispute.reason,
        severity: dispute.severity,
        createdAt: dispute.createdAt,
        status: dispute.status,
      }));

    const metrics: DisputeMetrics = {
      totalDisputes: {
        value: totalDisputes,
        lastUpdated: Date.now(),
      },
      avgResolutionTime: {
        value: avgResolutionTime,
        lastUpdated: Date.now(),
      },
      outcomeBreakdown,
      severityLevels,
      activeDisputes,
    };

    const responseTime = Date.now() - startTime;
    console.log(`getDisputeMetrics completed in ${responseTime}ms`);

    return createResponse(true, metrics);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getDisputeMetrics failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const getAdapterMetrics = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const validation = TimeframeSchema.safeParse(data.timeframe);
    if (!validation.success) {
      return createResponse(false, undefined, 'Invalid timeframe format');
    }

    const timeframe = validation.data;
    const { start, end } = getTimeRange(timeframe);
    const plugin = data.plugin || 'all';

    // Get adapter transactions from Firestore
    const adapterSnapshot = await db.collection('adapter_transactions')
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .get();

    const transactions = adapterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by plugin if specified
    const filteredTransactions = plugin === 'all' 
      ? transactions 
      : transactions.filter(tx => tx.plugin === plugin);

    // Calculate metrics
    const realEstateCount = filteredTransactions.filter(tx => tx.plugin === 'real-estate').length;
    const shipmentActivity = filteredTransactions.filter(tx => tx.plugin === 'metals' || tx.plugin === 'oil-gas').length;
    const customsClearanceRate = filteredTransactions.length > 0 
      ? (filteredTransactions.filter(tx => tx.status === 'cleared').length / filteredTransactions.length) * 100
      : 0;
    const assayApprovals = filteredTransactions.filter(tx => tx.type === 'assay' && tx.status === 'approved').length;

    // Plugin-specific metrics
    const pluginMetrics = transactions.reduce((acc, tx) => {
      const pluginName = tx.plugin || 'unknown';
      if (!acc[pluginName]) {
        acc[pluginName] = { totalTransactions: 0, successCount: 0, totalValue: 0, lastActivity: 0 };
      }
      acc[pluginName].totalTransactions += 1;
      if (tx.status === 'success') acc[pluginName].successCount += 1;
      acc[pluginName].totalValue += parseFloat(tx.value || '0');
      acc[pluginName].lastActivity = Math.max(acc[pluginName].lastActivity, tx.timestamp);
      return acc;
    }, {} as Record<string, { totalTransactions: number; successCount: number; totalValue: number; lastActivity: number }>);

    // Convert to required format
    const formattedPluginMetrics = Object.entries(pluginMetrics).reduce((acc, [plugin, metrics]) => {
      acc[plugin] = {
        totalTransactions: metrics.totalTransactions,
        successRate: metrics.totalTransactions > 0 ? (metrics.successCount / metrics.totalTransactions) * 100 : 0,
        avgValue: metrics.totalTransactions > 0 ? metrics.totalValue / metrics.totalTransactions : 0,
        lastActivity: metrics.lastActivity,
      };
      return acc;
    }, {} as Record<string, { totalTransactions: number; successRate: number; avgValue: number; lastActivity: number }>);

    const metrics: AdapterMetrics = {
      realEstateCount: {
        value: realEstateCount,
        lastUpdated: Date.now(),
      },
      shipmentActivity: {
        value: shipmentActivity,
        lastUpdated: Date.now(),
      },
      customsClearanceRate: {
        value: customsClearanceRate,
        lastUpdated: Date.now(),
      },
      assayApprovals: {
        value: assayApprovals,
        lastUpdated: Date.now(),
      },
      pluginMetrics: formattedPluginMetrics,
    };

    const responseTime = Date.now() - startTime;
    console.log(`getAdapterMetrics completed in ${responseTime}ms`);

    return createResponse(true, metrics);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getAdapterMetrics failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const getUserActivityMetrics = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const validation = TimeframeSchema.safeParse(data.timeframe);
    if (!validation.success) {
      return createResponse(false, undefined, 'Invalid timeframe format');
    }

    const timeframe = validation.data;
    const { start, end } = getTimeRange(timeframe);

    // Get user activity from Firestore
    const usersSnapshot = await db.collection('users')
      .where('lastActive', '>=', start)
      .where('lastActive', '<=', end)
      .get();

    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate metrics
    const activeUsers = users.filter(user => user.lastActive >= start).length;
    const newRegistrations = users.filter(user => user.createdAt >= start).length;
    
    // Calculate retention (simplified - users active in both current and previous period)
    const previousStart = start - (end - start);
    const previousUsers = users.filter(user => user.lastActive >= previousStart && user.lastActive < start);
    const retainedUsers = users.filter(user => 
      user.lastActive >= start && previousUsers.some(pu => pu.id === user.id)
    ).length;
    const userRetention = previousUsers.length > 0 ? (retainedUsers / previousUsers.length) * 100 : 0;

    // Get top users by deal count and value
    const topUsers = users
      .sort((a, b) => (b.dealCount || 0) - (a.dealCount || 0))
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        dealCount: user.dealCount || 0,
        totalValue: user.totalValue || 0,
        lastActive: user.lastActive,
      }));

    const metrics: UserActivityMetrics = {
      activeUsers: {
        value: activeUsers,
        lastUpdated: Date.now(),
      },
      newRegistrations: {
        value: newRegistrations,
        lastUpdated: Date.now(),
      },
      userRetention: {
        value: userRetention,
        lastUpdated: Date.now(),
      },
      topUsers,
    };

    const responseTime = Date.now() - startTime;
    console.log(`getUserActivityMetrics completed in ${responseTime}ms`);

    return createResponse(true, metrics);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getUserActivityMetrics failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
});

export const getSystemPerformanceMetrics = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  try {
    // Validate input
    const validation = TimeframeSchema.safeParse(data.timeframe);
    if (!validation.success) {
      return createResponse(false, undefined, 'Invalid timeframe format');
    }

    const timeframe = validation.data;
    const { start, end } = getTimeRange(timeframe);

    // Get system performance data from Firestore
    const performanceSnapshot = await db.collection('system_performance')
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const performanceData = performanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate metrics
    const contractLatency = performanceData.length > 0
      ? performanceData.reduce((sum, data) => sum + (data.contractLatency || 0), 0) / performanceData.length
      : 0;

    const gasPrice = performanceData.length > 0
      ? performanceData.reduce((sum, data) => sum + (data.gasPrice || 0), 0) / performanceData.length
      : 0;

    const networkCongestion = performanceData.length > 0
      ? performanceData.reduce((sum, data) => sum + (data.networkCongestion || 0), 0) / performanceData.length
      : 0;

    const errorRate = performanceData.length > 0
      ? (performanceData.filter(data => data.hasError).length / performanceData.length) * 100
      : 0;

    const uptime = performanceData.length > 0
      ? (performanceData.filter(data => data.isOnline).length / performanceData.length) * 100
      : 95; // Default uptime

    const metrics: SystemPerformanceMetrics = {
      contractLatency: {
        value: contractLatency,
        lastUpdated: Date.now(),
      },
      gasPrice: {
        value: gasPrice,
        lastUpdated: Date.now(),
      },
      networkCongestion: {
        value: networkCongestion,
        lastUpdated: Date.now(),
      },
      errorRate: {
        value: errorRate,
        lastUpdated: Date.now(),
      },
      uptime: {
        value: uptime,
        lastUpdated: Date.now(),
      },
    };

    const responseTime = Date.now() - startTime;
    console.log(`getSystemPerformanceMetrics completed in ${responseTime}ms`);

    return createResponse(true, metrics);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`getSystemPerformanceMetrics failed in ${responseTime}ms:`, error);
    
    return createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error');
  }
}); 