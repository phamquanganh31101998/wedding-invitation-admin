import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { fileKeys } from './file.constants';
import {
  getFileList,
  deleteFile,
  updateFileOrders,
  uploadFile,
} from './file.requests';
import { IGetFileListParams, IUploadFileBody } from './file.types';
import { IFile } from '@/types/file';

// Generic hook for fetching files by type
export const useGetFileList = (
  tenantId: number,
  params: IGetFileListParams
) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: fileKeys.listByTenant(tenantId, params),
    queryFn: () => getFileList(tenantId, params),
  });

  return { fileList: data || [], isLoading, refetch };
};

export const useDeleteFile = (tenantId: number) => {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteFileAction, isPending } = useMutation({
    mutationFn: (file: IFile) => deleteFile(tenantId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileKeys.listAllByTenant(tenantId),
      });
      message.success('File deleted successfully');
    },
    onError: (error: Error) => {
      console.error(`Error deleting file:`, error);
      message.error(error.message || `Failed to delete file`);
    },
  });

  return {
    deleteFile: deleteFileAction,
    isDeleting: isPending,
  };
};

export const useUpdateFileOrder = (tenantId: number) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateOrder, isPending } = useMutation({
    mutationFn: (files: IFile[]) => updateFileOrders(tenantId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileKeys.listAllByTenant(tenantId),
      });
      message.success('File order updated successfully');
    },
    onError: (error: Error) => {
      console.error(`Error updating file order:`, error);
      message.error(error.message || `Failed to update file order`);
    },
  });

  return {
    updateFileOrders: updateOrder,
    isPending,
  };
};

export const useUploadFile = (tenantId: number) => {
  const queryClient = useQueryClient();

  const { mutateAsync: uploadFileAction, isPending } = useMutation({
    mutationFn: (uploadData: IUploadFileBody) =>
      uploadFile(tenantId, uploadData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileKeys.listAllByTenant(tenantId),
      });
      message.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      message.error(error.message || 'Upload failed');
    },
  });

  return {
    uploadFile: uploadFileAction,
    isUploading: isPending,
  };
};
