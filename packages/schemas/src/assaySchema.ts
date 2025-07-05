import { z } from 'zod';

export const assaySchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  metalType: z.enum(['gold', 'silver', 'platinum', 'palladium', 'rhodium'], {
    errorMap: () => ({ message: 'Metal type must be one of: gold, silver, platinum, palladium, rhodium' })
  }),
  purity: z.number().min(0).max(100, 'Purity must be between 0 and 100'),
  weight: z.number().positive('Weight must be positive'),
  assayer: z.string().min(1, 'Assayer information is required'),
  certificateUri: z.string().url('Certificate URI must be a valid URL'),
  origin: z.string().min(1, 'Origin information is required'),
  timestamp: z.string().datetime('Timestamp must be a valid ISO date string'),
  verified: z.boolean().default(false),
});

export type Assay = z.infer<typeof assaySchema>;

export const assayVerificationSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
});

export type AssayVerificationRequest = z.infer<typeof assayVerificationSchema>;

export const batchRevocationSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  reason: z.string().min(1, 'Revocation reason is required'),
});

export type BatchRevocationRequest = z.infer<typeof batchRevocationSchema>;

// Metal type specific purity thresholds
export const METAL_PURITY_THRESHOLDS = {
  gold: 99.9,
  silver: 99.9,
  platinum: 99.95,
  palladium: 99.95,
  rhodium: 99.9,
} as const;

export type MetalType = keyof typeof METAL_PURITY_THRESHOLDS; 