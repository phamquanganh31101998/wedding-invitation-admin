import { IGuestListParams } from './guest.types';

export const guestKeys = {
  all: ['guests'] as const,
  lists: () => [...guestKeys.all, 'list'] as const,
  list: (tenantId: number, params?: IGuestListParams) =>
    [...guestKeys.lists(), tenantId, params] as const,
  details: () => [...guestKeys.all, 'detail'] as const,
  detail: (tenantId: number, guestId: number) =>
    [...guestKeys.details(), tenantId, guestId] as const,
  stats: (tenantId: number) => [...guestKeys.all, 'stats', tenantId] as const,
};

export const GUEST_ATTENDANCE_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Maybe', value: 'maybe' },
];

export const IMPORT_FILE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const IMPORT_ACCEPTED_FORMATS = ['.csv', '.xlsx', '.xls'];
