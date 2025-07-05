import { z } from 'zod';

export const shipmentStatusEnum = z.enum([
  'pending',
  'picked_up',
  'in_transit',
  'customs_clearance',
  'delivered',
  'cancelled',
  'delayed'
]);

export const shipmentSchema = z.object({
  shipmentId: z.string().min(1, 'Shipment ID is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  quantity: z.number().positive('Quantity must be positive'),
  status: shipmentStatusEnum,
  expectedDelivery: z.string().datetime('Expected delivery must be a valid ISO date string'),
  carrier: z.string().min(1, 'Carrier information is required'),
  batchType: z.enum(['crude_oil', 'refined_oil', 'natural_gas', 'lng', 'lpg'], {
    errorMap: () => ({ message: 'Batch type must be one of: crude_oil, refined_oil, natural_gas, lng, lpg' })
  }),
  trackingUrl: z.string().url('Tracking URL must be a valid URL'),
  documents: z.array(z.string().url('Document URLs must be valid URLs')),
  verified: z.boolean().default(false),
  lastUpdated: z.string().datetime('Last updated must be a valid ISO date string'),
});

export type Shipment = z.infer<typeof shipmentSchema>;
export type ShipmentStatus = z.infer<typeof shipmentStatusEnum>;

export const shipmentTrackingSchema = z.object({
  shipmentId: z.string().min(1, 'Shipment ID is required'),
});

export type ShipmentTrackingRequest = z.infer<typeof shipmentTrackingSchema>;

export const deliveryVerificationSchema = z.object({
  shipmentId: z.string().min(1, 'Shipment ID is required'),
  signedProofHash: z.string().min(1, 'Signed proof hash is required'),
});

export type DeliveryVerificationRequest = z.infer<typeof deliveryVerificationSchema>;

export const shipmentRevocationSchema = z.object({
  shipmentId: z.string().min(1, 'Shipment ID is required'),
  reason: z.string().min(1, 'Revocation reason is required'),
});

export type ShipmentRevocationRequest = z.infer<typeof shipmentRevocationSchema>;

// Shipment event types for tracking
export const SHIPMENT_EVENTS = {
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  CUSTOMS_CLEARANCE: 'customs_clearance',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed',
} as const;

export type ShipmentEventType = typeof SHIPMENT_EVENTS[keyof typeof SHIPMENT_EVENTS]; 