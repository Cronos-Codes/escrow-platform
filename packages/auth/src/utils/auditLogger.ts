/**
 * @file Audit Logger
 * @description Logs all credential linking and auth method changes for security monitoring
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';

export type AuditEventType =
  | 'credential_linked'
  | 'credential_unlinked'
  | 'credential_verified'
  | 'auth_method_changed'
  | 'signup'
  | 'login'
  | 'logout'
  | 'password_reset'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'biometric_enabled'
  | 'biometric_disabled';

export interface AuditLogEntry {
  userId: string;
  eventType: AuditEventType;
  credentialType?: 'email' | 'phone' | 'wallet';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: any; // Firestore serverTimestamp
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  userId: string,
  eventType: AuditEventType,
  options?: {
    credentialType?: 'email' | 'phone' | 'wallet';
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    const entry: AuditLogEntry = {
      userId,
      eventType,
      credentialType: options?.credentialType,
      metadata: options?.metadata,
      ipAddress: options?.ipAddress || (typeof window !== 'undefined' ? getClientIP() : undefined),
      userAgent: options?.userAgent || (typeof window !== 'undefined' ? navigator.userAgent : undefined),
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'audit_logs'), entry);
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Get client IP address (simplified - in production, use a proper service)
 */
function getClientIP(): string | undefined {
  // In a real implementation, you'd get this from headers or a service
  // For now, return undefined as it requires server-side handling
  return undefined;
}


