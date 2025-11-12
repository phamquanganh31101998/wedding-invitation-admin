import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { guestKeys } from './guest.constants';
import {
  getGuestList,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestStats,
  importGuests,
  exportGuests,
} from './guest.requests';
import {
  IGuestCreateRequest,
  IGuestUpdateRequest,
  IGuestListParams,
} from './guest.types';

// Hook for fetching guest list
export const useGetGuestList = (
  tenantId: number,
  params?: IGuestListParams
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: guestKeys.list(tenantId, params),
    queryFn: () => getGuestList(tenantId, params),
    enabled: !!tenantId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    guests: data?.guests || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading,
    error,
    refetch,
  };
};

// Hook for fetching guest statistics
export const useGetGuestStats = (tenantId: number) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: guestKeys.stats(tenantId),
    queryFn: () => getGuestStats(tenantId),
    enabled: !!tenantId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    stats: data || null,
    isLoading,
    error,
    refetch,
  };
};

// Hook for creating a guest
export const useCreateGuest = (tenantId: number) => {
  const queryClient = useQueryClient();

  const { mutateAsync: createGuestMutation, isPending } = useMutation({
    mutationFn: (data: IGuestCreateRequest) => createGuest(tenantId, data),
    onMutate: async (newGuest) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: guestKeys.lists() });
      await queryClient.cancelQueries({ queryKey: guestKeys.stats(tenantId) });

      // Snapshot the previous values
      const previousLists = queryClient.getQueriesData({
        queryKey: guestKeys.lists(),
      });
      const previousStats = queryClient.getQueryData(guestKeys.stats(tenantId));

      // Optimistically update guest lists
      queryClient.setQueriesData(
        { queryKey: guestKeys.lists() },
        (old: any) => {
          if (!old) return old;

          const optimisticGuest = {
            id: Date.now(), // Temporary ID
            tenantId,
            ...newGuest,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            ...old,
            guests: [optimisticGuest, ...old.guests],
            total: old.total + 1,
          };
        }
      );

      // Optimistically update stats
      queryClient.setQueryData(guestKeys.stats(tenantId), (old: any) => {
        if (!old) return old;

        return {
          ...old,
          total: old.total + 1,
          attending:
            newGuest.attendance === 'yes' ? old.attending + 1 : old.attending,
          notAttending:
            newGuest.attendance === 'no'
              ? old.notAttending + 1
              : old.notAttending,
          maybe: newGuest.attendance === 'maybe' ? old.maybe + 1 : old.maybe,
        };
      });

      return { previousLists, previousStats };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.stats(tenantId) });
      message.success('Guest created successfully');
    },
    onError: (error: any, _newGuest, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(
          guestKeys.stats(tenantId),
          context.previousStats
        );
      }

      console.error('Error creating guest:', error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error.message ||
        'Failed to create guest. Please try again.';
      message.error(errorMessage);
    },
    retry: 1,
  });

  return {
    createGuest: createGuestMutation,
    isCreating: isPending,
  };
};

// Hook for updating a guest
export const useUpdateGuest = (tenantId: number) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateGuestMutation, isPending } = useMutation({
    mutationFn: ({
      guestId,
      data,
    }: {
      guestId: number;
      data: IGuestUpdateRequest;
    }) => updateGuest(tenantId, guestId, data),
    onMutate: async ({ guestId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: guestKeys.lists() });
      await queryClient.cancelQueries({ queryKey: guestKeys.stats(tenantId) });
      await queryClient.cancelQueries({
        queryKey: guestKeys.detail(tenantId, guestId),
      });

      // Snapshot the previous values
      const previousLists = queryClient.getQueriesData({
        queryKey: guestKeys.lists(),
      });
      const previousStats = queryClient.getQueryData(guestKeys.stats(tenantId));
      const previousDetail = queryClient.getQueryData(
        guestKeys.detail(tenantId, guestId)
      );

      // Optimistically update guest lists
      queryClient.setQueriesData(
        { queryKey: guestKeys.lists() },
        (old: any) => {
          if (!old) return old;

          const updatedGuests = old.guests.map((guest: any) =>
            guest.id === guestId
              ? { ...guest, ...data, updatedAt: new Date().toISOString() }
              : guest
          );

          return {
            ...old,
            guests: updatedGuests,
          };
        }
      );

      // Optimistically update stats if attendance changed
      if (data.attendance) {
        queryClient.setQueryData(guestKeys.stats(tenantId), (old: any) => {
          if (!old) return old;

          // Find the old guest to get previous attendance
          const allLists = queryClient.getQueriesData({
            queryKey: guestKeys.lists(),
          });
          let oldAttendance: string | undefined;

          for (const [, listData] of allLists) {
            const list = listData as any;
            if (list?.guests) {
              const guest = list.guests.find((g: any) => g.id === guestId);
              if (guest) {
                oldAttendance = guest.attendance;
                break;
              }
            }
          }

          if (!oldAttendance || oldAttendance === data.attendance) return old;

          const newStats = { ...old };

          // Decrement old attendance
          if (oldAttendance === 'yes') newStats.attending--;
          else if (oldAttendance === 'no') newStats.notAttending--;
          else if (oldAttendance === 'maybe') newStats.maybe--;

          // Increment new attendance
          if (data.attendance === 'yes') newStats.attending++;
          else if (data.attendance === 'no') newStats.notAttending++;
          else if (data.attendance === 'maybe') newStats.maybe++;

          return newStats;
        });
      }

      // Optimistically update detail
      queryClient.setQueryData(
        guestKeys.detail(tenantId, guestId),
        (old: any) => {
          if (!old) return old;
          return { ...old, ...data, updatedAt: new Date().toISOString() };
        }
      );

      return { previousLists, previousStats, previousDetail };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        guestKeys.detail(tenantId, variables.guestId),
        data
      );
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.stats(tenantId) });
      message.success('Guest updated successfully');
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(
          guestKeys.stats(tenantId),
          context.previousStats
        );
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          guestKeys.detail(tenantId, _variables.guestId),
          context.previousDetail
        );
      }

      console.error('Error updating guest:', error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error.message ||
        'Failed to update guest. Please try again.';
      message.error(errorMessage);
    },
    retry: 1,
  });

  return {
    updateGuest: updateGuestMutation,
    isUpdating: isPending,
  };
};

