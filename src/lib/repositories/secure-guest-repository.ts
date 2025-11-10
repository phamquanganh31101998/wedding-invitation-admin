import { sql } from '@/lib/db';
import { TenantErrorCode } from '@/types/tenant';
import {
  SecurityContext,
  validateTenantAccess,
  validateTenantId,
  sanitizeQueryParams,
  validateTenantScope,
} from '@/lib/security/tenant-security';

/**
 * Guest interface for type safety
 */
export interface Guest {
  id: number;
  tenant_id: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface GuestCreateRequest {
  tenant_id: number;
  name: string;
  relationship: string;
  attendance: 'yes' | 'no' | 'maybe';
  message?: string;
}

export interface GuestUpdateRequest
  extends Partial<Omit<GuestCreateRequest, 'tenant_id'>> {}

export interface GuestListResponse {
  guests: Guest[];
  total: number;
  page: number;
  limit: number;
}

export interface GuestFilters {
  tenant_id: number; // Always required for data isolation
  attendance?: 'yes' | 'no' | 'maybe';
  search?: string;
}

/**
 * Secure guest repository with tenant-based data isolation
 */
export class SecureGuestRepository {
  private securityContext: SecurityContext;

  constructor(securityContext: SecurityContext) {
    this.securityContext = securityContext;
  }

  /**
   * Create a new guest with tenant isolation
   */
  async create(guestData: GuestCreateRequest): Promise<Guest> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(
      this.securityContext,
      'write'
    );
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Validate tenant ID
    const tenantIdValidation = validateTenantId(guestData.tenant_id);
    if (!tenantIdValidation.isValid) {
      throw new Error(
        `${tenantIdValidation.error!.code}: ${tenantIdValidation.error!.message}`
      );
    }

    // Sanitize input data
    const sanitizedData = sanitizeQueryParams(guestData);

