import { TenantRepository } from '@/lib/repositories/tenant-repository';
import { SecureTenantRepository } from '@/lib/repositories/secure-tenant-repository';
import {
  Tenant,
  TenantCreateRequest,
  TenantUpdateRequest,
  TenantListResponse,
  TenantFilters,
  Pagination,
  ValidationResult,
  TenantErrorCode,
} from '@/types/tenant';
import {
  SecurityContext,
  getSecurityContext,
  validateTenantAccess,
  checkRateLimit,
} from '@/lib/security/tenant-security';

export class TenantService {
  private tenantRepository: TenantRepository;
  private securityContext: SecurityContext | null = null;

  constructor() {
    this.tenantRepository = new TenantRepository();
  }

  /**
   * Initialize security context for the service
   */
  async initializeSecurityContext(): Promise<void> {
    this.securityContext = await getSecurityContext();
  }

  /**
   * Get secure repository instance with current security context
   */
  private async getSecureRepository(): Promise<SecureTenantRepository> {
    if (!this.securityContext) {
      await this.initializeSecurityContext();
    }
    return new SecureTenantRepository(this.securityContext!);
  }

  /**
   * Validate security context and rate limiting
   */
  private async validateSecurityAndRateLimit(operation: string): Promise<void> {
    if (!this.securityContext) {
      await this.initializeSecurityContext();
    }

    // Validate access permissions
    const accessValidation = validateTenantAccess(
      this.securityContext!,
      'read'
    );
    if (!accessValidation.isValid) {
      throw new Error(
        `${accessValidation.error!.code}: ${accessValidation.error!.message}`
      );
    }

    // Check rate limiting
    if (this.securityContext!.userId) {
      const rateLimitOk = checkRateLimit(
        this.securityContext!.userId,
        operation
      );
      if (!rateLimitOk) {
        throw new Error(
          `${TenantErrorCode.VALIDATION_ERROR}: Rate limit exceeded for ${operation}`
        );
      }
    }
  }

