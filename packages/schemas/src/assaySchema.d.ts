import { z } from 'zod';
export declare const assaySchema: z.ZodObject<{
    batchId: z.ZodString;
    metalType: z.ZodEnum<["gold", "silver", "platinum", "palladium", "rhodium"]>;
    purity: z.ZodNumber;
    weight: z.ZodNumber;
    assayer: z.ZodString;
    certificateUri: z.ZodString;
    origin: z.ZodString;
    timestamp: z.ZodString;
    verified: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    verified: boolean;
    batchId: string;
    metalType: "gold" | "silver" | "platinum" | "palladium" | "rhodium";
    purity: number;
    weight: number;
    assayer: string;
    certificateUri: string;
    origin: string;
}, {
    timestamp: string;
    batchId: string;
    metalType: "gold" | "silver" | "platinum" | "palladium" | "rhodium";
    purity: number;
    weight: number;
    assayer: string;
    certificateUri: string;
    origin: string;
    verified?: boolean | undefined;
}>;
export type Assay = z.infer<typeof assaySchema>;
export declare const assayVerificationSchema: z.ZodObject<{
    batchId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    batchId: string;
}, {
    batchId: string;
}>;
export type AssayVerificationRequest = z.infer<typeof assayVerificationSchema>;
export declare const batchRevocationSchema: z.ZodObject<{
    batchId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    batchId: string;
}, {
    reason: string;
    batchId: string;
}>;
export type BatchRevocationRequest = z.infer<typeof batchRevocationSchema>;
export declare const METAL_PURITY_THRESHOLDS: {
    readonly gold: 99.9;
    readonly silver: 99.9;
    readonly platinum: 99.95;
    readonly palladium: 99.95;
    readonly rhodium: 99.9;
};
export type MetalType = keyof typeof METAL_PURITY_THRESHOLDS;
//# sourceMappingURL=assaySchema.d.ts.map