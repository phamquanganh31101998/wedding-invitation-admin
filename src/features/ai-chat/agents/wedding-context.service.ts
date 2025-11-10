import { SecureTenantRepository } from '@/lib/repositories/secure-tenant-repository';
import { getSecurityContext } from '@/lib/security/tenant-security';

export class WeddingContextService {
  /**
   * Get basic tenant info without RSVP queries (faster)
   */
  async getBasicTenantInfo(tenantId: number) {
    try {
      const securityContext = await getSecurityContext();
      const tenantRepository = new SecureTenantRepository(securityContext);

      // Get only basic tenant context (no RSVP queries)
      const tenantContext = await tenantRepository.getTenantContext(tenantId);

      if (!tenantContext) {
        return null;
      }

      return {
        wedding: tenantContext.wedding,
      };
    } catch (error) {
      console.error('Error getting basic tenant info:', error);
      return null;
    }
  }
}
