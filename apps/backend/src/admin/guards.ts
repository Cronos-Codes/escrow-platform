import * as functions from 'firebase-functions';
import { firestore } from 'firebase-admin';
import { auth } from 'firebase-admin';
import { UserRole, UserRoleSchema } from '@escrow/schemas';

const db = firestore();

// Role hierarchy - higher roles inherit permissions of lower roles
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  ADMIN: ['ADMIN', 'OPERATOR', 'ARBITER', 'SUPPORT', 'BUYER', 'SELLER', 'BROKER', 'SPONSOR'],
  OPERATOR: ['OPERATOR', 'ARBITER', 'SUPPORT', 'BUYER', 'SELLER', 'BROKER', 'SPONSOR'],
  ARBITER: ['ARBITER', 'SUPPORT', 'BUYER', 'SELLER', 'BROKER', 'SPONSOR'],
  SUPPORT: ['SUPPORT', 'BUYER', 'SELLER', 'BROKER', 'SPONSOR'],
  BUYER: ['BUYER'],
  SELLER: ['SELLER'],
  BROKER: ['BROKER'],
  SPONSOR: ['SPONSOR'],
};

// High-risk actions that require additional confirmation
const HIGH_RISK_ACTIONS = [
  'suspendUser',
  'forceReleaseEscrow',
  'cancelEscrow',
  'withdrawPaymaster',
  'deleteUser',
  'updateContractSettings',
];

export interface AuthContext {
  auth: functions.https.CallableContext['auth'];
  uid: string;
  roles: UserRole[];
  email: string;
}

/**
 * Assert that the user has at least one of the required roles
 */
export async function assertRole(
  context: functions.https.CallableContext,
  requiredRoles: UserRole[]
): Promise<AuthContext> {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  const uid = context.auth.uid;
  
  // Get user document from Firestore
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  if (!userData) {
    throw new Error('User data not found');
  }

  // Parse and validate roles
  const userRoles = userData.roles || [];
  const validRoles = userRoles.filter((role: string) => 
    UserRoleSchema.safeParse(role).success
  ) as UserRole[];

  if (validRoles.length === 0) {
    throw new Error('No valid roles assigned');
  }

  // Check if user has any of the required roles
  const hasRequiredRole = validRoles.some(userRole => {
    const inheritedRoles = ROLE_HIERARCHY[userRole] || [];
    return requiredRoles.some(requiredRole => 
      inheritedRoles.includes(requiredRole)
    );
  });

  if (!hasRequiredRole) {
    throw new Error(`Insufficient permissions. Required: ${requiredRoles.join(', ')}. User has: ${validRoles.join(', ')}`);
  }

  return {
    auth: context.auth,
    uid,
    roles: validRoles,
    email: context.auth.token.email || '',
  };
}

/**
 * Assert that the user is an admin
 */
export async function assertAdmin(context: functions.https.CallableContext): Promise<AuthContext> {
  return assertRole(context, ['ADMIN']);
}

/**
 * Assert that the user is an operator or admin
 */
export async function assertOperator(context: functions.https.CallableContext): Promise<AuthContext> {
  return assertRole(context, ['ADMIN', 'OPERATOR']);
}

/**
 * Assert that the user is an arbiter, operator, or admin
 */
export async function assertArbiter(context: functions.https.CallableContext): Promise<AuthContext> {
  return assertRole(context, ['ADMIN', 'OPERATOR', 'ARBITER']);
}

/**
 * Check if an action is high-risk and requires additional confirmation
 */
export function isHighRiskAction(actionType: string): boolean {
  return HIGH_RISK_ACTIONS.includes(actionType);
}

/**
 * Get all roles that a user can manage (for role assignment)
 */
export function getManageableRoles(userRoles: UserRole[]): UserRole[] {
  const manageableRoles = new Set<UserRole>();
  
  userRoles.forEach(role => {
    const inheritedRoles = ROLE_HIERARCHY[role] || [];
    inheritedRoles.forEach(inheritedRole => {
      manageableRoles.add(inheritedRole);
    });
  });

  return Array.from(manageableRoles);
}

/**
 * Validate that a user can assign a specific role
 */
export function canAssignRole(assignerRoles: UserRole[], targetRole: UserRole): boolean {
  return assignerRoles.some(role => {
    const inheritedRoles = ROLE_HIERARCHY[role] || [];
    return inheritedRoles.includes(targetRole);
  });
}

/**
 * Get user's effective permissions based on their roles
 */
export function getEffectivePermissions(userRoles: UserRole[]): string[] {
  const permissions = new Set<string>();
  
  userRoles.forEach(role => {
    switch (role) {
      case 'ADMIN':
        permissions.add('*'); // All permissions
        break;
      case 'OPERATOR':
        permissions.add('manage_users');
        permissions.add('manage_escrows');
        permissions.add('manage_disputes');
        permissions.add('manage_paymasters');
        permissions.add('view_audit_logs');
        permissions.add('manage_risk');
        break;
      case 'ARBITER':
        permissions.add('manage_disputes');
        permissions.add('view_escrows');
        permissions.add('view_users');
        permissions.add('view_audit_logs');
        break;
      case 'SUPPORT':
        permissions.add('view_users');
        permissions.add('view_escrows');
        permissions.add('view_disputes');
        permissions.add('view_audit_logs');
        permissions.add('create_support_tickets');
        break;
    }
  });

  return Array.from(permissions);
}
