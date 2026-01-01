import { z } from 'zod';
export declare const propertySchema: z.ZodObject<{
    propertyId: z.ZodString;
    owner: z.ZodString;
    location: z.ZodString;
    coordinates: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>;
    size: z.ZodNumber;
    valuation: z.ZodNumber;
    zoning: z.ZodString;
    documentUri: z.ZodString;
    verified: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    propertyId: string;
    owner: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    size: number;
    valuation: number;
    zoning: string;
    documentUri: string;
    verified: boolean;
}, {
    propertyId: string;
    owner: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    size: number;
    valuation: number;
    zoning: string;
    documentUri: string;
    verified?: boolean | undefined;
}>;
export type Property = z.infer<typeof propertySchema>;
export declare const deedTokenizationSchema: z.ZodObject<{
    dealId: z.ZodString;
    propertyData: z.ZodObject<{
        propertyId: z.ZodString;
        owner: z.ZodString;
        location: z.ZodString;
        coordinates: z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>;
        size: z.ZodNumber;
        valuation: z.ZodNumber;
        zoning: z.ZodString;
        documentUri: z.ZodString;
        verified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        propertyId: string;
        owner: string;
        location: string;
        coordinates: {
            lat: number;
            lng: number;
        };
        size: number;
        valuation: number;
        zoning: string;
        documentUri: string;
        verified: boolean;
    }, {
        propertyId: string;
        owner: string;
        location: string;
        coordinates: {
            lat: number;
            lng: number;
        };
        size: number;
        valuation: number;
        zoning: string;
        documentUri: string;
        verified?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    propertyData: {
        propertyId: string;
        owner: string;
        location: string;
        coordinates: {
            lat: number;
            lng: number;
        };
        size: number;
        valuation: number;
        zoning: string;
        documentUri: string;
        verified: boolean;
    };
}, {
    dealId: string;
    propertyData: {
        propertyId: string;
        owner: string;
        location: string;
        coordinates: {
            lat: number;
            lng: number;
        };
        size: number;
        valuation: number;
        zoning: string;
        documentUri: string;
        verified?: boolean | undefined;
    };
}>;
export type DeedTokenizationRequest = z.infer<typeof deedTokenizationSchema>;
export declare const propertyVerificationSchema: z.ZodObject<{
    dealId: z.ZodString;
    signedDocHash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    dealId: string;
    signedDocHash: string;
}, {
    dealId: string;
    signedDocHash: string;
}>;
export type PropertyVerificationRequest = z.infer<typeof propertyVerificationSchema>;
//# sourceMappingURL=propertySchema.d.ts.map