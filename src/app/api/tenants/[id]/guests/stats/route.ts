import { NextRequest, NextResponse } from 'next/server';
import { SecureGuestRepository } from '@/lib/repositories/secure-guest-repository';
import { TenantErrorCode } from '@/types/tenant';
import {
  getSecurityContext,
  createSecurityErrorResponse,
} from '@/lib/security/tenant-security';

/**
 * GET /api/tenants/[id]/guests/stats - Get guest statistics for a specific tenant
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantId = parseInt(resolvedParams.id);

    if (isNaN(tenantId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'Invalid tenant ID',
          },
        },
        { status: 400 }
      );
    }

    // Get security context and create secure repository
    const securityContext = await getSecurityContext();
    const guestRepository = new SecureGuestRepository(securityContext);

    const stats = await guestRepository.getGuestStats(tenantId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error getting guest statistics:', error);

    const errorCode = error.message.split(':')[0];
    let statusCode = 500;

    if (errorCode === TenantErrorCode.VALIDATION_ERROR) {
      statusCode = 400;
    } else if (errorCode === TenantErrorCode.UNAUTHORIZED) {
      statusCode = 401;
    } else if (errorCode === TenantErrorCode.FORBIDDEN) {
      statusCode = 403;
    } else if (errorCode === TenantErrorCode.TENANT_NOT_FOUND) {
      statusCode = 404;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode || TenantErrorCode.DATABASE_ERROR,
          message: error.message,
        },
      },
      { status: statusCode }
    );
  }
}
