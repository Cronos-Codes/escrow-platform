"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIPMENT_EVENTS = exports.shipmentRevocationSchema = exports.deliveryVerificationSchema = exports.shipmentTrackingSchema = exports.shipmentSchema = exports.shipmentStatusEnum = void 0;
const zod_1 = require("zod");
exports.shipmentStatusEnum = zod_1.z.enum([
    'pending',
    'picked_up',
    'in_transit',
    'customs_clearance',
    'delivered',
    'cancelled',
    'delayed'
]);
exports.shipmentSchema = zod_1.z.object({
    shipmentId: zod_1.z.string().min(1, 'Shipment ID is required'),
    origin: zod_1.z.string().min(1, 'Origin is required'),
    destination: zod_1.z.string().min(1, 'Destination is required'),
    quantity: zod_1.z.number().positive('Quantity must be positive'),
    status: exports.shipmentStatusEnum,
    expectedDelivery: zod_1.z.string().datetime('Expected delivery must be a valid ISO date string'),
    carrier: zod_1.z.string().min(1, 'Carrier information is required'),
    batchType: zod_1.z.enum(['crude_oil', 'refined_oil', 'natural_gas', 'lng', 'lpg'], {
        errorMap: () => ({ message: 'Batch type must be one of: crude_oil, refined_oil, natural_gas, lng, lpg' })
    }),
    trackingUrl: zod_1.z.string().url('Tracking URL must be a valid URL'),
    documents: zod_1.z.array(zod_1.z.string().url('Document URLs must be valid URLs')),
    verified: zod_1.z.boolean().default(false),
    lastUpdated: zod_1.z.string().datetime('Last updated must be a valid ISO date string'),
});
exports.shipmentTrackingSchema = zod_1.z.object({
    shipmentId: zod_1.z.string().min(1, 'Shipment ID is required'),
});
exports.deliveryVerificationSchema = zod_1.z.object({
    shipmentId: zod_1.z.string().min(1, 'Shipment ID is required'),
    signedProofHash: zod_1.z.string().min(1, 'Signed proof hash is required'),
});
exports.shipmentRevocationSchema = zod_1.z.object({
    shipmentId: zod_1.z.string().min(1, 'Shipment ID is required'),
    reason: zod_1.z.string().min(1, 'Revocation reason is required'),
});
// Shipment event types for tracking
exports.SHIPMENT_EVENTS = {
    PICKED_UP: 'picked_up',
    IN_TRANSIT: 'in_transit',
    CUSTOMS_CLEARANCE: 'customs_clearance',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    DELAYED: 'delayed',
};
//# sourceMappingURL=shipmentSchema.js.map