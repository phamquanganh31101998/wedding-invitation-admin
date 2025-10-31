import { IGetTenantListParams, ITenantListResponse } from './tenant.types';

export const getTenantList = async (
  params?: IGetTenantListParams
): Promise<ITenantListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params?.search) {
    searchParams.append('search', params.search);
  }
  if (params?.is_active !== undefined) {
    searchParams.append('is_active', params.is_active.toString());
  }
  if (params?.wedding_date_from) {
    searchParams.append('wedding_date_from', params.wedding_date_from);
  }
  if (params?.wedding_date_to) {
    searchParams.append('wedding_date_to', params.wedding_date_to);
  }

  const response = await fetch(`/api/tenants?${searchParams}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch tenants');
  }

  return result.data;
};
