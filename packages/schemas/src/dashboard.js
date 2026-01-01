"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertSchema = exports.DashboardConfigSchema = exports.SystemPerformanceMetricsSchema = exports.UserActivityMetricsSchema = exports.AdapterMetricsSchema = exports.DisputeMetricsSchema = exports.PaymasterMetricsSchema = exports.DealMetricsSchema = exports.BaseMetricSchema = exports.TimeframeSchema = void 0;
const zod_1 = require("zod");
// Timeframe enum for metrics filtering
exports.TimeframeSchema = zod_1.z.enum(['1h', '24h', '7d', '30d', '90d', '1y', 'all']);
// Base metric schema
exports.BaseMetricSchema = zod_1.z.object({
    value: zod_1.z.number(),
    change: zod_1.z.number().optional(), // Percentage change
    trend: zod_1.z.enum(['up', 'down', 'stable']).optional(),
    lastUpdated: zod_1.z.number(),
});
// Deal Metrics Schema
exports.DealMetricsSchema = zod_1.z.object({
    totalDeals: exports.BaseMetricSchema,
    openDeals: exports.BaseMetricSchema,
    closedDeals: exports.BaseMetricSchema,
    disputedDeals: exports.BaseMetricSchema,
    avgDealDuration: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // in hours
    }),
    avgDealValue: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // in USD
    }),
    recentDealsList: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        amount: zod_1.z.string(),
        status: zod_1.z.enum(['draft', 'funded', 'approved', 'released', 'disputed', 'resolved']),
        createdAt: zod_1.z.number(),
        parties: zod_1.z.object({
            buyer: zod_1.z.string(),
            seller: zod_1.z.string(),
        }),
    })),
});
// Paymaster Metrics Schema
exports.PaymasterMetricsSchema = zod_1.z.object({
    totalGasSponsored: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // in ETH
    }),
    failedRelays: exports.BaseMetricSchema,
    avgGasPerDeal: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // in ETH
    }),
    mostActiveSponsors: zod_1.z.array(zod_1.z.object({
        address: zod_1.z.string(),
        totalSponsored: zod_1.z.number(),
        dealsCount: zod_1.z.number(),
        successRate: zod_1.z.number(),
    })),
    highestValueRelays: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        amount: zod_1.z.string(),
        gasUsed: zod_1.z.string(),
        sponsor: zod_1.z.string(),
        timestamp: zod_1.z.number(),
    })),
});
// Dispute Metrics Schema
exports.DisputeMetricsSchema = zod_1.z.object({
    totalDisputes: exports.BaseMetricSchema,
    avgResolutionTime: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // in hours
    }),
    outcomeBreakdown: zod_1.z.object({
        buyerWins: zod_1.z.number(),
        sellerWins: zod_1.z.number(),
        splitDecisions: zod_1.z.number(),
        withdrawn: zod_1.z.number(),
    }),
    severityLevels: zod_1.z.object({
        low: zod_1.z.number(),
        medium: zod_1.z.number(),
        high: zod_1.z.number(),
        critical: zod_1.z.number(),
    }),
    activeDisputes: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        dealId: zod_1.z.string(),
        reason: zod_1.z.string(),
        severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
        createdAt: zod_1.z.number(),
        status: zod_1.z.enum(['open', 'under_review', 'resolved']),
    })),
});
// Adapter Metrics Schema
exports.AdapterMetricsSchema = zod_1.z.object({
    realEstateCount: exports.BaseMetricSchema,
    shipmentActivity: exports.BaseMetricSchema,
    customsClearanceRate: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // percentage
    }),
    assayApprovals: exports.BaseMetricSchema,
    // Plugin-specific metrics
    pluginMetrics: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
        totalTransactions: zod_1.z.number(),
        successRate: zod_1.z.number(),
        avgValue: zod_1.z.number(),
        lastActivity: zod_1.z.number(),
    })),
});
// User Activity Metrics
exports.UserActivityMetricsSchema = zod_1.z.object({
    activeUsers: exports.BaseMetricSchema,
    newRegistrations: exports.BaseMetricSchema,
    userRetention: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // percentage
    }),
    topUsers: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.enum(['buyer', 'seller', 'broker', 'admin', 'arbiter', 'sponsor']),
        dealCount: zod_1.z.number(),
        totalValue: zod_1.z.number(),
        lastActive: zod_1.z.number(),
    })),
});
// System Performance Metrics
exports.SystemPerformanceMetricsSchema = zod_1.z.object({
    contractLatency: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // in milliseconds
    }),
    gasPrice: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // in Gwei
    }),
    networkCongestion: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // percentage
    }),
    errorRate: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // percentage
    }),
    uptime: exports.BaseMetricSchema.extend({
        value: zod_1.z.number(), // percentage
    }),
});
// Dashboard Configuration Schema
exports.DashboardConfigSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    role: zod_1.z.enum(['buyer', 'seller', 'broker', 'admin', 'arbiter', 'sponsor']),
    widgets: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.enum(['metric', 'chart', 'table', 'alert']),
        position: zod_1.z.object({
            x: zod_1.z.number(),
            y: zod_1.z.number(),
            width: zod_1.z.number(),
            height: zod_1.z.number(),
        }),
        config: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        isVisible: zod_1.z.boolean(),
    })),
    theme: zod_1.z.enum(['light', 'dark', 'auto']),
    refreshInterval: zod_1.z.number(), // in seconds
    lastUpdated: zod_1.z.number(),
});
// Alert Schema
exports.AlertSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['info', 'warning', 'error', 'success']),
    title: zod_1.z.string(),
    message: zod_1.z.string(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    timestamp: zod_1.z.number(),
    isRead: zod_1.z.boolean(),
    actionRequired: zod_1.z.boolean(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
//# sourceMappingURL=dashboard.js.map