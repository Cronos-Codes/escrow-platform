import { z } from 'zod';
export declare const shipmentStatusEnum: z.ZodEnum<["pending", "picked_up", "in_transit", "customs_clearance", "delivered", "cancelled", "delayed"]>;
export declare const shipmentSchema: z.ZodObject<{
    shipmentId: z.ZodString;
    origin: z.ZodString;
    destination: z.ZodString;
    quantity: z.ZodNumber;
    status: z.ZodEnum<["pending", "picked_up", "in_transit", "customs_clearance", "delivered", "cancelled", "delayed"]>;
    expectedDelivery: z.ZodString;
    carrier: z.ZodString;
    batchType: z.ZodEnum<["crude_oil", "refined_oil", "natural_gas", "lng", "lpg"]>;
    trackingUrl: z.ZodString;
    documents: z.ZodArray<z.ZodString, "many">;
    verified: z.ZodDefault<z.ZodBoolean>;
    lastUpdated: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "picked_up" | "in_transit" | "customs_clearance" | "delivered" | "cancelled" | "delayed";
    verified: boolean;
    origin: string;
    shipmentId: string;
    destination: string;
    quantity: number;
    expectedDelivery: string;
    carrier: string;
    batchType: "lng" | "crude_oil" | "refined_oil" | "natural_gas" | "lpg";
    trackingUrl: string;
    documents: string[];
    lastUpdated: string;
}, {
    status: "pending" | "picked_up" | "in_transit" | "customs_clearance" | "delivered" | "cancelled" | "delayed";
    origin: string;
    shipmentId: string;
    destination: string;
    quantity: number;
    expectedDelivery: string;
    carrier: string;
    batchType: "lng" | "crude_oil" | "refined_oil" | "natural_gas" | "lpg";
    trackingUrl: string;
    documents: string[];
    lastUpdated: string;
    verified?: boolean | undefined;
}>;
export type Shipment = z.infer<typeof shipmentSchema>;
export type ShipmentStatus = z.infer<typeof shipmentStatusEnum>;
export declare const shipmentTrackingSchema: z.ZodObject<{
    shipmentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shipmentId: string;
}, {
    shipmentId: string;
}>;
export type ShipmentTrackingRequest = z.infer<typeof shipmentTrackingSchema>;
export declare const deliveryVerificationSchema: z.ZodObject<{
    shipmentId: z.ZodString;
    signedProofHash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shipmentId: string;
    signedProofHash: string;
}, {
    shipmentId: string;
    signedProofHash: string;
}>;
export type DeliveryVerificationRequest = z.infer<typeof deliveryVerificationSchema>;
export declare const shipmentRevocationSchema: z.ZodObject<{
    shipmentId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    shipmentId: string;
}, {
    reason: string;
    shipmentId: string;
}>;
export type ShipmentRevocationRequest = z.infer<typeof shipmentRevocationSchema>;
export declare const SHIPMENT_EVENTS: {
    readonly PICKED_UP: "picked_up";
    readonly IN_TRANSIT: "in_transit";
    readonly CUSTOMS_CLEARANCE: "customs_clearance";
    readonly DELIVERED: "delivered";
    readonly CANCELLED: "cancelled";
    readonly DELAYED: "delayed";
};
export type ShipmentEventType = typeof SHIPMENT_EVENTS[keyof typeof SHIPMENT_EVENTS];
//# sourceMappingURL=shipmentSchema.d.ts.map