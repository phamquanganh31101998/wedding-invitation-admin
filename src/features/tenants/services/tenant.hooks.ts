import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { tenantKeys } from './tenant.constants';
import {
  getTenantList,
  getTenantDetail,
  updateTenantField,
  updateTenantStatus,
} from './tenant.requests';
import {
  IGetTenantListParams,
  ITenantUpdateParams,
  ITenantStatusUpdateParams,
} from './tenant.types';

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

// Hook for fetching tenant detail
export const useGetTenantDetail = (tenantId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: tenantKeys.detail(parseInt(tenantId)),
    queryFn: () => getTenantDetail(tenantId),
    enabled: !!tenantId,
  });

  return {
    tenant: data || null,
    isLoading,
    error,
    refetch,
  };
};

// Hook for updating tenant field
export const useUpdateTenantField = (tenantId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateField, isPending } = useMutation({
    mutationFn: (updateData: ITenantUpdateParams) =>
      updateTenantField(tenantId, updateData),
    onSuccess: (data) => {
      queryClient.setQueryData(tenantKeys.detail(parseInt(tenantId)), data);
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      message.success('Field updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating tenant field:', error);
      message.error(error.message || 'Failed to update field');
    },
  });

  return {
    updateField,
    isUpdating: isPending,
  };
};

// Hook for updating tenant status
export const useUpdateTenantStatus = (tenantId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateStatus, isPending } = useMutation({
    mutationFn: (statusData: ITenantStatusUpdateParams) =>
      updateTenantStatus(tenantId, statusData),
    onSuccess: (data) => {
      queryClient.setQueryData(tenantKeys.detail(parseInt(tenantId)), data);
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      const action = data.isActive ? 'activated' : 'deactivated';
      message.success(`Tenant ${action} successfully`);
    },
    onError: (error: Error) => {
      console.error('Error updating tenant status:', error);
      message.error(error.message || 'Failed to update tenant status');
    },
  });

  return {
    updateStatus,
    isUpdating: isPending,
  };
};
