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

export class TenantRepository {
  /**
   * Create a new tenant
   */
  async create(tenantData: TenantCreateRequest): Promise<Tenant> {
    try {
      const slug = await this.generateUniqueSlug(
        tenantData.bride_name,
        tenantData.groom_name
      );

      const result = await sql`
        INSERT INTO tenants (
          slug, bride_name, groom_name, wedding_date, venue_name, venue_address,
          venue_map_link, theme_primary_color, theme_secondary_color, email, phone
        ) VALUES (
          ${slug}, ${tenantData.bride_name}, ${tenantData.groom_name}, 
          ${tenantData.wedding_date}, ${tenantData.venue_name}, ${tenantData.venue_address},
          ${tenantData.venue_map_link || null}, 
          ${tenantData.theme_primary_color || '#E53E3E'}, 
          ${tenantData.theme_secondary_color || '#FED7D7'},
          ${tenantData.email || null}, ${tenantData.phone || null}
        )
        RETURNING *
      `;

      return result[0] as Tenant;
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error(
          `${TenantErrorCode.DUPLICATE_SLUG}: Slug already exists`
        );
      }
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Find tenant by ID
   */
  async findById(id: number): Promise<Tenant | null> {
    try {
      const result = await sql`
        SELECT * FROM tenants WHERE id = ${id}
      `;
      return (result[0] as Tenant) || null;
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<Tenant | null> {
    try {
      const result = await sql`
        SELECT * FROM tenants WHERE slug = ${slug}
      `;
      return (result[0] as Tenant) || null;
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Update tenant - simplified approach with individual field updates
   */
  async update(id: number, updateData: TenantUpdateRequest): Promise<Tenant> {
    try {
      if (Object.keys(updateData).length === 0) {
        throw new Error(
          `${TenantErrorCode.VALIDATION_ERROR}: No fields to update`
        );
      }

      // Get current tenant first
      const currentTenant = await this.findById(id);
      if (!currentTenant) {
        throw new Error(
          `${TenantErrorCode.TENANT_NOT_FOUND}: Tenant with ID ${id} not found`
        );
      }

      // Merge current data with updates
      const updatedTenant = { ...currentTenant, ...updateData };

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
   * Delete tenant (soft delete by setting is_active to false)
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await sql`
        UPDATE tenants 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id
      `;

      if (result.length === 0) {
        throw new Error(
          `${TenantErrorCode.TENANT_NOT_FOUND}: Tenant with ID ${id} not found`
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
   * Find many tenants with filters and pagination
   */
  async findMany(
    filters: TenantFilters = {},
    pagination: Pagination = { page: 1, limit: 10 }
  ): Promise<TenantListResponse> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      // Build base query conditions
      let whereConditions = sql`WHERE 1=1`;

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        whereConditions = sql`${whereConditions} AND (
          bride_name ILIKE ${searchTerm} OR 
          groom_name ILIKE ${searchTerm} OR 
          slug ILIKE ${searchTerm}
        )`;
      }

      if (filters.is_active !== undefined) {
        whereConditions = sql`${whereConditions} AND is_active = ${filters.is_active}`;
      }

      if (filters.wedding_date_from) {
        whereConditions = sql`${whereConditions} AND wedding_date >= ${filters.wedding_date_from}`;
      }

      if (filters.wedding_date_to) {
        whereConditions = sql`${whereConditions} AND wedding_date <= ${filters.wedding_date_to}`;
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
        LIMIT ${pagination.limit} OFFSET ${offset}
      `;

      return {
        tenants: tenants as Tenant[],
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error: any) {
      throw new Error(`${TenantErrorCode.DATABASE_ERROR}: ${error.message}`);
    }
  }

  /**
   * Update tenant status
   */
  async updateStatus(id: number, isActive: boolean): Promise<Tenant> {
    return this.update(id, { is_active: isActive });
  }

  /**
   * Generate unique slug from bride and groom names
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
    }

    return slug;
  }

  /**
   * Create slug from names
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
   * Check if slug exists
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
