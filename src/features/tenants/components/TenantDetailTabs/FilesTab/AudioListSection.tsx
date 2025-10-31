'use client';

import { Card, Typography } from 'antd';
import { FileUpload } from '@/components/common/FileUpload';
import { IFile } from '@/types/file';
import { useGetFileList, useDeleteFile, useUpdateFileOrder } from '@/features/files/services';
import AudioList from './AudioList';

const { Title, Text } = Typography;

interface AudioListSectionProps {
  tenantId: number;
  onFileUploadSuccess?: () => void;
}

export default function AudioListSection({ tenantId, onFileUploadSuccess }: AudioListSectionProps) {
  // React Query hooks
  const { fileList: audioFiles, isLoading: loading } = useGetFileList(tenantId, { fileTypes: 'music' });
  const { deleteFile: deleteAudioFile } = useDeleteFile(tenantId);
  const { updateFileOrders } = useUpdateFileOrder(tenantId);

  const handleFileUpload = () => {
    onFileUploadSuccess?.();
  };

  const handleDelete = (file: IFile) => {
    deleteAudioFile(file);
  };

  const handleReorder = (files: IFile[]) => {
    updateFileOrders(files);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0 }}>Wedding Music</Title>
        <FileUpload
          tenantId={tenantId}
          fileType="music"
          fileName="Wedding background music"
          onUploadSuccess={handleFileUpload}
          acceptedTypes="audio/*"
        />
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Upload and manage background music for the wedding invitation
      </Text>

      <Card title="Audio Files" size="small">
        <AudioList
          audioFiles={audioFiles}
          loading={loading}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
      </Card>
    </div>
  );
}