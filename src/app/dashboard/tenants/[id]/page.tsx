'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Spin } from 'antd';
import TenantDetailManagement from '@/features/tenants/TenantDetailManagement';

export default function TenantDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <TenantDetailManagement tenantId={tenantId} />;
}