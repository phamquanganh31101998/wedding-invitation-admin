import { IFile } from '@/types/file';
import { IGetFileListParams, IUploadFileBody } from './file.types';

export const getFileList = async (
  tenantId: number,
  params?: IGetFileListParams
): Promise<IFile[]> => {
  const fileType = params?.fileTypes;

  const response = await fetch(
    `/api/tenants/${tenantId}/files?type=${fileType}`
  );
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || `Failed to fetch files`);
  }

  return result.files as IFile[];
};

export const deleteFile = async (tenantId: number, file: IFile) => {
  const response = await fetch(
    `/api/tenants/${tenantId}/files?fileId=${file.id}&fileUrl=${encodeURIComponent(file.url)}`,
    { method: 'DELETE' }
  );
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || `Failed to delete file`);
  }

  return result;
};

export const updateFileOrders = async (tenantId: number, files: IFile[]) => {
  const updatePromises = files.map((file, index) =>
    fetch(`/api/tenants/${tenantId}/files/${file.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayOrder: index + 1 }),
    })
  );

  const responses = await Promise.all(updatePromises);
  const results = await Promise.all(responses.map((r) => r.json()));

  const failedUpdates = results.filter((r) => !r.success);
  if (failedUpdates.length > 0) {
    throw new Error(`Failed to update file orders`);
  }

  return results;
};

export const uploadFile = async (
  tenantId: number,
  uploadData: IUploadFileBody
) => {
  const { file, fileType, fileName, displayOrder = 0 } = uploadData;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  if (fileName) formData.append('fileName', fileName);
  formData.append('displayOrder', displayOrder.toString());

  const response = await fetch(`/api/tenants/${tenantId}/files`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }

  return result;
};
