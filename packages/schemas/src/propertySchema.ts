import { z } from 'zod';

export const propertySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
  location: z.string().min(1, 'Location is required'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  }),
  size: z.number().positive('Size must be positive'),
  valuation: z.number().positive('Valuation must be positive'),
  zoning: z.string().min(1, 'Zoning information is required'),
  documentUri: z.string().url('Document URI must be a valid URL'),
  verified: z.boolean().default(false),
});

export type Property = z.infer<typeof propertySchema>;

export const deedTokenizationSchema = z.object({
  dealId: z.string().min(1, 'Deal ID is required'),
  propertyData: propertySchema,
});

export type DeedTokenizationRequest = z.infer<typeof deedTokenizationSchema>;

export const propertyVerificationSchema = z.object({
  dealId: z.string().min(1, 'Deal ID is required'),
  signedDocHash: z.string().min(1, 'Signed document hash is required'),
});

export type PropertyVerificationRequest = z.infer<typeof propertyVerificationSchema>; 