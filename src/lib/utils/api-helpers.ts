import { NextResponse } from 'next/server';
import { TenantErrorCode } from '@/types/tenant';
import { createSecurityErrorResponse } from '@/lib/security/tenant-security';

/**
 * Validates and parses tenant ID from route params
 * Returns error response if invalid, null if valid
 */
export function checkTenantIdParam(
  id: string
): { tenantId: number; error: null } | { tenantId: null; error: NextResponse } {
  const tenantId = parseInt(id);

  if (isNaN(tenantId)) {
    return {
      tenantId: null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'Invalid tenant ID',
          },
        },
        { status: 400 }
      ),
    };
  }

  return { tenantId, error: null };
}

/**
 * Validates and parses guest ID from route params
 * Returns error response if invalid, null if valid
 */
export function checkGuestIdParam(
  id: string
): { guestId: number; error: null } | { guestId: null; error: NextResponse } {
  const guestId = parseInt(id);

  if (isNaN(guestId)) {
    return {
      guestId: null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'Invalid guest ID',
          },
        },
        { status: 400 }
      ),
    };
  }

  return { guestId, error: null };
}

/**
 * Validates and parses file ID from route params
 * Returns error response if invalid, null if valid
 */
export function checkFileIdParam(
  id: string
): { fileId: number; error: null } | { fileId: null; error: NextResponse } {
  const fileId = parseInt(id);

  if (isNaN(fileId)) {
    return {
      fileId: null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'Invalid file ID',
          },
        },
        { status: 400 }
      ),
    };
  }

  return { fileId, error: null };
}

/**
 * Validates both tenant ID and guest ID from route params
 * Returns error response if either is invalid, null if both valid
 */
export function checkTenantAndGuestIdParams(
  tenantIdStr: string,
  guestIdStr: string
):
  | { tenantId: number; guestId: number; error: null }
  | { tenantId: null; guestId: null; error: NextResponse } {
  const tenantId = parseInt(tenantIdStr);
  const guestId = parseInt(guestIdStr);

  if (isNaN(tenantId) || isNaN(guestId)) {
    return {
      tenantId: null,
      guestId: null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'Invalid tenant ID or guest ID',
          },
        },
        { status: 400 }
      ),
    };
  }

  return { tenantId, guestId, error: null };
}

/**
 * Validates both tenant ID and file ID from route params
 * Returns error response if either is invalid, null if both valid
 */
export function checkTenantAndFileIdParams(
  tenantIdStr: string,
  fileIdStr: string
):
  | { tenantId: number; fileId: number; error: null }
  | { tenantId: null; fileId: null; error: NextResponse } {
  const tenantId = parseInt(tenantIdStr);
  const fileId = parseInt(fileIdStr);

  if (isNaN(tenantId) || isNaN(fileId)) {
    return {
      tenantId: null,
      fileId: null,
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'Invalid tenant ID or file ID',
          },
        },
        { status: 400 }
      ),
    };
  }

  return { tenantId, fileId, error: null };
}
