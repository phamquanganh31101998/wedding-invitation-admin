import { NextRequest, NextResponse } from 'next/server';
import {
  SecureGuestRepository,
  GuestCreateRequest,
} from '@/lib/repositories/secure-guest-repository';
import { TenantErrorCode } from '@/types/tenant';
import { getSecurityContext } from '@/lib/security/tenant-security';
import { parseGuestFileServer } from '@/features/guests/services/guest-import-server.service';
import { checkTenantIdParam } from '@/lib/utils/api-helpers';

/**
 * POST /api/tenants/[id]/guests/import - Import guests from CSV/Excel file
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenantId, error } = checkTenantIdParam(resolvedParams.id);
    if (error) return error;

    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: 'No file provided',
          },
        },
        { status: 400 }
      );
    }

    // Parse and validate the file (server-side)
    const parseResult = await parseGuestFileServer(file);

    // If there are parsing errors at file level (row 0), return immediately
    const fileErrors = parseResult.errors.filter((e) => e.row === 0);
    if (fileErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.VALIDATION_ERROR,
            message: fileErrors[0].errors[0],
          },
        },
        { status: 400 }
      );
    }

    // Get security context and create secure repository
    const securityContext = await getSecurityContext();
    const guestRepository = new SecureGuestRepository(securityContext);

    // Import valid rows
    let imported = 0;
    const importErrors: Array<{ row: number; errors: string[] }> = [
      ...parseResult.errors,
    ];

    for (const guestRow of parseResult.data) {
      try {
        const createData: GuestCreateRequest = {
          tenant_id: tenantId,
          name: guestRow.name.trim(),
          relationship: guestRow.relationship.trim(),
          attendance: guestRow.attendance as 'yes' | 'no' | 'maybe',
          message: guestRow.message?.trim() || undefined,
        };

        await guestRepository.create(createData);
        imported++;
      } catch (error: any) {
        // If a database error occurs during import, we still continue with other rows
        console.error('Error importing guest row:', error);
      }
    }

    const failed = parseResult.errors.length;

    return NextResponse.json({
      success: true,
      data: {
        imported,
        failed,
        errors: importErrors,
      },
      message: `Successfully imported ${imported} guest(s). ${failed} row(s) failed validation.`,
    });
  } catch (error: any) {
    console.error('Error importing guests:', error);

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
