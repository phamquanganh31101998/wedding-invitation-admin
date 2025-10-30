import { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  Card,
  message,
  Modal,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Tenant } from '@/types/tenant';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import { CreateTenantForm } from '@/features/tenants/components/CreateTenantForm';
import { Filter, TenantList } from './components';

const { Title } = Typography;

interface TenantListManagementState {
  tenants: Tenant[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: boolean | undefined;
  createModalVisible: boolean;
}

export default function TenantListManagement() {
  const [state, setState] = useState<TenantListManagementState>({
    tenants: [],
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    statusFilter: undefined,
    createModalVisible: false,
  });

  // Load tenants
  const loadTenants = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({
        page: state.currentPage.toString(),
        limit: state.pageSize.toString(),
      });

      if (state.searchQuery) {
        params.append('search', state.searchQuery);
      }

      if (state.statusFilter !== undefined) {
        params.append('is_active', state.statusFilter.toString());
      }

      const response = await fetch(`/api/tenants?${params}`);
      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          tenants: result.data.tenants,
          total: result.data.total,
          loading: false,
        }));
      } else {
        message.error(result.error?.message || 'Failed to load tenants');
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      message.error('Failed to load tenants');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.currentPage, state.pageSize, state.searchQuery, state.statusFilter]);

  // Load tenants on mount and when dependencies change
  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Handle successful tenant creation
  const handleTenantCreated = () => {
    setState(prev => ({ ...prev, createModalVisible: false }));
    loadTenants();
  };

  // Handle search
  const handleSearch = (value: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: value,
      currentPage: 1
    }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: boolean | undefined) => {
    setState(prev => ({
      ...prev,
      statusFilter: value,
      currentPage: 1
    }));
  };

  // Handle pagination change
  const handleTableChange = (page: number, pageSize: number) => {
    setState(prev => ({
      ...prev,
      currentPage: page,
      pageSize: pageSize
    }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <DashboardBreadcrumb />

        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <Title level={2} style={{ margin: 0 }}>
            Tenant Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setState(prev => ({ ...prev, createModalVisible: true }))}
          >
            Create Tenant
          </Button>
        </div>

        <Card>
          <Filter
            onSearch={handleSearch}
            onStatusFilterChange={handleStatusFilterChange}
            onRefresh={loadTenants}
            loading={state.loading}
          />

          <TenantList
            tenants={state.tenants}
            loading={state.loading}
            currentPage={state.currentPage}
            pageSize={state.pageSize}
            total={state.total}
            onTableChange={handleTableChange}
          />
        </Card>
      </div>

      {/* Create Tenant Modal */}
      <Modal
        title="Create New Tenant"
        open={state.createModalVisible}
        onCancel={() => setState(prev => ({ ...prev, createModalVisible: false }))}
        footer={null}
        width={800}
      >
        <CreateTenantForm
          onSuccess={handleTenantCreated}
          onCancel={() => setState(prev => ({ ...prev, createModalVisible: false }))}
        />
      </Modal>
    </div>
  );
}