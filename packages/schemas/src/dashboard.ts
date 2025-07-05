import { z } from 'zod';

// Timeframe enum for metrics filtering
export const TimeframeSchema = z.enum(['1h', '24h', '7d', '30d', '90d', '1y', 'all']);

// Base metric schema
export const BaseMetricSchema = z.object({
  value: z.number(),
  change: z.number().optional(), // Percentage change
  trend: z.enum(['up', 'down', 'stable']).optional(),
  lastUpdated: z.number(),
});

// Deal Metrics Schema
export const DealMetricsSchema = z.object({
  totalDeals: BaseMetricSchema,
  openDeals: BaseMetricSchema,
  closedDeals: BaseMetricSchema,
  disputedDeals: BaseMetricSchema,
  avgDealDuration: BaseMetricSchema.extend({
    value: z.number(), // in hours
  }),
  avgDealValue: BaseMetricSchema.extend({
    value: z.number(), // in USD
  }),
  recentDealsList: z.array(z.object({
    id: z.string(),
    title: z.string(),
    amount: z.string(),
    status: z.enum(['draft', 'funded', 'approved', 'released', 'disputed', 'resolved']),
    createdAt: z.number(),
    parties: z.object({
      buyer: z.string(),
      seller: z.string(),
    }),
  })),
});

// Paymaster Metrics Schema
export const PaymasterMetricsSchema = z.object({
  totalGasSponsored: BaseMetricSchema.extend({
    value: z.number(), // in ETH
  }),
  failedRelays: BaseMetricSchema,
  avgGasPerDeal: BaseMetricSchema.extend({
    value: z.number(), // in ETH
  }),
  mostActiveSponsors: z.array(z.object({
    address: z.string(),
    totalSponsored: z.number(),
    dealsCount: z.number(),
    successRate: z.number(),
  })),
  highestValueRelays: z.array(z.object({
    id: z.string(),
    amount: z.string(),
    gasUsed: z.string(),
    sponsor: z.string(),
    timestamp: z.number(),
  })),
});

// Dispute Metrics Schema
export const DisputeMetricsSchema = z.object({
  totalDisputes: BaseMetricSchema,
  avgResolutionTime: BaseMetricSchema.extend({
    value: z.number(), // in hours
  }),
  outcomeBreakdown: z.object({
    buyerWins: z.number(),
    sellerWins: z.number(),
    splitDecisions: z.number(),
    withdrawn: z.number(),
  }),
  severityLevels: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
    critical: z.number(),
  }),
  activeDisputes: z.array(z.object({
    id: z.string(),
    dealId: z.string(),
    reason: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    createdAt: z.number(),
    status: z.enum(['open', 'under_review', 'resolved']),
  })),
});

// Adapter Metrics Schema
export const AdapterMetricsSchema = z.object({
  realEstateCount: BaseMetricSchema,
  shipmentActivity: BaseMetricSchema,
  customsClearanceRate: BaseMetricSchema.extend({
    value: z.number(), // percentage
  }),
  assayApprovals: BaseMetricSchema,
  // Plugin-specific metrics
  pluginMetrics: z.record(z.string(), z.object({
    totalTransactions: z.number(),
    successRate: z.number(),
    avgValue: z.number(),
    lastActivity: z.number(),
  })),
});

// User Activity Metrics
export const UserActivityMetricsSchema = z.object({
  activeUsers: BaseMetricSchema,
  newRegistrations: BaseMetricSchema,
  userRetention: BaseMetricSchema.extend({
    value: z.number(), // percentage
  }),
  topUsers: z.array(z.object({
    id: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(['buyer', 'seller', 'broker', 'admin', 'arbiter', 'sponsor']),
    dealCount: z.number(),
    totalValue: z.number(),
    lastActive: z.number(),
  })),
});

// System Performance Metrics
export const SystemPerformanceMetricsSchema = z.object({
  contractLatency: BaseMetricSchema.extend({
    value: z.number(), // in milliseconds
  }),
  gasPrice: BaseMetricSchema.extend({
    value: z.number(), // in Gwei
  }),
  networkCongestion: BaseMetricSchema.extend({
    value: z.number(), // percentage
  }),
  errorRate: BaseMetricSchema.extend({
    value: z.number(), // percentage
  }),
  uptime: BaseMetricSchema.extend({
    value: z.number(), // percentage
  }),
});

// Dashboard Configuration Schema
export const DashboardConfigSchema = z.object({
  userId: z.string(),
  role: z.enum(['buyer', 'seller', 'broker', 'admin', 'arbiter', 'sponsor']),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.enum(['metric', 'chart', 'table', 'alert']),
    position: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    config: z.record(z.string(), z.any()),
    isVisible: z.boolean(),
  })),
  theme: z.enum(['light', 'dark', 'auto']),
  refreshInterval: z.number(), // in seconds
  lastUpdated: z.number(),
});

// Alert Schema
export const AlertSchema = z.object({
  id: z.string(),
  type: z.enum(['info', 'warning', 'error', 'success']),
  title: z.string(),
  message: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  timestamp: z.number(),
  isRead: z.boolean(),
  actionRequired: z.boolean(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Export all schemas
export type Timeframe = z.infer<typeof TimeframeSchema>;
export type DealMetrics = z.infer<typeof DealMetricsSchema>;
export type PaymasterMetrics = z.infer<typeof PaymasterMetricsSchema>;
export type DisputeMetrics = z.infer<typeof DisputeMetricsSchema>;
export type AdapterMetrics = z.infer<typeof AdapterMetricsSchema>;
export type UserActivityMetrics = z.infer<typeof UserActivityMetricsSchema>;
export type SystemPerformanceMetrics = z.infer<typeof SystemPerformanceMetricsSchema>;
export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;
export type Alert = z.infer<typeof AlertSchema>; 