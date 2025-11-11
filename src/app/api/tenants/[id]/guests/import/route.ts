import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
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

    // Import valid rows and track results
    const successRows: any[] = [];
    const failedRows: any[] = [];

    for (let i = 0; i < parseResult.data.length; i++) {
      const guestRow = parseResult.data[i];
      try {
        const createData: GuestCreateRequest = {
          tenant_id: tenantId,
          name: guestRow.name.trim(),
          relationship: guestRow.relationship.trim(),
          attendance: guestRow.attendance as 'yes' | 'no' | 'maybe',
          message: guestRow.message?.trim() || undefined,
        };

        await guestRepository.create(createData);
        successRows.push({
          name: guestRow.name,
          relationship: guestRow.relationship,
          attendance: guestRow.attendance,
          message: guestRow.message || '',
        });
      } catch (error: any) {
        console.error('Error importing guest row:', error);
        failedRows.push({
          name: guestRow.name,
          relationship: guestRow.relationship,
          attendance: guestRow.attendance,
          message: guestRow.message || '',
          error: error.message || 'Unknown error',
        });
      }
    }

    // Add validation errors to failed rows
    for (const validationError of parseResult.errors) {
      const errorRow = parseResult.data[validationError.row - 2]; // Adjust for header row
      if (errorRow) {
        failedRows.push({
          name: errorRow.name || '',
          relationship: errorRow.relationship || '',
          attendance: errorRow.attendance || '',
          message: errorRow.message || '',
          error: validationError.errors.join(', '),
        });
      }
    }

    // Create Excel workbook with two sheets
    const workbook = XLSX.utils.book_new();

    // Success sheet
    const successSheet = XLSX.utils.json_to_sheet(successRows);
    XLSX.utils.book_append_sheet(workbook, successSheet, 'Success');

    // Failed sheet
    const failedSheet = XLSX.utils.json_to_sheet(failedRows);
    XLSX.utils.book_append_sheet(workbook, failedSheet, 'Failed');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="import-result-${Date.now()}.xlsx"`,
        'X-Import-Success': successRows.length.toString(),
        'X-Import-Failed': failedRows.length.toString(),
      },
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
