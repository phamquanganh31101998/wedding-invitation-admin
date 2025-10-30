'use client';

import { Upload, Image, message, Button, Spin } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';

interface FileUploadProps {
  tenantId: number;
  fileType: string;
  currentFileUrl?: string;
  fileName?: string;
  displayOrder?: number;
  onUploadSuccess?: (url: string) => void;
  onDeleteSuccess?: () => void;
  maxWidth?: number;
  maxHeight?: number;
  showPreview?: boolean;
  disabled?: boolean;
  acceptedTypes?: string;
  isImageOnly?: boolean;
}

export const FileUpload = ({
  tenantId,
  fileType,
  currentFileUrl,
  fileName,
  displayOrder = 0,
  onUploadSuccess,
  onDeleteSuccess,
  maxWidth = 300,
  maxHeight = 200,
  showPreview = true,
  disabled = false,
  acceptedTypes = 'image/*',
  isImageOnly = true,
}: FileUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(currentFileUrl);
  const [deleting, setDeleting] = useState(false);

  const handleUpload = async (file: File) => {
    if (disabled) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    if (fileName) formData.append('fileName', fileName);
    formData.append('displayOrder', displayOrder.toString());

    try {
      const response = await fetch(`/api/tenants/${tenantId}/files`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFileUrl(result.url);
        onUploadSuccess?.(result.url);
        message.success('File uploaded successfully');
      } else {
        message.error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!fileUrl || disabled) return;

    setDeleting(true);

    try {
      // Note: This would need the file ID to work properly
      // For now, we'll just clear the local state
      setFileUrl(undefined);
      onDeleteSuccess?.();
      message.success('File removed');
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete file');
    } finally {
      setDeleting(false);
    }
  };

  const beforeUpload = (file: UploadFile) => {
    // Validate file type based on acceptedTypes
    if (isImageOnly) {
      const isImage = file.type?.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
    } else {
      // For audio files
      const isValidType =
        file.type?.startsWith('image/') || file.type?.startsWith('audio/');
      if (!isValidType) {
        message.error('You can only upload image or audio files!');
        return false;
      }
    }

    const isLt50M = file.size! / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error('File must be smaller than 50MB!');
      return false;
    }

    handleUpload(file.originFileObj as File);
    return false; // Prevent default upload
  };

  const isImageFile =
    fileUrl &&
    (fileUrl.includes('.jpg') ||
      fileUrl.includes('.jpeg') ||
      fileUrl.includes('.png') ||
      fileUrl.includes('.gif') ||
      fileUrl.includes('.webp'));

  return (
    <div className="file-upload-container">
      {showPreview && fileUrl && (
        <div style={{ marginBottom: 16, position: 'relative' }}>
          {isImageFile ? (
            <Image
              src={fileUrl}
              alt={fileName || `${fileType} file`}
              style={{
                maxWidth,
                maxHeight,
                objectFit: 'cover',
                borderRadius: 8,
              }}
              preview={{
                mask: 'Preview',
              }}
            />
          ) : (
            <div
              style={{
                width: maxWidth,
                height: 100,
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafafa',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <FileOutlined
                  style={{ fontSize: 24, color: '#999', marginBottom: 8 }}
                />
                <div style={{ fontSize: 12, color: '#666' }}>
                  {fileName || 'Audio File'}
                </div>
              </div>
            </div>
          )}
          {!disabled && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleting}
              onClick={handleDelete}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }}
              size="small"
            />
          )}
        </div>
      )}

      <Upload
        accept={acceptedTypes}
        showUploadList={false}
        beforeUpload={beforeUpload}
        disabled={disabled || loading}
      >
        <Button icon={<UploadOutlined />} loading={loading} disabled={disabled}>
          {loading ? 'Uploading...' : fileUrl ? 'Change File' : 'Upload File'}
        </Button>
      </Upload>

      {loading && (
        <div style={{ marginTop: 8 }}>
          <Spin size="small" /> Uploading file...
        </div>
      )}
    </div>
  );
};
