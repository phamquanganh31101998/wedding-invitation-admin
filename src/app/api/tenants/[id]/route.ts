import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { TenantService } from '@/lib/services/tenant-service';
import { TenantUpdateRequest, TenantErrorCode } from '@/types/tenant';
import { createSecurityErrorResponse } from '@/lib/security/tenant-security';

const tenantService = new TenantService();

/**
 * GET /api/tenants/[id] - Get tenant by ID
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
        TenantErrorCode.VALIDATION_ERROR,
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

    const tenant = await tenantService.getTenantById(tenantId);

    if (!tenant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.TENANT_NOT_FOUND,
            message: `Tenant with ID ${tenantId} not found`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tenant,
    });
  } catch (error: any) {
    console.error('Error getting tenant:', error);

    const errorCode = error.message.split(':')[0];
    let statusCode = 500;

    if (errorCode === TenantErrorCode.VALIDATION_ERROR) {
      statusCode = 400;
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
 * PUT /api/tenants/[id] - Update tenant
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      const errorResponse = createSecurityErrorResponse(
        TenantErrorCode.VALIDATION_ERROR,
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

    const updateData: TenantUpdateRequest = {
      bride_name: body.bride_name,
      groom_name: body.groom_name,
      wedding_date: body.wedding_date,
      venue_name: body.venue_name,
      venue_address: body.venue_address,
      venue_map_link: body.venue_map_link,
      theme_primary_color: body.theme_primary_color,
      theme_secondary_color: body.theme_secondary_color,
      email: body.email,
      phone: body.phone,
      is_active: body.is_active,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof TenantUpdateRequest] === undefined) {
        delete updateData[key as keyof TenantUpdateRequest];
      }
    });

    const tenant = await tenantService.updateTenant(tenantId, updateData);

    return NextResponse.json({
      success: true,
      data: tenant,
      message: 'Tenant updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating tenant:', error);

    const errorCode = error.message.split(':')[0];
    let statusCode = 500;

    if (errorCode === TenantErrorCode.VALIDATION_ERROR) {
      statusCode = 400;
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

/**
 * DELETE /api/tenants/[id] - Delete tenant (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      const errorResponse = createSecurityErrorResponse(
        TenantErrorCode.VALIDATION_ERROR,
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

    await tenantService.deleteTenant(tenantId);

    return NextResponse.json({
      success: true,
      message: 'Tenant deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting tenant:', error);

    const errorCode = error.message.split(':')[0];
    let statusCode = 500;

    if (errorCode === TenantErrorCode.VALIDATION_ERROR) {
      statusCode = 400;
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
