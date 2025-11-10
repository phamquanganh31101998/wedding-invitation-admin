import { NextRequest, NextResponse } from 'next/server';
import {
  SecureGuestRepository,
  GuestUpdateRequest,
} from '@/lib/repositories/secure-guest-repository';
import { TenantErrorCode } from '@/types/tenant';
import {
  getSecurityContext,
  createSecurityErrorResponse,
} from '@/lib/security/tenant-security';
import { checkTenantAndGuestIdParams } from '@/lib/utils/api-helpers';

/**
 * GET /api/tenants/[id]/guests/[guestId] - Get guest by ID with tenant isolation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenantId, guestId, error } = checkTenantAndGuestIdParams(
      resolvedParams.id,
      resolvedParams.guestId
    );
    if (error) return error;

    // Get security context and create secure repository
    const securityContext = await getSecurityContext();
    const guestRepository = new SecureGuestRepository(securityContext);

    const guest = await guestRepository.findById(guestId, tenantId);

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.TENANT_NOT_FOUND,
            message: 'Guest not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: guest,
    });
  } catch (error: any) {
    console.error('Error getting guest:', error);

    const errorCode = error.message.split(':')[0];
    let statusCode = 500;

    if (errorCode === TenantErrorCode.VALIDATION_ERROR) {
      statusCode = 400;
    } else if (errorCode === TenantErrorCode.UNAUTHORIZED) {
      statusCode = 401;
    } else if (errorCode === TenantErrorCode.FORBIDDEN) {
      statusCode = 403;
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

/**
 * PUT /api/tenants/[id]/guests/[guestId] - Update guest with tenant isolation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenantId, guestId, error } = checkTenantAndGuestIdParams(
      resolvedParams.id,
      resolvedParams.guestId
    );
    if (error) return error;

    const body = await request.json();

    const updateData: GuestUpdateRequest = {
      name: body.name,
      relationship: body.relationship,
      attendance: body.attendance,
      message: body.message,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof GuestUpdateRequest] === undefined) {
        delete updateData[key as keyof GuestUpdateRequest];
      }
    });

    // Validate attendance value if provided
    if (
      updateData.attendance &&
      !['yes', 'no', 'maybe'].includes(updateData.attendance)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'Attendance must be one of: yes, no, maybe',
          },
        },
        { status: 400 }
      );
    }

    // Get security context and create secure repository
    const securityContext = await getSecurityContext();
    const guestRepository = new SecureGuestRepository(securityContext);

    const guest = await guestRepository.update(guestId, tenantId, updateData);

    return NextResponse.json({
      success: true,
      data: guest,
      message: 'Guest updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating guest:', error);

    const errorCode = error.message.split(':')[0];
    let statusCode = 500;

    if (errorCode === TenantErrorCode.VALIDATION_ERROR) {
      statusCode = 400;
    } else if (errorCode === TenantErrorCode.TENANT_NOT_FOUND) {
      statusCode = 404;
    } else if (errorCode === TenantErrorCode.UNAUTHORIZED) {
      statusCode = 401;
    } else if (errorCode === TenantErrorCode.FORBIDDEN) {
      statusCode = 403;
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

/**
 * DELETE /api/tenants/[id]/guests/[guestId] - Delete guest with tenant isolation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenantId, guestId, error } = checkTenantAndGuestIdParams(
      resolvedParams.id,
      resolvedParams.guestId
    );
    if (error) return error;

    // Get security context and create secure repository
    const securityContext = await getSecurityContext();
    const guestRepository = new SecureGuestRepository(securityContext);

    await guestRepository.delete(guestId, tenantId);

    return NextResponse.json({
      success: true,
      message: 'Guest deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting guest:', error);

    const errorCode = error.message.split(':')[0];
    let statusCode = 500;

    if (errorCode === TenantErrorCode.VALIDATION_ERROR) {
      statusCode = 400;
    } else if (errorCode === TenantErrorCode.TENANT_NOT_FOUND) {
      statusCode = 404;
    } else if (errorCode === TenantErrorCode.UNAUTHORIZED) {
      statusCode = 401;
    } else if (errorCode === TenantErrorCode.FORBIDDEN) {
      statusCode = 403;
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
