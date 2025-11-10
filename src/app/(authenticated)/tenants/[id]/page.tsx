'use client';

import { useParams } from 'next/navigation';
import { Spin } from 'antd';
import TenantDetailManagement from '@/features/tenants/TenantDetailManagement';

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params?.id as string;

  if (!tenantId) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return <TenantDetailManagement tenantId={tenantId} />;
}
