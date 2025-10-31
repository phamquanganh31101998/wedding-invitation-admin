export interface IGetTenantListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  wedding_date_from?: string;
  wedding_date_to?: string;
}

export interface ITenantListResponse {
  tenants: any[];
  total: number;
  page: number;
  limit: number;
}

export interface ITenantUpdateParams {
  [key: string]: any;
}

export interface ITenantStatusUpdateParams {
  isActive: boolean;
}
