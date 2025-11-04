'use client';

import { Card, Typography } from 'antd';
import { FileUpload } from '@/components/common/FileUpload';
import { IFile } from '@/types/file';
import {
  useGetFileList,
  useDeleteFile,
  useUpdateFileOrder,
} from '@/features/files/services';
import ImageList from './ImageList';

const { Title, Text } = Typography;

interface ImageListSectionProps {
  tenantId: number;
  onFileUploadSuccess?: () => void;
}

export default function ImageListSection({
  tenantId,
  onFileUploadSuccess,
}: ImageListSectionProps) {
  // React Query hooks
  const { fileList: imageFiles, isLoading: loading } = useGetFileList(
    tenantId,
    { fileTypes: 'image' }
  );

  const { deleteFile: deleteImageFile } = useDeleteFile(tenantId);
  const { updateFileOrders } = useUpdateFileOrder(tenantId);

  const handleFileUpload = () => {
    onFileUploadSuccess?.();
  };

  const handleDelete = (file: IFile) => {
    deleteImageFile(file);
  };

  const handleReorder = (files: IFile[]) => {
    updateFileOrders(files);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Gallery Images
        </Title>
        <FileUpload
          tenantId={tenantId}
          fileType="image"
          fileName="Gallery photo"
          onUploadSuccess={handleFileUpload}
          acceptedTypes="image/*"
        />
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Upload and manage photos for the wedding gallery
      </Text>

      <Card title="Gallery Images" size="small">
        <ImageList
          imageFiles={imageFiles}
          loading={loading}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
      </Card>
    </div>
  );
}
