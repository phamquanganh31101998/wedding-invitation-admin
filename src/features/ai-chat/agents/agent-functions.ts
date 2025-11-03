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
 * Get detailed RSVP summary for a specific wedding
 */
async function getRsvpSummary(params: { tenantId: number }) {
  const { tenantId } = params;

  const securityContext = await getSecurityContext();
  const guestRepository = new SecureGuestRepository(securityContext);

  return await guestRepository.getRsvpSummary(tenantId);
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
 * Export guest list for a wedding
 */
async function exportGuestList(params: {
  tenantId: number;
  format?: 'summary' | 'detailed';
}) {
  const { tenantId, format = 'summary' } = params;

  const securityContext = await getSecurityContext();
  const guestRepository = new SecureGuestRepository(securityContext);

  return await guestRepository.exportGuestList({ tenantId, format });
}

// Define all available agent functions
export const agentFunctions: AgentFunction[] = [
  {
    name: 'getRsvpSummary',
    description:
      'Get detailed RSVP summary and recent activity for a specific wedding',
    parameters: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'number',
          description: 'The wedding/tenant ID to get RSVP summary for',
        },
      },
      required: ['tenantId'],
    },
    handler: getRsvpSummary,
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
    name: 'exportGuestList',
    description:
      'Export guest list for a wedding in summary or detailed format',
    parameters: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'number',
          description: 'The wedding ID to export guest list for',
        },
        format: {
          type: 'string',
          enum: ['summary', 'detailed'],
          description: 'Export format (default: summary)',
        },
      },
      required: ['tenantId'],
    },
    handler: exportGuestList,
  },
];
