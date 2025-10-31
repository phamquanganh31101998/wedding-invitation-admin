'use client';

import { Divider } from 'antd';
import { TenantUI } from '@/types/tenant';
import AudioListSection from './AudioListSection';
import ImageListSection from './ImageListSection';

interface FilesTabProps {
  tenant: TenantUI;
  onFileUploadSuccess?: () => void;
}

export default function FilesTab({
  tenant,
  onFileUploadSuccess,
}: FilesTabProps) {
  return (
    <div>
      {/* Audio Files Section */}
      <AudioListSection
        tenantId={tenant.id}
        onFileUploadSuccess={onFileUploadSuccess}
      />

      <Divider />

      {/* Gallery Images Section */}
      <ImageListSection
        tenantId={tenant.id}
        onFileUploadSuccess={onFileUploadSuccess}
      />
    </div>
  );
}