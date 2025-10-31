import { useQuery } from '@tanstack/react-query';
import { tenantKeys } from './tenant.constants';
import { getTenantList } from './tenant.requests';
import { IGetTenantListParams } from './tenant.types';

// Hook for fetching tenant list
export const useGetTenantList = (params?: IGetTenantListParams) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => getTenantList(params),
  });

  return {
    tenantList: data?.tenants || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading,
    error,
    refetch,
  };
};
