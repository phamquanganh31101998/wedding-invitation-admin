import { getServerSession } from 'next-auth';
import { TenantErrorCode } from '@/types/tenant';

/**
 * Security utilities for tenant data isolation and access control
 */

export interface SecurityContext {
  isAuthenticated: boolean;
  userId?: string;
  isAdmin: boolean;
}

export interface TenantAccessValidation {
  isValid: boolean;
  error?: {
    code: TenantErrorCode;
    message: string;
  };
}

/**
 * Get current security context from session
 */
export async function getSecurityContext(): Promise<SecurityContext> {
  try {
    const session = await getServerSession();

    return {
      isAuthenticated: !!session?.user,
      userId: session?.user?.id,
      isAdmin: !!session?.user, // In this system, all authenticated users are admins
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      isAdmin: false,
    };
  }
}

/**
 * Validate tenant access permissions
 */
export function validateTenantAccess(
  securityContext: SecurityContext,
  operation: 'read' | 'write' | 'delete'
): TenantAccessValidation {
  // Check if user is authenticated
  if (!securityContext.isAuthenticated) {
    return {
      isValid: false,
      error: {
        code: TenantErrorCode.VALIDATION_ERROR,
        message: 'Authentication required for tenant operations',
      },
    };
  }

  // Check if user has admin privileges
  if (!securityContext.isAdmin) {
    return {
      isValid: false,
      error: {
        code: TenantErrorCode.VALIDATION_ERROR,
        message: 'Admin privileges required for tenant operations',
      },
    };
  }

  // All operations are allowed for authenticated admins
  return { isValid: true };
}

/**
 * Validate tenant ID to prevent injection attacks
 */
export function validateTenantId(tenantId: any): TenantAccessValidation {
  // Check if tenantId is provided
  if (tenantId === undefined || tenantId === null) {
    return {
      isValid: false,
      error: {
        code: TenantErrorCode.VALIDATION_ERROR,
        message: 'Tenant ID is required',
      },
    };
  }

  // Convert to number and validate
  const numericId = parseInt(tenantId);

  if (isNaN(numericId) || numericId <= 0) {
    return {
      isValid: false,
      error: {
        code: TenantErrorCode.VALIDATION_ERROR,
        message: 'Invalid tenant ID format',
      },
    };
  }

  return { isValid: true };
}

/**
 * Sanitize and validate query parameters to prevent SQL injection
 */
export function sanitizeQueryParams(
  params: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    switch (key) {
      case 'id':
      case 'tenant_id':
        // Validate numeric IDs
        const numericValue = parseInt(value);
        if (!isNaN(numericValue) && numericValue > 0) {
          sanitized[key] = numericValue;
        }
        break;

      case 'page':
      case 'limit':
        // Validate pagination parameters
        const pageValue = parseInt(value);
        if (!isNaN(pageValue) && pageValue > 0) {
          sanitized[key] = Math.min(pageValue, key === 'limit' ? 100 : 1000);
        }
        break;

      case 'search':
        // Sanitize search strings
        if (typeof value === 'string') {
          sanitized[key] = value.trim().substring(0, 100);
        }
        break;

      case 'is_active':
        // Validate boolean values
        if (typeof value === 'boolean') {
          sanitized[key] = value;
        } else if (typeof value === 'string') {
          sanitized[key] = value.toLowerCase() === 'true';
        }
        break;

      case 'wedding_date_from':
      case 'wedding_date_to':
        // Validate date strings
        if (typeof value === 'string') {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            sanitized[key] = value;
          }
        }
        break;

      default:
        // For other string fields, basic sanitization
        if (typeof value === 'string') {
          sanitized[key] = value.trim().substring(0, 500);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          sanitized[key] = value;
        }
    }
  }

  return sanitized;
}

/**
 * Create error response for security violations
 */
export function createSecurityErrorResponse(
  code: TenantErrorCode,
  message: string,
  statusCode: number = 403
) {
  return {
    success: false,
    error: {
      code,
      message,
    },
    statusCode,
  };
}

/**
 * Validate cross-tenant data access prevention
 * This ensures that operations are scoped to the correct tenant
 */
export function validateTenantScope(
  requestedTenantId: number,
  dataTenantId: number
): TenantAccessValidation {
  if (requestedTenantId !== dataTenantId) {
    return {
      isValid: false,
      error: {
        code: TenantErrorCode.VALIDATION_ERROR,
        message: 'Cross-tenant data access is not permitted',
      },
    };
  }

  return { isValid: true };
}

/**
 * Rate limiting for tenant operations (basic implementation)
 */
const operationCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  userId: string,
  operation: string,
  maxOperations: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const key = `${userId}:${operation}`;
  const now = Date.now();
  const userOps = operationCounts.get(key);

  if (!userOps || now > userOps.resetTime) {
    operationCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userOps.count >= maxOperations) {
    return false;
  }

  userOps.count++;
  return true;
}
