import { NextRequest, NextResponse } from 'next/server';
import {
  SecureGuestRepository,
  GuestFilters,
} from '@/lib/repositories/secure-guest-repository';
import { SecureTenantRepository } from '@/lib/repositories/secure-tenant-repository';
import { TenantErrorCode } from '@/types/tenant';
import {
  getSecurityContext,
  createSecurityErrorResponse,
} from '@/lib/security/tenant-security';
import {
  generateGuestExport,
  generateExportFilename,
} from '@/features/guests/services/guest-export.service';
import { checkTenantIdParam } from '@/lib/utils/api-helpers';

/**
 * GET /api/tenants/[id]/guests/export - Export guests to Excel file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenantId, error } = checkTenantIdParam(resolvedParams.id);
    if (error) return error;

    const { searchParams } = new URL(request.url);

    // Parse filters (same as list endpoint to support filtered exports)
    const filters: GuestFilters = {
      tenant_id: tenantId,
      attendance:
        (searchParams.get('attendance') as 'yes' | 'no' | 'maybe') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Get security context and create repositories
    const securityContext = await getSecurityContext();
    const guestRepository = new SecureGuestRepository(securityContext);
    const tenantRepository = new SecureTenantRepository(securityContext);

    // Fetch tenant information
    const tenant = await tenantRepository.findById(tenantId);

    if (!tenant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: TenantErrorCode.TENANT_NOT_FOUND,
            message: 'Tenant not found',
          },
        },
        { status: 404 }
      );
    }

    // Fetch all guests with applied filters (no pagination for export)
    const result = await guestRepository.findMany(filters, {
      page: 1,
      limit: 10000, // Large limit to get all guests
    });

    // Convert snake_case to camelCase for the export service
    const guestsForExport = result.guests.map((guest) => ({
      id: guest.id,
      tenantId: guest.tenant_id,
      name: guest.name,
      relationship: guest.relationship,
      attendance: guest.attendance,
      message: guest.message,
      createdAt: guest.created_at,
      updatedAt: guest.updated_at,
    }));

    // Prepare tenant info for export
    const tenantInfo = {
      brideName: tenant.bride_name,
      groomName: tenant.groom_name,
      weddingDate: tenant.wedding_date,
    };

    // Generate Excel file
    const excelBlob = generateGuestExport(guestsForExport, tenantInfo);

    // Generate filename
    const filename = generateExportFilename(tenantInfo);

    // Convert Blob to Buffer for Next.js response
    const arrayBuffer = await excelBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return file as downloadable response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error exporting guests:', error);

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
