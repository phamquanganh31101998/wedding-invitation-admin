import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  SecureGuestRepository,
  GuestCreateRequest,
  GuestFilters,
} from '@/lib/repositories/secure-guest-repository';
import { TenantErrorCode } from '@/types/tenant';
import {
  getSecurityContext,
  createSecurityErrorResponse,
} from '@/lib/security/tenant-security';

/**
 * GET /api/tenants/[id]/guests - List guests for a specific tenant
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      const errorResponse = createSecurityErrorResponse(
        TenantErrorCode.UNAUTHORIZED,
        'Authentication required',
        401
      );
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

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

    const { searchParams } = new URL(request.url);

    // Parse filters with mandatory tenant_id for data isolation
    const filters: GuestFilters = {
      tenant_id: tenantId, // Always enforce tenant isolation
      attendance:
        (searchParams.get('attendance') as 'yes' | 'no' | 'maybe') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Parse pagination
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    // Get security context and create secure repository
    const securityContext = await getSecurityContext();
    const guestRepository = new SecureGuestRepository(securityContext);

    const result = await guestRepository.findMany(filters, pagination);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error listing guests:', error);

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
 * POST /api/tenants/[id]/guests - Create a new guest for a specific tenant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      const errorResponse = createSecurityErrorResponse(
        TenantErrorCode.UNAUTHORIZED,
        'Authentication required',
        401
      );
      return NextResponse.json(errorResponse, {
        status: errorResponse.statusCode,
      });
    }

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

    const body = await request.json();

    // Validate required fields and enforce tenant isolation
    const createData: GuestCreateRequest = {
      tenant_id: tenantId, // Always use the tenant ID from the URL for security
      name: body.name,
      relationship: body.relationship,
      attendance: body.attendance,
      message: body.message,
    };

    // Validate attendance value
    if (!['yes', 'no', 'maybe'].includes(createData.attendance)) {
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

    const guest = await guestRepository.create(createData);

    return NextResponse.json(
      {
        success: true,
        data: guest,
        message: 'Guest created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating guest:', error);

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
