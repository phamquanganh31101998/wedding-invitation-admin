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

    // Parse filters
    const filters: TenantFilters = {
      search: searchParams.get('search') || undefined,
      is_active: searchParams.get('is_active')
        ? searchParams.get('is_active') === 'true'
        : undefined,
      wedding_date_from: searchParams.get('wedding_date_from') || undefined,
      wedding_date_to: searchParams.get('wedding_date_to') || undefined,
    };

    // Parse pagination
    const pagination: Pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const result = await tenantService.listTenants(filters, pagination);

    return NextResponse.json({
      success: true,
      data: result,
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

    // Validate required fields
    const createData: TenantCreateRequest = {
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
    };

    const tenant = await tenantService.createTenant(createData);

    return NextResponse.json(
      {
        success: true,
        data: tenant,
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
