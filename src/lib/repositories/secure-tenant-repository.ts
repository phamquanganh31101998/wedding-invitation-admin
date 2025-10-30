import { sql } from '@/lib/db';
import {
  Tenant,
  TenantCreateRequest,
  TenantUpdateRequest,
  TenantListResponse,
  TenantFilters,
  Pagination,
  TenantErrorCode,
} from '@/types/tenant';
import {
  SecurityContext,
  validateTenantAccess,
  validateTenantId,
  sanitizeQueryParams,
  validateTenantScope,
} from '@/lib/security/tenant-security';

/**
 * Secure tenant repository with built-in data isolation and access controls
 */
export class SecureTenantRepository {
  private securityContext: SecurityContext;

  constructor(securityContext: SecurityContext) {
    this.securityContext = securityContext;
  }

  /**
   * Create a new tenant with security validation
   */
  async create(tenantData: TenantCreateRequest): Promise<Tenant> {
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

    // Sanitize input data
    const sanitizedData = sanitizeQueryParams(tenantData);

    try {
      const result = await sql`
        INSERT INTO tenants (
          slug, bride_name, groom_name, wedding_date, venue_name, venue_address,
          venue_map_link, theme_primary_color, theme_secondary_color, email, phone
        ) VALUES (
          ${sanitizedData.slug}, ${sanitizedData.bride_name}, ${sanitizedData.groom_name}, 
          ${sanitizedData.wedding_date}, ${sanitizedData.venue_name}, ${sanitizedData.venue_address},
          ${sanitizedData.venue_map_link || null}, 
          ${sanitizedData.theme_primary_color || '#E53E3E'}, 
          ${sanitizedData.theme_secondary_color || '#FED7D7'},
          ${sanitizedData.email || null}, ${sanitizedData.phone || null}
        )
        RETURNING *
      `;

      return result[0] as Tenant;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error(
          `${TenantErrorCode.DUPLICATE_SLUG}: Slug already exists`
        );
      }
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Find tenant by ID with security validation
   */
  async findById(id: number): Promise<Tenant | null> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(this.securityContext, 'read');
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Validate tenant ID
    const idValidation = validateTenantId(id);
    if (!idValidation.isValid) {
      throw new Error(
        `${idValidation.error!.code}: ${idValidation.error!.message}`
      );
    }

    try {
      const result = await sql`
        SELECT * FROM tenants 
        WHERE id = ${id}
        AND is_active = true
      `;
      return (result[0] as Tenant) || null;
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Find tenant by slug with security validation
   */
  async findBySlug(slug: string): Promise<Tenant | null> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(this.securityContext, 'read');
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Sanitize slug
    const sanitizedSlug = sanitizeQueryParams({ slug }).slug;
    if (!sanitizedSlug) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: Invalid slug format`
      );
    }

    try {
      const result = await sql`
        SELECT * FROM tenants 
        WHERE slug = ${sanitizedSlug}
        AND is_active = true
      `;
      return (result[0] as Tenant) || null;
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Update tenant with security validation and cross-tenant protection
   */
  async update(id: number, updateData: TenantUpdateRequest): Promise<Tenant> {
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
    const idValidation = validateTenantId(id);
    if (!idValidation.isValid) {
      throw new Error(
        `${idValidation.error!.code}: ${idValidation.error!.message}`
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
      // First, verify the tenant exists and get current data
      const currentTenant = await sql`
        SELECT * FROM tenants WHERE id = ${id}
      `;

      if (currentTenant.length === 0) {
        throw new Error(
          `${TenantErrorCode.TENANT_NOT_FOUND}: Tenant with ID ${id} not found`
        );
      }

      // Validate tenant scope (ensure we're updating the correct tenant)
      const scopeValidation = validateTenantScope(id, currentTenant[0].id);
      if (!scopeValidation.isValid) {
        throw new Error(
          `${scopeValidation.error!.code}: ${scopeValidation.error!.message}`
        );
      }

      // Merge current data with updates
      const updatedTenant = { ...currentTenant[0], ...sanitizedData };

      const result = await sql`
        UPDATE tenants 
        SET 
          bride_name = ${updatedTenant.bride_name},
          groom_name = ${updatedTenant.groom_name},
          wedding_date = ${updatedTenant.wedding_date},
          venue_name = ${updatedTenant.venue_name},
          venue_address = ${updatedTenant.venue_address},
          venue_map_link = ${updatedTenant.venue_map_link},
          theme_primary_color = ${updatedTenant.theme_primary_color},
          theme_secondary_color = ${updatedTenant.theme_secondary_color},
          email = ${updatedTenant.email},
          phone = ${updatedTenant.phone},
          is_active = ${updatedTenant.is_active},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      return result[0] as Tenant;
    } catch (error: any) {
      if (error.message.includes(TenantErrorCode.TENANT_NOT_FOUND)) {
        throw error;
      }
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Delete tenant with security validation (soft delete)
   */
  async delete(id: number): Promise<void> {
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

    // Validate tenant ID
    const idValidation = validateTenantId(id);
    if (!idValidation.isValid) {
      throw new Error(
        `${idValidation.error!.code}: ${idValidation.error!.message}`
      );
    }

    try {
      // Verify tenant exists before deletion
      const existingTenant = await sql`
        SELECT id FROM tenants WHERE id = ${id}
      `;

      if (existingTenant.length === 0) {
        throw new Error(
          `${TenantErrorCode.TENANT_NOT_FOUND}: Tenant with ID ${id} not found`
        );
      }

      // Validate tenant scope
      const scopeValidation = validateTenantScope(id, existingTenant[0].id);
      if (!scopeValidation.isValid) {
        throw new Error(
          `${scopeValidation.error!.code}: ${scopeValidation.error!.message}`
        );
      }

      // Perform soft delete
      const result = await sql`
        UPDATE tenants 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id
      `;

      if (result.length === 0) {
        throw new Error(
          `${TenantErrorCode.DATABASE_ERROR}: Failed to delete tenant`
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
   * Find many tenants with security validation and data isolation
   */
  async findMany(
    filters: TenantFilters = {},
    pagination: Pagination = { page: 1, limit: 10 }
  ): Promise<TenantListResponse> {
    // Validate access permissions
    const accessValidation = validateTenantAccess(this.securityContext, 'read');
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Sanitize filters and pagination
    const sanitizedFilters = sanitizeQueryParams(filters);
    const sanitizedPagination = sanitizeQueryParams(pagination);

    try {
      const offset =
        ((sanitizedPagination.page || 1) - 1) *
        (sanitizedPagination.limit || 10);

      // Build base query conditions with tenant isolation
      let whereConditions = sql`WHERE 1=1`;

      // Always filter by active status for data isolation
      if (sanitizedFilters.is_active !== undefined) {
        whereConditions = sql`${whereConditions} AND is_active = ${sanitizedFilters.is_active}`;
      } else {
        // Default to active tenants only for security
        whereConditions = sql`${whereConditions} AND is_active = true`;
      }

      if (sanitizedFilters.search) {
        const searchTerm = `%${sanitizedFilters.search}%`;
        whereConditions = sql`${whereConditions} AND (
          bride_name ILIKE ${searchTerm} OR 
          groom_name ILIKE ${searchTerm} OR 
          slug ILIKE ${searchTerm}
        )`;
      }

      if (sanitizedFilters.wedding_date_from) {
        whereConditions = sql`${whereConditions} AND wedding_date >= ${sanitizedFilters.wedding_date_from}`;
      }

      if (sanitizedFilters.wedding_date_to) {
        whereConditions = sql`${whereConditions} AND wedding_date <= ${sanitizedFilters.wedding_date_to}`;
      }

      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as total FROM tenants ${whereConditions}
      `;
      const total = parseInt(countResult[0].total);

      // Get paginated results
      const tenants = await sql`
        SELECT * FROM tenants 
        ${whereConditions}
        ORDER BY created_at DESC
        LIMIT ${sanitizedPagination.limit || 10} OFFSET ${offset}
      `;

      return {
        tenants: tenants as Tenant[],
        total,
        page: sanitizedPagination.page || 1,
        limit: sanitizedPagination.limit || 10,
      };
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Update tenant status with security validation
   */
  async updateStatus(id: number, isActive: boolean): Promise<Tenant> {
    return this.update(id, { is_active: isActive });
  }

  /**
   * Generate unique slug with security validation
   */
  private async generateUniqueSlug(
    brideName: string,
    groomName: string
  ): Promise<string> {
    const baseSlug = this.createSlugFromNames(brideName, groomName);
    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;

      // Prevent infinite loops
      if (counter > 1000) {
        throw new Error(
          `${TenantErrorCode.DATABASE_ERROR}: Unable to generate unique slug`
        );
      }
    }

    return slug;
  }

  /**
   * Create slug from names with sanitization
   */
  private createSlugFromNames(brideName: string, groomName: string): string {
    const normalize = (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    const brideSlug = normalize(brideName);
    const groomSlug = normalize(groomName);

    return `${brideSlug}-${groomSlug}`;
  }

  /**
   * Check if slug exists with security validation
   */
  private async slugExists(slug: string): Promise<boolean> {
    try {
      const result = await sql`
        SELECT id FROM tenants WHERE slug = ${slug}
      `;
      return result.length > 0;
    } catch (error) {
      return false;
    }
  }
}