    try {
      // Verify tenant exists and is active
      const tenantCheck = await sql`
        SELECT id FROM tenants 
        WHERE id = ${sanitizedData.tenant_id} AND is_active = true
      `;

      if (tenantCheck.length === 0) {
        throw new Error(
          `${TenantErrorCode.TENANT_NOT_FOUND}: Tenant not found or inactive`
        );
      }

      const result = await sql`
        INSERT INTO guests (
          tenant_id, name, relationship, attendance, message
        ) VALUES (
          ${sanitizedData.tenant_id}, ${sanitizedData.name}, 
          ${sanitizedData.relationship}, ${sanitizedData.attendance},
          ${sanitizedData.message || null}
        )
        RETURNING *
      `;

      return result[0] as Guest;
    } catch (error: any) {
      if (error.message.includes(TenantErrorCode.TENANT_NOT_FOUND)) {
        throw error;
      }
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Find guest by ID with tenant isolation
   */
  async findById(id: number, tenantId: number): Promise<Guest | null> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(this.securityContext, 'read');
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Validate IDs
    const idValidation = validateTenantId(id);
    const tenantIdValidation = validateTenantId(tenantId);

    if (!idValidation.isValid) {
      throw new Error(`${idValidation.error!.code}: Invalid guest ID`);
    }
    if (!tenantIdValidation.isValid) {
      throw new Error(
        `${tenantIdValidation.error!.code}: ${tenantIdValidation.error!.message}`
      );
    }

    try {
      const result = await sql`
        SELECT g.* FROM guests g
        INNER JOIN tenants t ON g.tenant_id = t.id
        WHERE g.id = ${id} 
        AND g.tenant_id = ${tenantId}
        AND t.is_active = true
      `;

      return (result[0] as Guest) || null;
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Update guest with tenant isolation
   */
  async update(
    id: number,
    tenantId: number,
    updateData: GuestUpdateRequest
  ): Promise<Guest> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(
      this.securityContext,
      'write'
    );
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Validate IDs
    const idValidation = validateTenantId(id);
    const tenantIdValidation = validateTenantId(tenantId);

    if (!idValidation.isValid) {
      throw new Error(`${idValidation.error!.code}: Invalid guest ID`);
    }
    if (!tenantIdValidation.isValid) {
      throw new Error(
        `${tenantIdValidation.error!.code}: ${tenantIdValidation.error!.message}`
      );
    }

    // Sanitize update data
    const sanitizedData = sanitizeQueryParams(updateData);

    if (Object.keys(sanitizedData).length === 0) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: No valid fields to update`
      );
    }

    try {
      // First, verify the guest exists and belongs to the correct tenant
      const currentGuest = await sql`
        SELECT g.* FROM guests g
        INNER JOIN tenants t ON g.tenant_id = t.id
        WHERE g.id = ${id} 
        AND g.tenant_id = ${tenantId}
        AND t.is_active = true
      `;

      if (currentGuest.length === 0) {
        throw new Error(
          `${TenantErrorCode.TENANT_NOT_FOUND}: Guest not found or access denied`
        );
      }

      // Validate tenant scope
      const scopeValidation = validateTenantScope(
        tenantId,
        currentGuest[0].tenant_id
      );
      if (!scopeValidation.isValid) {
        throw new Error(
          `${scopeValidation.error!.code}: ${scopeValidation.error!.message}`
        );
      }

      // Merge current data with updates
      const updatedGuest = { ...currentGuest[0], ...sanitizedData };

      const result = await sql`
        UPDATE guests 
        SET 
          name = ${updatedGuest.name},
          relationship = ${updatedGuest.relationship},
          attendance = ${updatedGuest.attendance},
          message = ${updatedGuest.message},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND tenant_id = ${tenantId}
        RETURNING *
      `;

      if (result.length === 0) {
        throw new Error(
          `${TenantErrorCode.DATABASE_ERROR}: Failed to update guest`
        );
      }

      return result[0] as Guest;
    } catch (error: any) {
      if (error.message.includes(TenantErrorCode.TENANT_NOT_FOUND)) {
        throw error;
      }
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Delete guest with tenant isolation
   */
  async delete(id: number, tenantId: number): Promise<void> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(
      this.securityContext,
      'delete'
    );
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Validate IDs
    const idValidation = validateTenantId(id);
    const tenantIdValidation = validateTenantId(tenantId);

    if (!idValidation.isValid) {
      throw new Error(`${idValidation.error!.code}: Invalid guest ID`);
    }
    if (!tenantIdValidation.isValid) {
      throw new Error(
        `${tenantIdValidation.error!.code}: ${tenantIdValidation.error!.message}`
      );
    }

    try {
      // Verify guest exists and belongs to the correct tenant
      const existingGuest = await sql`
        SELECT g.id, g.tenant_id FROM guests g
        INNER JOIN tenants t ON g.tenant_id = t.id
        WHERE g.id = ${id} 
        AND g.tenant_id = ${tenantId}
        AND t.is_active = true
      `;

      if (existingGuest.length === 0) {
        throw new Error(
          `${TenantErrorCode.TENANT_NOT_FOUND}: Guest not found or access denied`
        );
      }

      // Validate tenant scope
      const scopeValidation = validateTenantScope(
        tenantId,
        existingGuest[0].tenant_id
      );
      if (!scopeValidation.isValid) {
        throw new Error(
          `${scopeValidation.error!.code}: ${scopeValidation.error!.message}`
        );
      }

      // Perform hard delete (as per schema design)
      const result = await sql`
        DELETE FROM guests 
        WHERE id = ${id} AND tenant_id = ${tenantId}
        RETURNING id
      `;

      if (result.length === 0) {
        throw new Error(
          `${TenantErrorCode.DATABASE_ERROR}: Failed to delete guest`
        );
      }
    } catch (error: any) {
      if (error.message.includes(TenantErrorCode.TENANT_NOT_FOUND)) {
        throw error;
      }
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Find many guests with tenant isolation
   */
  async findMany(
    filters: GuestFilters,
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<GuestListResponse> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(this.securityContext, 'read');
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Validate tenant ID (required for data isolation)
    const tenantIdValidation = validateTenantId(filters.tenant_id);
    if (!tenantIdValidation.isValid) {
      throw new Error(
        `${tenantIdValidation.error!.code}: ${tenantIdValidation.error!.message}`
      );
    }

    // Sanitize filters and pagination
    const sanitizedFilters = sanitizeQueryParams(filters);
    const sanitizedPagination = sanitizeQueryParams(pagination);

    try {
      const offset =
        ((sanitizedPagination.page || 1) - 1) *
        (sanitizedPagination.limit || 10);

      // Build base query conditions with strict tenant isolation
      let whereConditions = sql`WHERE g.tenant_id = ${sanitizedFilters.tenant_id} AND t.is_active = true`;

      if (sanitizedFilters.attendance) {
        whereConditions = sql`${whereConditions} AND g.attendance = ${sanitizedFilters.attendance}`;
      }

      if (sanitizedFilters.search) {
        const searchTerm = `%${sanitizedFilters.search}%`;
        whereConditions = sql`${whereConditions} AND (
          g.name ILIKE ${searchTerm} OR 
          g.relationship ILIKE ${searchTerm}
        )`;
      }

      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as total 
        FROM guests g
        INNER JOIN tenants t ON g.tenant_id = t.id
        ${whereConditions}
      `;
      const total = parseInt(countResult[0].total);

      // Get paginated results
      const guests = await sql`
        SELECT g.* 
        FROM guests g
        INNER JOIN tenants t ON g.tenant_id = t.id
        ${whereConditions}
        ORDER BY g.created_at DESC
        LIMIT ${sanitizedPagination.limit || 10} OFFSET ${offset}
      `;

      return {
        guests: guests as Guest[],
        total,
        page: sanitizedPagination.page || 1,
        limit: sanitizedPagination.limit || 10,
      };
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Get guest statistics for a tenant
   */
  async getGuestStats(tenantId: number): Promise<{
    total: number;
    attending: number;
    notAttending: number;
    maybe: number;
  }> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(this.securityContext, 'read');
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Validate tenant ID
    const tenantIdValidation = validateTenantId(tenantId);
    if (!tenantIdValidation.isValid) {
      throw new Error(
        `${tenantIdValidation.error!.code}: ${tenantIdValidation.error!.message}`
      );
    }

    try {
      const result = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN g.attendance = 'yes' THEN 1 END) as attending,
          COUNT(CASE WHEN g.attendance = 'no' THEN 1 END) as not_attending,
          COUNT(CASE WHEN g.attendance = 'maybe' THEN 1 END) as maybe
        FROM guests g
        INNER JOIN tenants t ON g.tenant_id = t.id
        WHERE g.tenant_id = ${tenantId} AND t.is_active = true
      `;

      const stats = result[0];
      return {
        total: parseInt(stats.total),
        attending: parseInt(stats.attending),
        notAttending: parseInt(stats.not_attending),
        maybe: parseInt(stats.maybe),
      };
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Search guests by name or relationship with optional tenant filtering
   */
  async searchGuests(params: {
    query: string;
    tenantId?: number;
    limit?: number;
  }): Promise<
    Array<{
      id: number;
      name: string;
      relationship: string;
      attendance: string;
      message?: string;
      wedding: string;
      weddingDate: string;
      submittedAt: string;
    }>
  > {
    // Validate access permissions
    const accessValidation = validateTenantAccess(this.securityContext, 'read');
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    const { query, tenantId, limit = 10 } = params;

    try {
      let searchQuery;
      if (tenantId) {
        // Validate tenant ID if provided
        const tenantIdValidation = validateTenantId(tenantId);
        if (!tenantIdValidation.isValid) {
          throw new Error(
            `${tenantIdValidation.error!.code}: ${tenantIdValidation.error!.message}`
          );
        }

        searchQuery = sql`
          SELECT g.*, t.bride_name, t.groom_name, t.wedding_date
          FROM guests g
          JOIN tenants t ON g.tenant_id = t.id
          WHERE g.tenant_id = ${tenantId}
            AND (g.name ILIKE ${`%${query}%`} OR g.relationship ILIKE ${`%${query}%`})
          ORDER BY g.created_at DESC
          LIMIT ${limit}
        `;
      } else {
        searchQuery = sql`
          SELECT g.*, t.bride_name, t.groom_name, t.wedding_date
          FROM guests g
          JOIN tenants t ON g.tenant_id = t.id
          WHERE g.name ILIKE ${`%${query}%`} OR g.relationship ILIKE ${`%${query}%`}
          ORDER BY g.created_at DESC
          LIMIT ${limit}
        `;
      }

      const results = await searchQuery;

      return results.map((guest: any) => ({
        id: guest.id,
        name: guest.name,
        relationship: guest.relationship,
        attendance: guest.attendance,
        message: guest.message,
        wedding: `${guest.bride_name} & ${guest.groom_name}`,
        weddingDate: guest.wedding_date,
        submittedAt: guest.created_at,
      }));
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Update guest RSVP status with tenant isolation
   */
  async updateGuestStatus(params: {
    guestId: number;
    status: 'yes' | 'no' | 'maybe';
    tenantId?: number;
  }): Promise<{
    success: boolean;
    guest: {
      id: number;
      name: string;
      attendance: string;
      updatedAt: string;
    };
  }> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(
      this.securityContext,
      'write'
    );
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    const { guestId, status, tenantId } = params;

    // Validate status
    if (!['yes', 'no', 'maybe'].includes(status)) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: Invalid status. Must be yes, no, or maybe.`
      );
    }

    try {
      let updateQuery;
      if (tenantId) {
        // Validate tenant ID
        const tenantIdValidation = validateTenantId(tenantId);
        if (!tenantIdValidation.isValid) {
          throw new Error(
            `${tenantIdValidation.error!.code}: ${tenantIdValidation.error!.message}`
          );
        }

        updateQuery = sql`
          UPDATE guests 
          SET attendance = ${status}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${guestId} AND tenant_id = ${tenantId}
          RETURNING *
        `;
      } else {
        updateQuery = sql`
          UPDATE guests 
          SET attendance = ${status}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${guestId}
          RETURNING *
        `;
      }

      const result = await updateQuery;

      if (result.length === 0) {
        throw new Error(
          `${TenantErrorCode.TENANT_NOT_FOUND}: Guest not found or access denied.`
        );
      }

      return {
        success: true,
        guest: {
          id: result[0].id,
          name: result[0].name,
          attendance: result[0].attendance,
          updatedAt: result[0].updated_at,
        },
      };
    } catch (error: any) {
      if (
        error.message.includes(TenantErrorCode.TENANT_NOT_FOUND) ||
        error.message.includes(TenantErrorCode.VALIDATION_ERROR)
      ) {
        throw error;
      }
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }
}
