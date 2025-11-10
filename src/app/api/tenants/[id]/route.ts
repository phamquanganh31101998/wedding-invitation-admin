import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from '@/lib/services/tenant-service';
import { TenantUpdateRequest, TenantErrorCode } from '@/types/tenant';
import { createSecurityErrorResponse } from '@/lib/security/tenant-security';
import {
  convertObjectToSnakeCase,
  convertObjectToCamelCase,
} from '@/lib/utils/case-conversion';
import { checkTenantIdParam } from '@/lib/utils/api-helpers';

const tenantService = new TenantService();

/**
 * GET /api/tenants/[id] - Get tenant by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenantId, error } = checkTenantIdParam(resolvedParams.id);
    if (error) return error;

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

    // Convert snake_case to camelCase for frontend
    const convertedTenant = convertObjectToCamelCase(tenant);

    return NextResponse.json({
      success: true,
      data: convertedTenant,
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
    const resolvedParams = await params;
    const { tenantId, error } = checkTenantIdParam(resolvedParams.id);
    if (error) return error;

    const body = await request.json();

    // Convert camelCase to snake_case for database
    const updateData: TenantUpdateRequest = convertObjectToSnakeCase(
      body
    ) as TenantUpdateRequest;

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof TenantUpdateRequest] === undefined) {
        delete updateData[key as keyof TenantUpdateRequest];
      }
    });

    const tenant = await tenantService.updateTenant(tenantId, updateData);

    // Convert snake_case to camelCase for frontend response
    const convertedTenant = convertObjectToCamelCase(tenant);

    return NextResponse.json({
      success: true,
      data: convertedTenant,
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
    const resolvedParams = await params;
    const { tenantId, error } = checkTenantIdParam(resolvedParams.id);
    if (error) return error;

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
