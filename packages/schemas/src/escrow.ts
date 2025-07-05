import { z } from 'zod';

/**
 * Zod schemas for escrow-related data validation
 */

// Base deal schema
export const DealBaseSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  payer: z.string().min(42, "Invalid payer address").max(42, "Invalid payer address"),
  payee: z.string().min(42, "Invalid payee address").max(42, "Invalid payee address"),
  token: z.string().min(42, "Invalid token address").max(42, "Invalid token address").optional(),
  amount: z.string().min(1, "Amount is required"),
  metadata: z.string().optional(),
});

// Create deal schema
export const CreateDealSchema = DealBaseSchema.extend({
  payer: z.string().min(42, "Invalid payer address").max(42, "Invalid payer address"),
  payee: z.string().min(42, "Invalid payee address").max(42, "Invalid payee address"),
  token: z.string().min(42, "Invalid token address").max(42, "Invalid token address").optional(),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount format"),
  metadata: z.string().url("Metadata must be a valid URL").optional(),
});

// Fund deal schema
export const FundDealSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount format").optional(),
  token: z.string().min(42, "Invalid token address").max(42, "Invalid token address").optional(),
});

// Approve milestone schema
export const ApproveMilestoneSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  reason: z.string().min(1, "Approval reason is required").max(500, "Reason too long"),
});

// Release funds schema
export const ReleaseFundsSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  reason: z.string().min(1, "Release reason is required").max(500, "Reason too long"),
});

// Raise dispute schema
export const RaiseDisputeSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  reason: z.string().min(1, "Dispute reason is required").max(1000, "Reason too long"),
  evidence: z.string().url("Evidence must be a valid URL").optional(),
});

// Cancel deal schema
export const CancelDealSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  reason: z.string().min(1, "Cancellation reason is required").max(500, "Reason too long"),
});

// Deal state schema
export const DealStateSchema = z.enum([
  'Created',
  'Funded', 
  'Approved',
  'Released',
  'Disputed',
  'Cancelled'
]);

// Deal event schema
export const DealEventSchema = z.enum([
  'Create',
  'Fund',
  'Approve',
  'Release',
  'Dispute',
  'Cancel'
]);

// Deal response schema
export const DealResponseSchema = z.object({
  dealId: z.string(),
  state: DealStateSchema,
  payer: z.string(),
  payee: z.string(),
  token: z.string().optional(),
  amount: z.string(),
  metadata: z.string().optional(),
  createdAt: z.number(),
  fundedAt: z.number().optional(),
  approvedAt: z.number().optional(),
  releasedAt: z.number().optional(),
  cancelledAt: z.number().optional(),
  contractAddress: z.string().optional(),
});

// FSM log entry schema
export const FSMLogEntrySchema = z.object({
  dealId: z.string(),
  actor: z.string(),
  prevState: DealStateSchema,
  event: DealEventSchema,
  newState: DealStateSchema,
  timestamp: z.number(),
  reason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Deal list response schema
export const DealListResponseSchema = z.object({
  deals: z.array(DealResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

// Deal filter schema
export const DealFilterSchema = z.object({
  state: DealStateSchema.optional(),
  payer: z.string().optional(),
  payee: z.string().optional(),
  token: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'amount', 'state']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type CreateDealInput = z.infer<typeof CreateDealSchema>;
export type FundDealInput = z.infer<typeof FundDealSchema>;
export type ApproveMilestoneInput = z.infer<typeof ApproveMilestoneSchema>;
export type ReleaseFundsInput = z.infer<typeof ReleaseFundsSchema>;
export type RaiseDisputeInput = z.infer<typeof RaiseDisputeSchema>;
export type CancelDealInput = z.infer<typeof CancelDealSchema>;
export type DealState = z.infer<typeof DealStateSchema>;
export type DealEvent = z.infer<typeof DealEventSchema>;
export type DealResponse = z.infer<typeof DealResponseSchema>;
export type FSMLogEntry = z.infer<typeof FSMLogEntrySchema>;
export type DealListResponse = z.infer<typeof DealListResponseSchema>;
export type DealFilter = z.infer<typeof DealFilterSchema>; 