import { SecureTenantRepository } from '@/lib/repositories/secure-tenant-repository';
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
  getSecurityContext,
  validateTenantAccess,
  checkRateLimit,
} from '@/lib/security/tenant-security';
import { generateUniqueSlug } from '@/lib/utils/slug';
import { validateTenantData } from '@/lib/validation/tenant-validation';

export class TenantService {
  private securityContext: SecurityContext | null = null;

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
    const validation = await validateTenantData(data);
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
   * Update tenant with validation and security checks
   */
  async updateTenant(id: number, data: TenantUpdateRequest): Promise<Tenant> {
    await this.validateSecurityAndRateLimit('update_tenant');

    if (!id || id <= 0) {
      throw new Error(`${TenantErrorCode.VALIDATION_ERROR}: Invalid tenant ID`);
    }

    // Validate update data
    const validation = await validateTenantData(data, true);
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
  async generateSlug(brideName: string, groomName: string): Promise<string> {
    if (!brideName || !groomName) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: Bride and groom names are required`
      );
    }

    try {
      return generateUniqueSlug(brideName, groomName);
    } catch (error) {
      throw new Error(
        `${TenantErrorCode.VALIDATION_ERROR}: Unable to generate slug`
      );
    }
  }
}
