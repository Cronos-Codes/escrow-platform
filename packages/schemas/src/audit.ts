import { z } from 'zod';

// Audit log entry schema for immutable audit trail
export const AuditLogSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  actorRoles: z.array(z.string()),
  entity: z.string(), // 'user', 'escrow', 'dispute', 'paymaster', etc.
  entityId: z.string(),
  action: z.string(), // 'create', 'update', 'delete', 'suspend', 'forceRelease', etc.
  before: z.any().optional(), // Snapshot before change
  after: z.any().optional(), // Snapshot after change
  metadata: z.record(z.any()).optional(),
  timestamp: z.number(),
  signature: z.string(), // HMAC or RSA signature for immutability
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// Admin action queue for high-risk actions requiring approval
export const AdminActionQueueSchema = z.object({
  id: z.string(),
  actionType: z.string(),
  targetEntity: z.string(),
  targetId: z.string(),
  requesterId: z.string(),
  requesterRoles: z.array(z.string()),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  reason: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.number(),
  expiresAt: z.number(),
  approvedBy: z.string().optional(),
  approvedAt: z.number().optional(),
  rejectionReason: z.string().optional(),
});

export type AdminActionQueue = z.infer<typeof AdminActionQueueSchema>;

// User roles and permissions
export const UserRoleSchema = z.enum([
  'ADMIN',
  'OPERATOR', 
  'ARBITER',
  'SUPPORT',
  'BUYER',
  'SELLER',
  'BROKER',
  'SPONSOR'
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

// User profile with roles
export const AdminUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  roles: z.array(UserRoleSchema),
  status: z.enum(['active', 'suspended', 'pending']),
  kycLevel: z.enum(['none', 'basic', 'enhanced', 'verified']),
  createdAt: z.number(),
  lastLoginAt: z.number().optional(),
  suspendedAt: z.number().optional(),
  suspendedBy: z.string().optional(),
  suspendedReason: z.string().optional(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

// High-risk action confirmation
export const HighRiskActionSchema = z.object({
  actionId: z.string(),
  actionType: z.string(),
  targetEntity: z.string(),
  targetId: z.string(),
  requesterId: z.string(),
  confirmationMethod: z.enum(['webauthn', 'otp']),
  status: z.enum(['pending', 'confirmed', 'expired']),
  createdAt: z.number(),
  expiresAt: z.number(),
  confirmedAt: z.number().optional(),
});

export type HighRiskAction = z.infer<typeof HighRiskActionSchema>;
