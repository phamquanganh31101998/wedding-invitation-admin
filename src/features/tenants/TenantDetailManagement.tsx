'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, message, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
  HomeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useModal } from '@ebay/nice-modal-react';
import { TenantUI, TenantUpdateRequestUI } from '@/types/tenant';
import DashboardBreadcrumb from '@/components/common/DashboardBreadcrumb';
import TenantDetailTabs from './components/TenantDetailTabs/TenantDetailTabs';
import ThemePreviewModal from './components/ThemePreviewModal/ThemePreviewModal';

const { Title } = Typography;

interface TenantDetailState {
  tenant: TenantUI | null;
  loading: boolean;
  editingField: string | null;
  editingValues: Record<string, any>;
  saving: boolean;
}

interface TenantDetailManagementProps {
  tenantId: string;
}

export default function TenantDetailManagement({ tenantId }: TenantDetailManagementProps) {
  const router = useRouter();
  const themePreviewModal = useModal(ThemePreviewModal);

  const [state, setState] = useState<TenantDetailState>({
    tenant: null,
    loading: false,
    editingField: null,
    editingValues: {},
    saving: false,
  });

  // Load tenant data
  const loadTenant = useCallback(async () => {
    if (!tenantId) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`/api/tenants/${tenantId}`);
      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          tenant: result.data,
          loading: false,
        }));
      } else {
        message.error(result.error?.message || 'Failed to load tenant');
        setState(prev => ({ ...prev, loading: false }));
        if (result.error?.code === 'TENANT_NOT_FOUND') {
          router.push('/tenants');
        }
      }
    } catch (error) {
      message.error('Failed to load tenant');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [tenantId, router]);

  // Load tenant on mount
  useEffect(() => {
    if (tenantId) {
      loadTenant();
    }
  }, [tenantId, loadTenant]);

  // Start editing a field
  const startEditing = (field: string, currentValue: any) => {
    setState(prev => ({
      ...prev,
      editingField: field,
      editingValues: { [field]: currentValue },
    }));
  };

  // Cancel editing
  const cancelEditing = () => {
    setState(prev => ({
      ...prev,
      editingField: null,
      editingValues: {},
    }));
  };

  // Update editing values
  const updateEditingValue = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      editingValues: { ...prev.editingValues, [field]: value },
    }));
  };

  // Save field update
  const saveFieldUpdate = async (field: string, value: any) => {
    if (!state.tenant) return;

    setState(prev => ({ ...prev, saving: true }));

    try {
      const updateData: TenantUpdateRequestUI = { [field]: value };

      const response = await fetch(`/api/tenants/${state.tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          tenant: result.data,
          editingField: null,
          editingValues: {},
          saving: false,
        }));
        message.success('Field updated successfully');
      } else {
        message.error(result.error?.message || 'Failed to update field');
        setState(prev => ({ ...prev, saving: false }));
      }
    } catch (error) {
      message.error('Failed to update field');
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  // Update tenant status
  const updateTenantStatus = async (isActive: boolean) => {
    if (!state.tenant) return;

    setState(prev => ({ ...prev, saving: true }));

    try {
      const response = await fetch(`/api/tenants/${state.tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          tenant: result.data,
          saving: false,
        }));
        const action = isActive ? 'activated' : 'deactivated';
        message.success(`Tenant ${action} successfully`);
      } else {
        message.error(result.error?.message || `Failed to update tenant status`);
        setState(prev => ({ ...prev, saving: false }));
      }
    } catch (error) {
      message.error('Failed to update tenant status');
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  // Show theme preview
  const showThemePreview = () => {
    if (state.tenant) {
      themePreviewModal.show({ tenant: state.tenant });
    }
  };

  if (!state.tenant) {
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
              title: `${state.tenant.brideName} & ${state.tenant.groomName}`,
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
              {state.tenant.brideName} & {state.tenant.groomName}
            </Title>
            <Tag color={state.tenant.isActive ? 'green' : 'red'}>
              {state.tenant.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </div>
          <Space>
            <Button
              type={state.tenant.isActive ? 'default' : 'primary'}
              icon={state.tenant.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => updateTenantStatus(!state.tenant!.isActive)}
              loading={state.saving}
            >
              {state.tenant.isActive ? 'Deactivate' : 'Activate'}
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
          tenant={state.tenant}
          editingField={state.editingField}
          editingValues={state.editingValues}
          saving={state.saving}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onUpdateEditingValue={updateEditingValue}
          onSaveFieldUpdate={saveFieldUpdate}
          onUpdateTenantStatus={updateTenantStatus}
        />
      </div>
    </div>
  );
}