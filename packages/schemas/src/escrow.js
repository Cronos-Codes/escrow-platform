"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealFilterSchema = exports.DealListResponseSchema = exports.FSMLogEntrySchema = exports.DealResponseSchema = exports.DealEventSchema = exports.DealStateSchema = exports.CancelDealSchema = exports.RaiseDisputeSchema = exports.ReleaseFundsSchema = exports.ApproveMilestoneSchema = exports.FundDealSchema = exports.CreateDealSchema = exports.DealBaseSchema = void 0;
const zod_1 = require("zod");
/**
 * Zod schemas for escrow-related data validation
 */
// Base deal schema
exports.DealBaseSchema = zod_1.z.object({
    dealId: zod_1.z.string().min(1, "Deal ID is required"),
    payer: zod_1.z.string().min(42, "Invalid payer address").max(42, "Invalid payer address"),
    payee: zod_1.z.string().min(42, "Invalid payee address").max(42, "Invalid payee address"),
    token: zod_1.z.string().min(42, "Invalid token address").max(42, "Invalid token address").optional(),
    amount: zod_1.z.string().min(1, "Amount is required"),
    metadata: zod_1.z.string().optional(),
});
// Create deal schema
exports.CreateDealSchema = exports.DealBaseSchema.extend({
    payer: zod_1.z.string().min(42, "Invalid payer address").max(42, "Invalid payer address"),
    payee: zod_1.z.string().min(42, "Invalid payee address").max(42, "Invalid payee address"),
    token: zod_1.z.string().min(42, "Invalid token address").max(42, "Invalid token address").optional(),
    amount: zod_1.z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount format"),
    metadata: zod_1.z.string().url("Metadata must be a valid URL").optional(),
});
// Fund deal schema
exports.FundDealSchema = zod_1.z.object({
    dealId: zod_1.z.string().min(1, "Deal ID is required"),
    amount: zod_1.z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount format").optional(),
    token: zod_1.z.string().min(42, "Invalid token address").max(42, "Invalid token address").optional(),
});
// Approve milestone schema
exports.ApproveMilestoneSchema = zod_1.z.object({
    dealId: zod_1.z.string().min(1, "Deal ID is required"),
    reason: zod_1.z.string().min(1, "Approval reason is required").max(500, "Reason too long"),
});
// Release funds schema
exports.ReleaseFundsSchema = zod_1.z.object({
    dealId: zod_1.z.string().min(1, "Deal ID is required"),
    reason: zod_1.z.string().min(1, "Release reason is required").max(500, "Reason too long"),
});
// Raise dispute schema
exports.RaiseDisputeSchema = zod_1.z.object({
    dealId: zod_1.z.string().min(1, "Deal ID is required"),
    reason: zod_1.z.string().min(1, "Dispute reason is required").max(1000, "Reason too long"),
    evidence: zod_1.z.string().url("Evidence must be a valid URL").optional(),
});
// Cancel deal schema
exports.CancelDealSchema = zod_1.z.object({
    dealId: zod_1.z.string().min(1, "Deal ID is required"),
    reason: zod_1.z.string().min(1, "Cancellation reason is required").max(500, "Reason too long"),
});
// Deal state schema
exports.DealStateSchema = zod_1.z.enum([
    'Created',
    'Funded',
    'Approved',
    'Released',
    'Disputed',
    'Cancelled'
]);
// Deal event schema
exports.DealEventSchema = zod_1.z.enum([
    'Create',
    'Fund',
    'Approve',
    'Release',
    'Dispute',
    'Cancel'
]);
// Deal response schema
exports.DealResponseSchema = zod_1.z.object({
    dealId: zod_1.z.string(),
    state: exports.DealStateSchema,
    payer: zod_1.z.string(),
    payee: zod_1.z.string(),
    token: zod_1.z.string().optional(),
    amount: zod_1.z.string(),
    metadata: zod_1.z.string().optional(),
    createdAt: zod_1.z.number(),
    fundedAt: zod_1.z.number().optional(),
    approvedAt: zod_1.z.number().optional(),
    releasedAt: zod_1.z.number().optional(),
    cancelledAt: zod_1.z.number().optional(),
    contractAddress: zod_1.z.string().optional(),
});
// FSM log entry schema
exports.FSMLogEntrySchema = zod_1.z.object({
    dealId: zod_1.z.string(),
    actor: zod_1.z.string(),
    prevState: exports.DealStateSchema,
    event: exports.DealEventSchema,
    newState: exports.DealStateSchema,
    timestamp: zod_1.z.number(),
    reason: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// Deal list response schema
exports.DealListResponseSchema = zod_1.z.object({
    deals: zod_1.z.array(exports.DealResponseSchema),
    total: zod_1.z.number(),
    page: zod_1.z.number(),
    limit: zod_1.z.number(),
    hasMore: zod_1.z.boolean(),
});
// Deal filter schema
exports.DealFilterSchema = zod_1.z.object({
    state: exports.DealStateSchema.optional(),
    payer: zod_1.z.string().optional(),
    payee: zod_1.z.string().optional(),
    token: zod_1.z.string().optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'amount', 'state']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
//# sourceMappingURL=escrow.js.map