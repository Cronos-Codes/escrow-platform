/**
 * @file Schemas Package for Escrow Platform
 * @description Zod validation schemas for all data structures
 */
import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    walletAddress: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["buyer", "seller", "broker", "admin", "arbiter", "sponsor"]>;
    kycStatus: z.ZodEnum<["pending", "verified", "rejected"]>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    createdAt: number;
    id: string;
    role: "buyer" | "seller" | "sponsor" | "broker" | "admin" | "arbiter";
    kycStatus: "verified" | "pending" | "rejected";
    updatedAt: number;
    email?: string | undefined;
    phone?: string | undefined;
    walletAddress?: string | undefined;
}, {
    createdAt: number;
    id: string;
    role: "buyer" | "seller" | "sponsor" | "broker" | "admin" | "arbiter";
    kycStatus: "verified" | "pending" | "rejected";
    updatedAt: number;
    email?: string | undefined;
    phone?: string | undefined;
    walletAddress?: string | undefined;
}>;
export declare const EscrowStateSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<["draft", "funded", "approved", "released", "disputed", "resolved"]>;
    parties: z.ZodObject<{
        buyer: z.ZodString;
        seller: z.ZodString;
        broker: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        buyer: string;
        seller: string;
        broker?: string | undefined;
    }, {
        buyer: string;
        seller: string;
        broker?: string | undefined;
    }>;
    amount: z.ZodString;
    deadline: z.ZodNumber;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "funded" | "approved" | "released" | "disputed" | "resolved";
    amount: string;
    createdAt: number;
    id: string;
    parties: {
        buyer: string;
        seller: string;
        broker?: string | undefined;
    };
    updatedAt: number;
    deadline: number;
}, {
    status: "draft" | "funded" | "approved" | "released" | "disputed" | "resolved";
    amount: string;
    createdAt: number;
    id: string;
    parties: {
        buyer: string;
        seller: string;
        broker?: string | undefined;
    };
    updatedAt: number;
    deadline: number;
}>;
export * from './emailOtpSchema';
export * from './phoneOtpSchema';
export * from './escrow';
export * from './propertySchema';
export * from './assaySchema';
export * from './shipmentSchema';
export * from './dashboard';
export declare const placeholder: () => void;
//# sourceMappingURL=index.d.ts.map