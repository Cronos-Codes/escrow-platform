import { z } from 'zod';
/**
 * Zod schemas for escrow-related data validation
 */
export declare const DealBaseSchema: z.ZodObject<{
    dealId: z.ZodString;
    payer: z.ZodString;
    payee: z.ZodString;
    token: z.ZodOptional<z.ZodString>;
    amount: z.ZodString;
    metadata: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    payer: string;
    payee: string;
    amount: string;
    token?: string | undefined;
    metadata?: string | undefined;
}, {
    dealId: string;
    payer: string;
    payee: string;
    amount: string;
    token?: string | undefined;
    metadata?: string | undefined;
}>;
export declare const CreateDealSchema: z.ZodObject<{
    dealId: z.ZodString;
} & {
    payer: z.ZodString;
    payee: z.ZodString;
    token: z.ZodOptional<z.ZodString>;
    amount: z.ZodString;
    metadata: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    payer: string;
    payee: string;
    amount: string;
    token?: string | undefined;
    metadata?: string | undefined;
}, {
    dealId: string;
    payer: string;
    payee: string;
    amount: string;
    token?: string | undefined;
    metadata?: string | undefined;
}>;
export declare const FundDealSchema: z.ZodObject<{
    dealId: z.ZodString;
    amount: z.ZodOptional<z.ZodString>;
    token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    token?: string | undefined;
    amount?: string | undefined;
}, {
    dealId: string;
    token?: string | undefined;
    amount?: string | undefined;
}>;
export declare const ApproveMilestoneSchema: z.ZodObject<{
    dealId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    reason: string;
}, {
    dealId: string;
    reason: string;
}>;
export declare const ReleaseFundsSchema: z.ZodObject<{
    dealId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    reason: string;
}, {
    dealId: string;
    reason: string;
}>;
export declare const RaiseDisputeSchema: z.ZodObject<{
    dealId: z.ZodString;
    reason: z.ZodString;
    evidence: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    reason: string;
    evidence?: string | undefined;
}, {
    dealId: string;
    reason: string;
    evidence?: string | undefined;
}>;
export declare const CancelDealSchema: z.ZodObject<{
    dealId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    reason: string;
}, {
    dealId: string;
    reason: string;
}>;
export declare const DealStateSchema: z.ZodEnum<["Created", "Funded", "Approved", "Released", "Disputed", "Cancelled"]>;
export declare const DealEventSchema: z.ZodEnum<["Create", "Fund", "Approve", "Release", "Dispute", "Cancel"]>;
export declare const DealResponseSchema: z.ZodObject<{
    dealId: z.ZodString;
    state: z.ZodEnum<["Created", "Funded", "Approved", "Released", "Disputed", "Cancelled"]>;
    payer: z.ZodString;
    payee: z.ZodString;
    token: z.ZodOptional<z.ZodString>;
    amount: z.ZodString;
    metadata: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodNumber;
    fundedAt: z.ZodOptional<z.ZodNumber>;
    approvedAt: z.ZodOptional<z.ZodNumber>;
    releasedAt: z.ZodOptional<z.ZodNumber>;
    cancelledAt: z.ZodOptional<z.ZodNumber>;
    contractAddress: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    payer: string;
    payee: string;
    amount: string;
    state: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
    createdAt: number;
    token?: string | undefined;
    metadata?: string | undefined;
    fundedAt?: number | undefined;
    approvedAt?: number | undefined;
    releasedAt?: number | undefined;
    cancelledAt?: number | undefined;
    contractAddress?: string | undefined;
}, {
    dealId: string;
    payer: string;
    payee: string;
    amount: string;
    state: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
    createdAt: number;
    token?: string | undefined;
    metadata?: string | undefined;
    fundedAt?: number | undefined;
    approvedAt?: number | undefined;
    releasedAt?: number | undefined;
    cancelledAt?: number | undefined;
    contractAddress?: string | undefined;
}>;
export declare const FSMLogEntrySchema: z.ZodObject<{
    dealId: z.ZodString;
    actor: z.ZodString;
    prevState: z.ZodEnum<["Created", "Funded", "Approved", "Released", "Disputed", "Cancelled"]>;
    event: z.ZodEnum<["Create", "Fund", "Approve", "Release", "Dispute", "Cancel"]>;
    newState: z.ZodEnum<["Created", "Funded", "Approved", "Released", "Disputed", "Cancelled"]>;
    timestamp: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    actor: string;
    prevState: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
    event: "Create" | "Fund" | "Approve" | "Release" | "Dispute" | "Cancel";
    newState: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
    timestamp: number;
    metadata?: Record<string, any> | undefined;
    reason?: string | undefined;
}, {
    dealId: string;
    actor: string;
    prevState: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
    event: "Create" | "Fund" | "Approve" | "Release" | "Dispute" | "Cancel";
    newState: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
    timestamp: number;
    metadata?: Record<string, any> | undefined;
    reason?: string | undefined;
}>;
export declare const DealListResponseSchema: z.ZodObject<{
    deals: z.ZodArray<z.ZodObject<{
        dealId: z.ZodString;
        state: z.ZodEnum<["Created", "Funded", "Approved", "Released", "Disputed", "Cancelled"]>;
        payer: z.ZodString;
        payee: z.ZodString;
        token: z.ZodOptional<z.ZodString>;
        amount: z.ZodString;
        metadata: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodNumber;
        fundedAt: z.ZodOptional<z.ZodNumber>;
        approvedAt: z.ZodOptional<z.ZodNumber>;
        releasedAt: z.ZodOptional<z.ZodNumber>;
        cancelledAt: z.ZodOptional<z.ZodNumber>;
        contractAddress: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dealId: string;
        payer: string;
        payee: string;
        amount: string;
        state: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
        createdAt: number;
        token?: string | undefined;
        metadata?: string | undefined;
        fundedAt?: number | undefined;
        approvedAt?: number | undefined;
        releasedAt?: number | undefined;
        cancelledAt?: number | undefined;
        contractAddress?: string | undefined;
    }, {
        dealId: string;
        payer: string;
        payee: string;
        amount: string;
        state: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
        createdAt: number;
        token?: string | undefined;
        metadata?: string | undefined;
        fundedAt?: number | undefined;
        approvedAt?: number | undefined;
        releasedAt?: number | undefined;
        cancelledAt?: number | undefined;
        contractAddress?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    deals: {
        dealId: string;
        payer: string;
        payee: string;
        amount: string;
        state: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
        createdAt: number;
        token?: string | undefined;
        metadata?: string | undefined;
        fundedAt?: number | undefined;
        approvedAt?: number | undefined;
        releasedAt?: number | undefined;
        cancelledAt?: number | undefined;
        contractAddress?: string | undefined;
    }[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}, {
    deals: {
        dealId: string;
        payer: string;
        payee: string;
        amount: string;
        state: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled";
        createdAt: number;
        token?: string | undefined;
        metadata?: string | undefined;
        fundedAt?: number | undefined;
        approvedAt?: number | undefined;
        releasedAt?: number | undefined;
        cancelledAt?: number | undefined;
        contractAddress?: string | undefined;
    }[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}>;
export declare const DealFilterSchema: z.ZodObject<{
    state: z.ZodOptional<z.ZodEnum<["Created", "Funded", "Approved", "Released", "Disputed", "Cancelled"]>>;
    payer: z.ZodOptional<z.ZodString>;
    payee: z.ZodOptional<z.ZodString>;
    token: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "amount", "state"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "amount" | "state" | "createdAt";
    sortOrder: "asc" | "desc";
    payer?: string | undefined;
    payee?: string | undefined;
    token?: string | undefined;
    state?: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled" | undefined;
}, {
    payer?: string | undefined;
    payee?: string | undefined;
    token?: string | undefined;
    state?: "Created" | "Funded" | "Approved" | "Released" | "Disputed" | "Cancelled" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "amount" | "state" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
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
//# sourceMappingURL=escrow.d.ts.map