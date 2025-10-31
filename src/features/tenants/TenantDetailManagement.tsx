'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
  HomeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useModal } from '@ebay/nice-modal-react';
import DashboardBreadcrumb from '@/components/common/DashboardBreadcrumb';
import TenantDetailTabs from './components/TenantDetailTabs/TenantDetailTabs';
import ThemePreviewModal from './components/ThemePreviewModal/ThemePreviewModal';
import { useGetTenantDetail, useUpdateTenantField, useUpdateTenantStatus } from './services';

const { Title } = Typography;

interface TenantDetailEditState {
  editingField: string | null;
  editingValues: Record<string, any>;
}

interface TenantDetailManagementProps {
  tenantId: string;
}

export default function TenantDetailManagement({ tenantId }: TenantDetailManagementProps) {
  const router = useRouter();
  const themePreviewModal = useModal(ThemePreviewModal);

  // Only state for edit values
  const [editState, setEditState] = useState<TenantDetailEditState>({
    editingField: null,
    editingValues: {},
  });

  // Use tenant services
  const { tenant, isLoading, error, refetch } = useGetTenantDetail(tenantId);
  const { updateField, isUpdating: isUpdatingField } = useUpdateTenantField(tenantId);
  const { updateStatus, isUpdating: isUpdatingStatus } = useUpdateTenantStatus(tenantId);

  // Handle error or not found
  if (error && error.message.includes('TENANT_NOT_FOUND')) {
    router.push('/tenants');
    return null;
  }

  // Start editing a field
  const startEditing = (field: string, currentValue: any) => {
    setEditState({
      editingField: field,
      editingValues: { [field]: currentValue },
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditState({
      editingField: null,
      editingValues: {},
    });
  };

  // Update editing values
  const updateEditingValue = (field: string, value: any) => {
    setEditState(prev => ({
      ...prev,
      editingValues: { ...prev.editingValues, [field]: value },
    }));
  };

  // Save field update
  const saveFieldUpdate = async (field: string, value: any) => {
    if (!tenant) return;

    try {
      const updateData = { [field]: value };
      await updateField(updateData);

      // Clear editing state on success
      setEditState({
        editingField: null,
        editingValues: {},
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Update tenant status
  const handleUpdateTenantStatus = async (isActive: boolean) => {
    if (!tenant) return;

    try {
      await updateStatus({ isActive });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Show theme preview
  const showThemePreview = () => {
    if (tenant) {
      themePreviewModal.show({ tenant });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tenant) {
    return null;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <DashboardBreadcrumb
          customItems={[
            {
              href: '/dashboard',
              title: <HomeOutlined />,
            },
            {
              href: '/tenants',
              title: (
                <span>
                  <TeamOutlined />
                  <span>Tenant Management</span>
                </span>
              ),
            },
            {
              title: `${tenant.brideName} & ${tenant.groomName}`,
            },
          ]}
        />

        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/tenants')}
            >
              Tenants List
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {tenant.brideName} & {tenant.groomName}
            </Title>
            <Tag color={tenant.isActive ? 'green' : 'red'}>
              {tenant.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </div>
          <Space>
            <Button
              type={tenant.isActive ? 'default' : 'primary'}
              icon={tenant.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleUpdateTenantStatus(!tenant.isActive)}
              loading={isUpdatingStatus}
            >
              {tenant.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={showThemePreview}
            >
              Preview Theme
            </Button>
          </Space>
        </div>

        {/* Tabs */}
        <TenantDetailTabs
          tenant={tenant}
          editingField={editState.editingField}
          editingValues={editState.editingValues}
          saving={isUpdatingField}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onUpdateEditingValue={updateEditingValue}
          onSaveFieldUpdate={saveFieldUpdate}
          onUpdateTenantStatus={handleUpdateTenantStatus}
          onRefreshTenant={refetch}
        />
      </div>
    </div>
  );
}