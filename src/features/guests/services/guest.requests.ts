import {
  IGuest,
  IGuestCreateRequest,
  IGuestUpdateRequest,
  IGuestListParams,
  IGuestListResponse,
  IGuestStats,
  IGuestImportResult,
} from './guest.types';

export const getGuestList = async (
  tenantId: number,
  params?: IGuestListParams
): Promise<IGuestListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params?.attendance) {
    searchParams.append('attendance', params.attendance);
  }
  if (params?.search) {
    searchParams.append('search', params.search);
  }

  const response = await fetch(
    `/api/tenants/${tenantId}/guests?${searchParams}`
  );
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch guests');
  }

  return result.data;
};

export const createGuest = async (
  tenantId: number,
  data: IGuestCreateRequest
): Promise<IGuest> => {
  const response = await fetch(`/api/tenants/${tenantId}/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to create guest');
  }

  return result.data;
};

export const getGuestDetail = async (
  tenantId: number,
  guestId: number
): Promise<IGuest> => {
  const response = await fetch(`/api/tenants/${tenantId}/guests/${guestId}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch guest detail');
  }

  return result.data;
};

export const updateGuest = async (
  tenantId: number,
  guestId: number,
  data: IGuestUpdateRequest
): Promise<IGuest> => {
  const response = await fetch(`/api/tenants/${tenantId}/guests/${guestId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to update guest');
  }

  return result.data;
};

export const deleteGuest = async (
  tenantId: number,
  guestId: number
): Promise<void> => {
  const response = await fetch(`/api/tenants/${tenantId}/guests/${guestId}`, {
    method: 'DELETE',
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to delete guest');
  }
};

export const getGuestStats = async (tenantId: number): Promise<IGuestStats> => {
  const response = await fetch(`/api/tenants/${tenantId}/guests/stats`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch guest stats');
  }

  return result.data;
};

export const importGuests = async (
  tenantId: number,
  file: File
): Promise<IGuestImportResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/tenants/${tenantId}/guests/import`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to import guests');
  }

  return result.data;
};

export const exportGuests = async (
  tenantId: number,
  params?: IGuestListParams
): Promise<Blob> => {
  const searchParams = new URLSearchParams();

  if (params?.attendance) {
    searchParams.append('attendance', params.attendance);
  }
  if (params?.search) {
    searchParams.append('search', params.search);
  }

  const response = await fetch(
    `/api/tenants/${tenantId}/guests/export?${searchParams}`
  );

  if (!response.ok) {
    throw new Error('Failed to export guests');
  }

  return response.blob();
};
