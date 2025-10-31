import { useState } from 'react';
import {
  Typography,
  Button,
  Card,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useModal } from '@ebay/nice-modal-react';
import DashboardBreadcrumb from '@/components/common/DashboardBreadcrumb';
import CreateTenantModal from './components/CreateTenantModal/CreateTenantModal';
import { Filter, TenantList } from './components';
import { useGetTenantList } from './services';

const { Title } = Typography;

interface TenantListManagementParams {
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: boolean | undefined;
}

export default function TenantListManagement() {
  const [params, setParams] = useState<TenantListManagementParams>({
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    statusFilter: undefined,
  });

  // Use the tenant service hook
  const { tenantList, total, isLoading, refetch } = useGetTenantList({
    page: params.currentPage,
    limit: params.pageSize,
    search: params.searchQuery || undefined,
    is_active: params.statusFilter,
  });

  const createTenantModal = useModal(CreateTenantModal);

  // Handle successful tenant creation
  const handleTenantCreated = () => {
    refetch();
  };

  // Show create tenant modal
  const showCreateTenantModal = () => {
    createTenantModal.show({ onSuccess: handleTenantCreated });
  };

  // Handle search
  const handleSearch = (value: string) => {
    setParams(prev => ({
      ...prev,
      searchQuery: value,
      currentPage: 1
    }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: boolean | undefined) => {
    setParams(prev => ({
      ...prev,
      statusFilter: value,
      currentPage: 1
    }));
  };

  // Handle pagination change
  const handleTableChange = (page: number, pageSize: number) => {
    setParams(prev => ({
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
            onClick={showCreateTenantModal}
          >
            Create Tenant
          </Button>
        </div>

        <Card>
          <Filter
            onSearch={handleSearch}
            onStatusFilterChange={handleStatusFilterChange}
            onRefresh={refetch}
            loading={isLoading}
          />

          <TenantList
            tenants={tenantList}
            loading={isLoading}
            currentPage={params.currentPage}
            pageSize={params.pageSize}
            total={total}
            onTableChange={handleTableChange}
          />
        </Card>
      </div>


    </div>
  );
}