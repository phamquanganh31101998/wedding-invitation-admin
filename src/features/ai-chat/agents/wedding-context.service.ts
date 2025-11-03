import { SecureTenantRepository } from '@/lib/repositories/secure-tenant-repository';
import { SecureGuestRepository } from '@/lib/repositories/secure-guest-repository';
import { getSecurityContext } from '@/lib/security/tenant-security';

export interface WeddingContextData {
  totalTenants: number;
  activeTenants: number;
  upcomingWeddings: Array<{
    id: number;
    brideName: string;
    groomName: string;
    weddingDate: string;
    venueName: string;
    daysUntilWedding: number;
  }>;
  recentRsvps: Array<{
    guestName: string;
    tenantNames: string;
    attendance: string;
    submittedAt: string;
  }>;
  rsvpSummary: {
    totalGuests: number;
    confirmed: number;
    declined: number;
    pending: number;
  };
}

export class WeddingContextService {
  /**
   * Gather comprehensive wedding system context for AI
   */
  async getWeddingContext(): Promise<WeddingContextData> {
    try {
      const securityContext = await getSecurityContext();
      const tenantRepository = new SecureTenantRepository(securityContext);
      const guestRepository = new SecureGuestRepository(securityContext);

      // Get tenant statistics
      const tenantStats = await tenantRepository.getTenantStatistics();

      // Get upcoming weddings (next 30 days)
      const upcomingWeddings = await tenantRepository.getUpcomingWeddings();

      // Get recent RSVP activity (last 7 days)
      const recentRsvps = await guestRepository.getRecentRsvps();

      // Get overall RSVP summary
      const rsvpSummary = await guestRepository.getOverallRsvpSummary();

      return {
        totalTenants: tenantStats.total,
        activeTenants: tenantStats.active,
        upcomingWeddings,
        recentRsvps,
        rsvpSummary,
      };
    } catch (error) {
      console.error('Error gathering wedding context:', error);
      // Return empty context on error to prevent AI chat from breaking
      return {
        totalTenants: 0,
        activeTenants: 0,
        upcomingWeddings: [],
        recentRsvps: [],
        rsvpSummary: { totalGuests: 0, confirmed: 0, declined: 0, pending: 0 },
      };
    }
  }

  /**
   * Get context for a specific tenant/wedding
   */
  async getTenantContext(tenantId: number) {
    try {
      const securityContext = await getSecurityContext();
      const tenantRepository = new SecureTenantRepository(securityContext);
      const guestRepository = new SecureGuestRepository(securityContext);

      // Get tenant context
      const tenantContext = await tenantRepository.getTenantContext(tenantId);

      if (!tenantContext) {
        return null;
      }

      // Get RSVP summary for this tenant
      const rsvpSummary = await guestRepository.getTenantRsvpSummary(tenantId);

      return {
        wedding: tenantContext.wedding,
        rsvps: rsvpSummary,
      };
    } catch (error) {
      console.error('Error getting tenant context:', error);
      return null;
    }
  }
}