  /**
   * Create a new tenant with validation and security checks
   */
  async createTenant(data: TenantCreateRequest): Promise<Tenant> {
    await this.validateSecurityAndRateLimit('create_tenant');

    // Validate input data
    const validation = await this.validateTenantData(data);
    if (!validation.isValid) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: ${JSON.stringify(validation.errors)}`
      );
    }

    const secureRepository = await this.getSecureRepository();
    return secureRepository.create(data);
  }

  /**
   * Get tenant by ID with security validation
   */
  async getTenantById(id: number): Promise<Tenant | null> {
    await this.validateSecurityAndRateLimit('get_tenant');

    if (!id || id <= 0) {
      throw new Error(`${TenantErrorCode.VALIDATION_ERROR}: Invalid tenant ID`);
    }

    const secureRepository = await this.getSecureRepository();
    return secureRepository.findById(id);
  }

  /**
   * Get tenant by slug with security validation
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    await this.validateSecurityAndRateLimit('get_tenant');

    if (!slug || slug.trim().length === 0) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: Invalid tenant slug`
      );
    }

    const secureRepository = await this.getSecureRepository();
    return secureRepository.findBySlug(slug);
  }

  /**
   * Update tenant with validation and security checks
   */
  async updateTenant(id: number, data: TenantUpdateRequest): Promise<Tenant> {
    await this.validateSecurityAndRateLimit('update_tenant');

    if (!id || id <= 0) {
      throw new Error(`${TenantErrorCode.VALIDATION_ERROR}: Invalid tenant ID`);
    }

    // Validate update data
    const validation = await this.validateTenantData(data, true);
    if (!validation.isValid) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: ${JSON.stringify(validation.errors)}`
      );
    }

    const secureRepository = await this.getSecureRepository();
    return secureRepository.update(id, data);
  }

  /**
   * Delete tenant with security validation (soft delete)
   */
  async deleteTenant(id: number): Promise<void> {
    await this.validateSecurityAndRateLimit('delete_tenant');

    if (!id || id <= 0) {
      throw new Error(`${TenantErrorCode.VALIDATION_ERROR}: Invalid tenant ID`);
    }

    const secureRepository = await this.getSecureRepository();
    return secureRepository.delete(id);
  }

  /**
   * List tenants with filters, pagination, and security validation
   */
  async listTenants(
    filters: TenantFilters = {},
    pagination: Pagination = { page: 1, limit: 10 }
  ): Promise<TenantListResponse> {
    await this.validateSecurityAndRateLimit('list_tenants');

    // Validate pagination
    if (pagination.page < 1) {
      pagination.page = 1;
    }
    if (pagination.limit < 1 || pagination.limit > 100) {
      pagination.limit = 10;
    }

    const secureRepository = await this.getSecureRepository();
    return secureRepository.findMany(filters, pagination);
  }

  /**
   * Search tenants by query with security validation
   */
  async searchTenants(query: string): Promise<Tenant[]> {
    await this.validateSecurityAndRateLimit('search_tenants');

    if (!query || query.trim().length === 0) {
      return [];
    }

    const secureRepository = await this.getSecureRepository();
    const result = await secureRepository.findMany(
      { search: query.trim() },
      { page: 1, limit: 50 }
    );

    return result.tenants;
  }

  /**
   * Update tenant status with security validation
   */
  async updateTenantStatus(id: number, isActive: boolean): Promise<Tenant> {
    await this.validateSecurityAndRateLimit('update_tenant_status');

    if (!id || id <= 0) {
      throw new Error(`${TenantErrorCode.VALIDATION_ERROR}: Invalid tenant ID`);
    }

    const secureRepository = await this.getSecureRepository();
    return secureRepository.updateStatus(id, isActive);
  }

  /**
   * Deactivate tenant
   */
  async deactivateTenant(id: number): Promise<Tenant> {
    return this.updateTenantStatus(id, false);
  }

  /**
   * Reactivate tenant
   */
  async reactivateTenant(id: number): Promise<Tenant> {
    return this.updateTenantStatus(id, true);
  }

  /**
   * Generate unique slug from bride and groom names
   */
  async generateUniqueSlug(
    brideName: string,
    groomName: string
  ): Promise<string> {
    if (!brideName || !groomName) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: Bride and groom names are required`
      );
    }

    // This is handled internally by the repository
    const tempData: TenantCreateRequest = {
      bride_name: brideName,
      groom_name: groomName,
      wedding_date: '2024-01-01', // Temporary date for slug generation
      venue_name: 'temp',
      venue_address: 'temp',
    };

    try {
      // We'll extract the slug generation logic to a separate method
      return this.createSlugFromNames(brideName, groomName);
    } catch (error) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: Unable to generate slug`
      );
    }
  }

  /**
   * Validate tenant data
   */
  async validateTenantData(
    data: TenantCreateRequest | TenantUpdateRequest,
    isUpdate: boolean = false
  ): Promise<ValidationResult> {
    const errors: Record<string, string> = {};

    // Validate bride name
    if (!isUpdate || data.bride_name !== undefined) {
      if (!data.bride_name || data.bride_name.trim().length < 2) {
        errors.bride_name = 'Bride name must be at least 2 characters long';
      } else if (data.bride_name.length > 100) {
        errors.bride_name = 'Bride name must not exceed 100 characters';
      } else if (!/^[a-zA-Z\s\-']+$/.test(data.bride_name)) {
        errors.bride_name =
          'Bride name can only contain letters, spaces, hyphens, and apostrophes';
      }
    }

    // Validate groom name
    if (!isUpdate || data.groom_name !== undefined) {
      if (!data.groom_name || data.groom_name.trim().length < 2) {
        errors.groom_name = 'Groom name must be at least 2 characters long';
      } else if (data.groom_name.length > 100) {
        errors.groom_name = 'Groom name must not exceed 100 characters';
      } else if (!/^[a-zA-Z\s\-']+$/.test(data.groom_name)) {
        errors.groom_name =
          'Groom name can only contain letters, spaces, hyphens, and apostrophes';
      }
    }

    // Validate wedding date
    if (!isUpdate || data.wedding_date !== undefined) {
      if (!data.wedding_date) {
        errors.wedding_date = 'Wedding date is required';
      } else {
        const weddingDate = new Date(data.wedding_date);
        if (isNaN(weddingDate.getTime())) {
          errors.wedding_date = 'Wedding date must be a valid date';
        }
      }
    }

    // Validate venue name
    if (!isUpdate || data.venue_name !== undefined) {
      if (!data.venue_name || data.venue_name.trim().length < 2) {
        errors.venue_name = 'Venue name must be at least 2 characters long';
      } else if (data.venue_name.length > 200) {
        errors.venue_name = 'Venue name must not exceed 200 characters';
      }
    }

    // Validate venue address
    if (!isUpdate || data.venue_address !== undefined) {
      if (!data.venue_address || data.venue_address.trim().length < 5) {
        errors.venue_address =
          'Venue address must be at least 5 characters long';
      }
    }

    // Validate email if provided
    if (
      data.email !== undefined &&
      data.email !== null &&
      data.email.trim().length > 0
    ) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Email must be a valid email address';
      }
    }

    // Validate phone if provided
    if (
      data.phone !== undefined &&
      data.phone !== null &&
      data.phone.trim().length > 0
    ) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.phone = 'Phone number must be a valid format';
      }
    }

    // Validate theme colors if provided
    if (data.theme_primary_color !== undefined) {
      if (!this.isValidHexColor(data.theme_primary_color)) {
        errors.theme_primary_color =
          'Primary color must be a valid hex color code';
      }
    }

    if (data.theme_secondary_color !== undefined) {
      if (!this.isValidHexColor(data.theme_secondary_color)) {
        errors.theme_secondary_color =
          'Secondary color must be a valid hex color code';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Create slug from names (utility method)
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
   * Validate hex color
   */
  private isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }
}
