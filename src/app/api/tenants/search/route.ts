import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from '@/lib/services/tenant-service';
import { TenantErrorCode } from '@/types/tenant';
import { convertObjectToCamelCase } from '@/lib/utils/case-conversion';

const tenantService = new TenantService();

/**
 * GET /api/tenants/search - Search tenants by query
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'Search query is required',
          },
        },
        { status: 400 }
      );
    }

    const tenants = await tenantService.searchTenants(query);

    // Convert snake_case to camelCase for frontend
    const convertedTenants = tenants.map((tenant) =>
      convertObjectToCamelCase(tenant)
    );

    return NextResponse.json({
      success: true,
      data: convertedTenants,
    });
  } catch (error: any) {
    console.error('Error searching tenants:', error);

    const errorCode = error.message.split(':')[0];
    const statusCode =
      errorCode === TenantErrorCode.VALIDATION_ERROR ? 400 : 500;

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
