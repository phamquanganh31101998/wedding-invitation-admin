import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { TenantService } from '@/lib/services/tenant-service';
import {
  TenantCreateRequest,
  TenantFilters,
  Pagination,
  TenantErrorCode,
} from '@/types/tenant';
import { createSecurityErrorResponse } from '@/lib/security/tenant-security';
import {
  convertObjectToSnakeCase,
  convertObjectToCamelCase,
} from '@/lib/utils/case-conversion';

const tenantService = new TenantService();

/**
 * GET /api/tenants - List tenants with optional filters and pagination
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);

    // Parse filters (support both camelCase and snake_case for backward compatibility)
    const filters: TenantFilters = {
      search: searchParams.get('search') || undefined,
      is_active:
        searchParams.get('is_active') || searchParams.get('isActive')
          ? (searchParams.get('is_active') || searchParams.get('isActive')) ===
            'true'
          : undefined,
      wedding_date_from:
        searchParams.get('wedding_date_from') ||
        searchParams.get('weddingDateFrom') ||
        undefined,
      wedding_date_to:
        searchParams.get('wedding_date_to') ||
        searchParams.get('weddingDateTo') ||
        undefined,
    };

    // Parse pagination
    const pagination: Pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const result = await tenantService.listTenants(filters, pagination);

    // Convert snake_case to camelCase for frontend
    const convertedResult = {
      ...result,
      tenants: result.tenants.map((tenant) => convertObjectToCamelCase(tenant)),
    };

    return NextResponse.json({
      success: true,
      data: convertedResult,
    });
  } catch (error: any) {
    console.error('Error listing tenants:', error);

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
 * POST /api/tenants - Create a new tenant
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Convert camelCase to snake_case for database
    const createData: TenantCreateRequest = convertObjectToSnakeCase(
      body
    ) as TenantCreateRequest;

    const tenant = await tenantService.createTenant(createData);

    // Convert snake_case to camelCase for frontend response
    const convertedTenant = convertObjectToCamelCase(tenant);

    return NextResponse.json(
      {
        success: true,
        data: convertedTenant,
        message: 'Tenant created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating tenant:', error);

    const errorCode = error.message.split(':')[0];
    let statusCode = 500;

    if (errorCode === TenantErrorCode.VALIDATION_ERROR) {
      statusCode = 400;
    } else if (errorCode === TenantErrorCode.DUPLICATE_SLUG) {
      statusCode = 409;
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
