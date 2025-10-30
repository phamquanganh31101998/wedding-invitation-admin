import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from '@/lib/services/tenant-service';
import { TenantErrorCode } from '@/types/tenant';
import { convertObjectToSnakeCase } from '@/lib/utils/case-conversion';

const tenantService = new TenantService();

/**
 * POST /api/tenants/generate-slug - Generate unique slug from bride and groom names
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Convert camelCase to snake_case for processing
    const convertedBody = convertObjectToSnakeCase(body);
    const { bride_name, groom_name } = convertedBody;

    if (!bride_name || !groom_name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'Both brideName and groomName are required',
          },
        },
        { status: 400 }
      );
    }

    const slug = await tenantService.generateSlug(bride_name, groom_name);

    return NextResponse.json({
      success: true,
      data: { slug },
    });
  } catch (error: any) {
    console.error('Error generating slug:', error);

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
