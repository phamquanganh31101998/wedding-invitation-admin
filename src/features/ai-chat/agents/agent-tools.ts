import { SecureGuestRepository } from '@/lib/repositories/secure-guest-repository';
import { SecureTenantRepository } from '@/lib/repositories/secure-tenant-repository';
import { getSecurityContext } from '@/lib/security/tenant-security';

export interface AgentFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  handler: (params: any) => Promise<any>;
}

/**
 * Get all guests for a specific wedding/tenant
 */
async function getGuestByTenant(params: {
  tenantId: number;
  page?: number;
  limit?: number;
  attendance?: 'yes' | 'no' | 'maybe';
  search?: string;
}) {
  const { tenantId, page = 1, limit = 50, attendance, search } = params;

  const securityContext = await getSecurityContext();
  const guestRepository = new SecureGuestRepository(securityContext);

  const filters = {
    tenant_id: tenantId,
    ...(attendance && { attendance }),
    ...(search && { search }),
  };

  return await guestRepository.findMany(filters, { page, limit });
}

/**
 * Search guests by name or relationship
 */
async function searchGuests(params: {
  query: string;
  tenantId?: number;
  limit?: number;
}) {
  const { query, tenantId, limit = 10 } = params;

  const securityContext = await getSecurityContext();
  const guestRepository = new SecureGuestRepository(securityContext);

  return await guestRepository.searchGuests({ query, tenantId, limit });
}

/**
 * Update guest RSVP status
 */
async function updateGuestStatus(params: {
  guestId: number;
  status: 'yes' | 'no' | 'maybe';
  tenantId?: number;
}) {
  const { guestId, status, tenantId } = params;

  const securityContext = await getSecurityContext();
  const guestRepository = new SecureGuestRepository(securityContext);

  return await guestRepository.updateGuestStatus({ guestId, status, tenantId });
}

/**
 * Add a new guest to a wedding
 */
async function addGuest(params: {
  tenantId: number;
  name: string;
  relationship: string;
  attendance?: 'yes' | 'no' | 'maybe';
  message?: string;
}) {
  const {
    tenantId,
    name,
    relationship,
    attendance = 'maybe',
    message,
  } = params;

  const securityContext = await getSecurityContext();
  const guestRepository = new SecureGuestRepository(securityContext);

  const guest = await guestRepository.create({
    tenant_id: tenantId,
    name,
    relationship,
    attendance,
    message,
  });

  return {
    success: true,
    guest: {
      id: guest.id,
      name: guest.name,
      relationship: guest.relationship,
      attendance: guest.attendance,
      message: guest.message,
      createdAt: guest.created_at,
    },
  };
}

/**
 * Get tenant information by ID
 */
async function getTenantInfo(params: { tenantId: number }) {
  const { tenantId } = params;

  const securityContext = await getSecurityContext();
  const tenantRepository = new SecureTenantRepository(securityContext);

  const tenant = await tenantRepository.findById(tenantId);

  if (!tenant) {
    throw new Error('Wedding not found.');
  }

  return {
    id: tenant.id,
    slug: tenant.slug,
    brideName: tenant.bride_name,
    groomName: tenant.groom_name,
    weddingDate: tenant.wedding_date,
    venueName: tenant.venue_name,
    venueAddress: tenant.venue_address,
    venueMapLink: tenant.venue_map_link,
    themePrimaryColor: tenant.theme_primary_color,
    themeSecondaryColor: tenant.theme_secondary_color,
    email: tenant.email,
    phone: tenant.phone,
    isActive: tenant.is_active,
    createdAt: tenant.created_at,
    updatedAt: tenant.updated_at,
  };
}

/**
 * Get tenant information by slug
 */
async function getTenantBySlug(params: { slug: string }) {
  const { slug } = params;

  const securityContext = await getSecurityContext();
  const tenantRepository = new SecureTenantRepository(securityContext);

  const tenant = await tenantRepository.findBySlug(slug);

  if (!tenant) {
    throw new Error('Wedding not found with the provided slug.');
  }

  return {
    id: tenant.id,
    slug: tenant.slug,
    brideName: tenant.bride_name,
    groomName: tenant.groom_name,
    weddingDate: tenant.wedding_date,
    venueName: tenant.venue_name,
    venueAddress: tenant.venue_address,
    venueMapLink: tenant.venue_map_link,
    themePrimaryColor: tenant.theme_primary_color,
    themeSecondaryColor: tenant.theme_secondary_color,
    email: tenant.email,
    phone: tenant.phone,
    isActive: tenant.is_active,
    createdAt: tenant.created_at,
    updatedAt: tenant.updated_at,
  };
}

