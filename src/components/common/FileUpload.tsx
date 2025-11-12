'use client';

import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { validateFileType, validateFileSize } from '@/lib/utils/file';
import { useUploadFile } from '@/features/files/services';

interface FileUploadProps {
  tenantId: number;
  fileType: string;
  fileName?: string;
  displayOrder?: number;
  onUploadSuccess?: (url: string) => void;
  disabled?: boolean;
  acceptedTypes?: string;
}

export const FileUpload = ({
  tenantId,
  fileType,
  fileName,
  displayOrder = 0,
  onUploadSuccess,
  disabled = false,
  acceptedTypes = 'image/*',
}: FileUploadProps) => {
  const { uploadFile, isUploading } = useUploadFile(tenantId);

  const handleUpload = async (file: File) => {
    if (disabled) return;

    try {
      const result = await uploadFile({
        file,
        fileType,
        fileName,
        displayOrder,
      });

      onUploadSuccess?.(result.url);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const beforeUpload = (file: UploadFile) => {
    // Get the actual File object - it could be in originFileObj or the file itself
    const fileObj = (file.originFileObj || file) as File;

    // Check if we have a valid File object
    if (!fileObj || !fileObj.type || !fileObj.size) {
      return false;
    }

    // Validate file type using utility function
    if (!validateFileType(fileObj)) {
      return false;
    }

    // Validate file size using utility function (default 5MB)
    if (!validateFileSize(fileObj)) {
      return false;
    }

    handleUpload(fileObj);
    return false; // Prevent default upload
  };

  return (
    <Upload
      accept={acceptedTypes}
      showUploadList={false}
      beforeUpload={beforeUpload}
      disabled={disabled || isUploading}
    >
      <Button
        icon={<UploadOutlined />}
        loading={isUploading}
        disabled={disabled}
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </Button>
    </Upload>
  );
};
