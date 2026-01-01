import { z } from 'zod';
export declare const TimeframeSchema: z.ZodEnum<["1h", "24h", "7d", "30d", "90d", "1y", "all"]>;
export declare const BaseMetricSchema: z.ZodObject<{
    value: z.ZodNumber;
    change: z.ZodOptional<z.ZodNumber>;
    trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
    lastUpdated: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value: number;
    lastUpdated: number;
    change?: number | undefined;
    trend?: "up" | "down" | "stable" | undefined;
}, {
    value: number;
    lastUpdated: number;
    change?: number | undefined;
    trend?: "up" | "down" | "stable" | undefined;
}>;
export declare const DealMetricsSchema: z.ZodObject<{
    totalDeals: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    openDeals: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    closedDeals: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    disputedDeals: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    avgDealDuration: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    avgDealValue: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    recentDealsList: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        amount: z.ZodString;
        status: z.ZodEnum<["draft", "funded", "approved", "released", "disputed", "resolved"]>;
        createdAt: z.ZodNumber;
        parties: z.ZodObject<{
            buyer: z.ZodString;
            seller: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            buyer: string;
            seller: string;
        }, {
            buyer: string;
            seller: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        status: "draft" | "funded" | "approved" | "released" | "disputed" | "resolved";
        amount: string;
        createdAt: number;
        id: string;
        title: string;
        parties: {
            buyer: string;
            seller: string;
        };
    }, {
        status: "draft" | "funded" | "approved" | "released" | "disputed" | "resolved";
        amount: string;
        createdAt: number;
        id: string;
        title: string;
        parties: {
            buyer: string;
            seller: string;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalDeals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    openDeals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    closedDeals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    disputedDeals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    avgDealDuration: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    avgDealValue: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    recentDealsList: {
        status: "draft" | "funded" | "approved" | "released" | "disputed" | "resolved";
        amount: string;
        createdAt: number;
        id: string;
        title: string;
        parties: {
            buyer: string;
            seller: string;
        };
    }[];
}, {
    totalDeals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    openDeals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    closedDeals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    disputedDeals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    avgDealDuration: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    avgDealValue: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    recentDealsList: {
        status: "draft" | "funded" | "approved" | "released" | "disputed" | "resolved";
        amount: string;
        createdAt: number;
        id: string;
        title: string;
        parties: {
            buyer: string;
            seller: string;
        };
    }[];
}>;
export declare const PaymasterMetricsSchema: z.ZodObject<{
    totalGasSponsored: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    failedRelays: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    avgGasPerDeal: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    mostActiveSponsors: z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        totalSponsored: z.ZodNumber;
        dealsCount: z.ZodNumber;
        successRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        address: string;
        totalSponsored: number;
        dealsCount: number;
        successRate: number;
    }, {
        address: string;
        totalSponsored: number;
        dealsCount: number;
        successRate: number;
    }>, "many">;
    highestValueRelays: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        amount: z.ZodString;
        gasUsed: z.ZodString;
        sponsor: z.ZodString;
        timestamp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        amount: string;
        timestamp: number;
        id: string;
        gasUsed: string;
        sponsor: string;
    }, {
        amount: string;
        timestamp: number;
        id: string;
        gasUsed: string;
        sponsor: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalGasSponsored: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    failedRelays: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    avgGasPerDeal: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    mostActiveSponsors: {
        address: string;
        totalSponsored: number;
        dealsCount: number;
        successRate: number;
    }[];
    highestValueRelays: {
        amount: string;
        timestamp: number;
        id: string;
        gasUsed: string;
        sponsor: string;
    }[];
}, {
    totalGasSponsored: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    failedRelays: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    avgGasPerDeal: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    mostActiveSponsors: {
        address: string;
        totalSponsored: number;
        dealsCount: number;
        successRate: number;
    }[];
    highestValueRelays: {
        amount: string;
        timestamp: number;
        id: string;
        gasUsed: string;
        sponsor: string;
    }[];
}>;
export declare const DisputeMetricsSchema: z.ZodObject<{
    totalDisputes: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    avgResolutionTime: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    outcomeBreakdown: z.ZodObject<{
        buyerWins: z.ZodNumber;
        sellerWins: z.ZodNumber;
        splitDecisions: z.ZodNumber;
        withdrawn: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        buyerWins: number;
        sellerWins: number;
        splitDecisions: number;
        withdrawn: number;
    }, {
        buyerWins: number;
        sellerWins: number;
        splitDecisions: number;
        withdrawn: number;
    }>;
    severityLevels: z.ZodObject<{
        low: z.ZodNumber;
        medium: z.ZodNumber;
        high: z.ZodNumber;
        critical: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        low: number;
        medium: number;
        high: number;
        critical: number;
    }, {
        low: number;
        medium: number;
        high: number;
        critical: number;
    }>;
    activeDisputes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        dealId: z.ZodString;
        reason: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
        createdAt: z.ZodNumber;
        status: z.ZodEnum<["open", "under_review", "resolved"]>;
    }, "strip", z.ZodTypeAny, {
        status: "resolved" | "open" | "under_review";
        dealId: string;
        reason: string;
        createdAt: number;
        id: string;
        severity: "low" | "medium" | "high" | "critical";
    }, {
        status: "resolved" | "open" | "under_review";
        dealId: string;
        reason: string;
        createdAt: number;
        id: string;
        severity: "low" | "medium" | "high" | "critical";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalDisputes: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    avgResolutionTime: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    outcomeBreakdown: {
        buyerWins: number;
        sellerWins: number;
        splitDecisions: number;
        withdrawn: number;
    };
    severityLevels: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    activeDisputes: {
        status: "resolved" | "open" | "under_review";
        dealId: string;
        reason: string;
        createdAt: number;
        id: string;
        severity: "low" | "medium" | "high" | "critical";
    }[];
}, {
    totalDisputes: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    avgResolutionTime: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    outcomeBreakdown: {
        buyerWins: number;
        sellerWins: number;
        splitDecisions: number;
        withdrawn: number;
    };
    severityLevels: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    activeDisputes: {
        status: "resolved" | "open" | "under_review";
        dealId: string;
        reason: string;
        createdAt: number;
        id: string;
        severity: "low" | "medium" | "high" | "critical";
    }[];
}>;
export declare const AdapterMetricsSchema: z.ZodObject<{
    realEstateCount: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    shipmentActivity: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    customsClearanceRate: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    assayApprovals: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    pluginMetrics: z.ZodRecord<z.ZodString, z.ZodObject<{
        totalTransactions: z.ZodNumber;
        successRate: z.ZodNumber;
        avgValue: z.ZodNumber;
        lastActivity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        successRate: number;
        totalTransactions: number;
        avgValue: number;
        lastActivity: number;
    }, {
        successRate: number;
        totalTransactions: number;
        avgValue: number;
        lastActivity: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    realEstateCount: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    shipmentActivity: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    customsClearanceRate: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    assayApprovals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    pluginMetrics: Record<string, {
        successRate: number;
        totalTransactions: number;
        avgValue: number;
        lastActivity: number;
    }>;
}, {
    realEstateCount: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    shipmentActivity: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    customsClearanceRate: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    assayApprovals: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    pluginMetrics: Record<string, {
        successRate: number;
        totalTransactions: number;
        avgValue: number;
        lastActivity: number;
    }>;
}>;
export declare const UserActivityMetricsSchema: z.ZodObject<{
    activeUsers: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    newRegistrations: z.ZodObject<{
        value: z.ZodNumber;
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    userRetention: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    topUsers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodEnum<["buyer", "seller", "broker", "admin", "arbiter", "sponsor"]>;
        dealCount: z.ZodNumber;
        totalValue: z.ZodNumber;
        lastActive: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        role: "buyer" | "seller" | "sponsor" | "broker" | "admin" | "arbiter";
        dealCount: number;
        totalValue: number;
        lastActive: number;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        id: string;
        role: "buyer" | "seller" | "sponsor" | "broker" | "admin" | "arbiter";
        dealCount: number;
        totalValue: number;
        lastActive: number;
        email?: string | undefined;
        phone?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    activeUsers: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    newRegistrations: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    userRetention: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    topUsers: {
        id: string;
        role: "buyer" | "seller" | "sponsor" | "broker" | "admin" | "arbiter";
        dealCount: number;
        totalValue: number;
        lastActive: number;
        email?: string | undefined;
        phone?: string | undefined;
    }[];
}, {
    activeUsers: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    newRegistrations: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    userRetention: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    topUsers: {
        id: string;
        role: "buyer" | "seller" | "sponsor" | "broker" | "admin" | "arbiter";
        dealCount: number;
        totalValue: number;
        lastActive: number;
        email?: string | undefined;
        phone?: string | undefined;
    }[];
}>;
export declare const SystemPerformanceMetricsSchema: z.ZodObject<{
    contractLatency: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    gasPrice: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    networkCongestion: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    errorRate: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
    uptime: z.ZodObject<{
        change: z.ZodOptional<z.ZodNumber>;
        trend: z.ZodOptional<z.ZodEnum<["up", "down", "stable"]>>;
        lastUpdated: z.ZodNumber;
    } & {
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }, {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    contractLatency: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    gasPrice: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    networkCongestion: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    errorRate: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    uptime: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
}, {
    contractLatency: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    gasPrice: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    networkCongestion: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    errorRate: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
    uptime: {
        value: number;
        lastUpdated: number;
        change?: number | undefined;
        trend?: "up" | "down" | "stable" | undefined;
    };
}>;
export declare const DashboardConfigSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodEnum<["buyer", "seller", "broker", "admin", "arbiter", "sponsor"]>;
    widgets: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["metric", "chart", "table", "alert"]>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            width: number;
            height: number;
        }, {
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
        config: z.ZodRecord<z.ZodString, z.ZodAny>;
        isVisible: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        type: "metric" | "chart" | "table" | "alert";
        id: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config: Record<string, any>;
        isVisible: boolean;
    }, {
        type: "metric" | "chart" | "table" | "alert";
        id: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config: Record<string, any>;
        isVisible: boolean;
    }>, "many">;
    theme: z.ZodEnum<["light", "dark", "auto"]>;
    refreshInterval: z.ZodNumber;
    lastUpdated: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    lastUpdated: number;
    role: "buyer" | "seller" | "sponsor" | "broker" | "admin" | "arbiter";
    userId: string;
    widgets: {
        type: "metric" | "chart" | "table" | "alert";
        id: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config: Record<string, any>;
        isVisible: boolean;
    }[];
    theme: "light" | "dark" | "auto";
    refreshInterval: number;
}, {
    lastUpdated: number;
    role: "buyer" | "seller" | "sponsor" | "broker" | "admin" | "arbiter";
    userId: string;
    widgets: {
        type: "metric" | "chart" | "table" | "alert";
        id: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        config: Record<string, any>;
        isVisible: boolean;
    }[];
    theme: "light" | "dark" | "auto";
    refreshInterval: number;
}>;
export declare const AlertSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["info", "warning", "error", "success"]>;
    title: z.ZodString;
    message: z.ZodString;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    timestamp: z.ZodNumber;
    isRead: z.ZodBoolean;
    actionRequired: z.ZodBoolean;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "info" | "warning" | "error" | "success";
    timestamp: number;
    id: string;
    title: string;
    severity: "low" | "medium" | "high" | "critical";
    isRead: boolean;
    actionRequired: boolean;
    metadata?: Record<string, any> | undefined;
}, {
    message: string;
    type: "info" | "warning" | "error" | "success";
    timestamp: number;
    id: string;
    title: string;
    severity: "low" | "medium" | "high" | "critical";
    isRead: boolean;
    actionRequired: boolean;
    metadata?: Record<string, any> | undefined;
}>;
export type Timeframe = z.infer<typeof TimeframeSchema>;
export type DealMetrics = z.infer<typeof DealMetricsSchema>;
export type PaymasterMetrics = z.infer<typeof PaymasterMetricsSchema>;
export type DisputeMetrics = z.infer<typeof DisputeMetricsSchema>;
export type AdapterMetrics = z.infer<typeof AdapterMetricsSchema>;
export type UserActivityMetrics = z.infer<typeof UserActivityMetricsSchema>;
export type SystemPerformanceMetrics = z.infer<typeof SystemPerformanceMetricsSchema>;
export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;
export type Alert = z.infer<typeof AlertSchema>;
//# sourceMappingURL=dashboard.d.ts.map