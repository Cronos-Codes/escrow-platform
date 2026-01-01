/**
 * @file Schemas Package for Escrow Platform
 * @description Zod validation schemas for all data structures
 */

import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  walletAddress: z.string().optional(),
  role: z.enum(['buyer', 'seller', 'broker', 'admin', 'arbiter', 'sponsor']),
  kycStatus: z.enum(['pending', 'verified', 'rejected']),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Escrow schemas
export const EscrowStateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['draft', 'funded', 'approved', 'released', 'disputed', 'resolved']),
  parties: z.object({
    buyer: z.string(),
    seller: z.string(),
    broker: z.string().optional(),
  }),
  amount: z.string(),
  deadline: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Auth schemas
export * from './emailOtpSchema';
export * from './phoneOtpSchema';
export * from './authSchemas';
export * from './escrow';
export * from './propertySchema';
export * from './assaySchema';
export * from './shipmentSchema';

// Admin and audit schemas
export * from './audit';

// Dashboard schemas
export * from './dashboard';

export const placeholder = () => {
  console.log('Schemas package placeholder - Validation schemas to be expanded in subsequent phases');
}; 