/**
 * Search tenants by name or venue
 */
async function searchTenants(params: {
  query: string;
  limit?: number;
  isActive?: boolean;
}) {
  const { query, limit = 10, isActive = true } = params;

  const securityContext = await getSecurityContext();
  const tenantRepository = new SecureTenantRepository(securityContext);

  const result = await tenantRepository.findMany(
    {
      search: query,
      is_active: isActive,
    },
    { page: 1, limit }
  );

  return {
    tenants: result.tenants.map((tenant) => ({
      id: tenant.id,
      slug: tenant.slug,
      brideName: tenant.bride_name,
      groomName: tenant.groom_name,
      weddingDate: tenant.wedding_date,
      venueName: tenant.venue_name,
      isActive: tenant.is_active,
    })),
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

// Define all available agent functions
export const agentTools: AgentFunction[] = [
  {
    name: 'getGuestByTenant',
    description:
      'Get all guests for a specific wedding/tenant with optional filtering and pagination',
    parameters: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'number',
          description: 'The wedding/tenant ID to get guests for',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination (default: 1)',
        },
        limit: {
          type: 'number',
          description: 'Number of guests per page (default: 50)',
        },
        attendance: {
          type: 'string',
          enum: ['yes', 'no', 'maybe'],
          description: 'Filter by RSVP status',
        },
        search: {
          type: 'string',
          description: 'Search by guest name or relationship',
        },
      },
      required: ['tenantId'],
    },
    handler: getGuestByTenant,
  },
  {
    name: 'searchGuests',
    description:
      'Search for guests by name or relationship across all weddings or within a specific wedding',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term for guest name or relationship',
        },
        tenantId: {
          type: 'number',
          description: 'Optional: limit search to specific wedding',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
        },
      },
      required: ['query'],
    },
    handler: searchGuests,
  },
  {
    name: 'updateGuestStatus',
    description: "Update a guest's RSVP status (yes/no/maybe)",
    parameters: {
      type: 'object',
      properties: {
        guestId: {
          type: 'number',
          description: 'The guest ID to update',
        },
        status: {
          type: 'string',
          enum: ['yes', 'no', 'maybe'],
          description: 'New RSVP status',
        },
        tenantId: {
          type: 'number',
          description: 'Optional: wedding ID for security verification',
        },
      },
      required: ['guestId', 'status'],
    },
    handler: updateGuestStatus,
  },
  {
    name: 'addGuest',
    description: 'Add a new guest to a wedding',
    parameters: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'number',
          description: 'The wedding ID to add guest to',
        },
        name: {
          type: 'string',
          description: 'Guest name',
        },
        relationship: {
          type: 'string',
          description:
            'Relationship to couple (e.g., "Friend", "Family", "Colleague")',
        },
        attendance: {
          type: 'string',
          enum: ['yes', 'no', 'maybe'],
          description: 'Initial RSVP status (default: maybe)',
        },
        message: {
          type: 'string',
          description: 'Optional message from guest',
        },
      },
      required: ['tenantId', 'name', 'relationship'],
    },
    handler: addGuest,
  },
  {
    name: 'getTenantInfo',
    description: 'Get detailed information about a specific wedding by ID',
    parameters: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'number',
          description: 'The wedding ID to get information for',
        },
      },
      required: ['tenantId'],
    },
    handler: getTenantInfo,
  },
  {
    name: 'getTenantBySlug',
    description: 'Get wedding information by slug (URL-friendly identifier)',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'The wedding slug to search for',
        },
      },
      required: ['slug'],
    },
    handler: getTenantBySlug,
  },
  {
    name: 'searchTenants',
    description:
      'Search for weddings by couple names, venue, or other criteria',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search term for couple names, venue, or other wedding details',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
        },
        isActive: {
          type: 'boolean',
          description: 'Filter by active status (default: true)',
        },
      },
      required: ['query'],
    },
    handler: searchTenants,
  },
];