// Hook for deleting a guest
export const useDeleteGuest = (tenantId: number) => {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteGuestMutation, isPending } = useMutation({
    mutationFn: (guestId: number) => deleteGuest(tenantId, guestId),
    onMutate: async (guestId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: guestKeys.lists() });
      await queryClient.cancelQueries({ queryKey: guestKeys.stats(tenantId) });

      // Snapshot the previous values
      const previousLists = queryClient.getQueriesData({
        queryKey: guestKeys.lists(),
      });
      const previousStats = queryClient.getQueryData(guestKeys.stats(tenantId));

      // Find the guest being deleted to update stats correctly
      let deletedGuest: any = null;
      const allLists = queryClient.getQueriesData({
        queryKey: guestKeys.lists(),
      });
      for (const [, listData] of allLists) {
        const list = listData as any;
        if (list?.guests) {
          deletedGuest = list.guests.find((g: any) => g.id === guestId);
          if (deletedGuest) break;
        }
      }

      // Optimistically update guest lists
      queryClient.setQueriesData(
        { queryKey: guestKeys.lists() },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            guests: old.guests.filter((guest: any) => guest.id !== guestId),
            total: old.total - 1,
          };
        }
      );

      // Optimistically update stats
      if (deletedGuest) {
        queryClient.setQueryData(guestKeys.stats(tenantId), (old: any) => {
          if (!old) return old;

          return {
            ...old,
            total: old.total - 1,
            attending:
              deletedGuest.attendance === 'yes'
                ? old.attending - 1
                : old.attending,
            notAttending:
              deletedGuest.attendance === 'no'
                ? old.notAttending - 1
                : old.notAttending,
            maybe:
              deletedGuest.attendance === 'maybe' ? old.maybe - 1 : old.maybe,
          };
        });
      }

      return { previousLists, previousStats };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.stats(tenantId) });
      message.success('Guest deleted successfully');
    },
    onError: (error: any, _guestId, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(
          guestKeys.stats(tenantId),
          context.previousStats
        );
      }

      console.error('Error deleting guest:', error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error.message ||
        'Failed to delete guest. Please try again.';
      message.error(errorMessage);
    },
    retry: 1,
  });

  return {
    deleteGuest: deleteGuestMutation,
    isDeleting: isPending,
  };
};

// Hook for importing guests
export const useImportGuests = (tenantId: number) => {
  const queryClient = useQueryClient();

  const { mutateAsync: importGuestsMutation, isPending } = useMutation({
    mutationFn: (file: File) => importGuests(tenantId, file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.stats(tenantId) });

      if (result.failed > 0) {
        message.warning(
          `Import completed: ${result.imported} succeeded, ${result.failed} failed`
        );
      } else {
        message.success(`Successfully imported ${result.imported} guests`);
      }
    },
    onError: (error: any) => {
      console.error('Error importing guests:', error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error.message ||
        'Failed to import guests. Please check the file format and try again.';
      message.error(errorMessage);
    },
    retry: 1,
  });

  return {
    importGuests: importGuestsMutation,
    isImporting: isPending,
  };
};

// Hook for exporting guests
export const useExportGuests = (tenantId: number) => {
  const { mutateAsync: exportGuestsMutation, isPending } = useMutation({
    mutationFn: (params?: IGuestListParams) => exportGuests(tenantId, params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `guests-${tenantId}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Guests exported successfully');
    },
    onError: (error: any) => {
      console.error('Error exporting guests:', error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error.message ||
        'Failed to export guests. Please try again.';
      message.error(errorMessage);
    },
    retry: 1,
  });

  return {
    exportGuests: exportGuestsMutation,
    isExporting: isPending,
  };
};
