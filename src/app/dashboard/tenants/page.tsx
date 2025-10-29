'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Table,
  Button,
  Input,
  Select,
  Space,
  Card,
  message,
  Modal,
  Tag,
  Tooltip,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { Tenant, TenantCreateRequest, TenantListResponse } from '@/types/tenant';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// Validation schema for tenant creation
const tenantValidationSchema = Yup.object({
  bride_name: Yup.string()
    .required('Bride name is required')
    .min(2, 'Bride name must be at least 2 characters')
    .max(100, 'Bride name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens, and apostrophes allowed'),
  groom_name: Yup.string()
    .required('Groom name is required')
    .min(2, 'Groom name must be at least 2 characters')
    .max(100, 'Groom name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s\-']+$/, 'Only letters, spaces, hyphens, and apostrophes allowed'),
  wedding_date: Yup.date()
    .required('Wedding date is required')
    .min(new Date('1900-01-01'), 'Wedding date must be after 1900'),
  venue_name: Yup.string()
    .required('Venue name is required')
    .min(2, 'Venue name must be at least 2 characters')
    .max(200, 'Venue name must not exceed 200 characters'),
  venue_address: Yup.string()
    .required('Venue address is required')
    .min(5, 'Venue address must be at least 5 characters'),
  venue_map_link: Yup.string()
    .url('Must be a valid URL')
    .nullable(),
  email: Yup.string()
    .email('Must be a valid email address')
    .nullable(),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Must be a valid phone number')
    .nullable(),
  theme_primary_color: Yup.string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color')
    .nullable(),
  theme_secondary_color: Yup.string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color')
    .nullable(),
});

interface TenantListPageState {
  tenants: Tenant[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: boolean | undefined;
  createModalVisible: boolean;
  generatedSlug: string;
}

export default function TenantListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [state, setState] = useState<TenantListPageState>({
    tenants: [],
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    statusFilter: undefined,
    createModalVisible: false,
    generatedSlug: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

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
    if (session) {
      loadTenants();
    }
  }, [session, loadTenants]);

  // Generate slug from bride and groom names
  const generateSlug = async (brideName: string, groomName: string) => {
    if (!brideName || !groomName) {
      setState(prev => ({ ...prev, generatedSlug: '' }));
      return;
    }

    try {
      const response = await fetch('/api/tenants/generate-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bride_name: brideName, groom_name: groomName }),
      });

      const result = await response.json();
      if (result.success) {
        setState(prev => ({ ...prev, generatedSlug: result.data.slug }));
      }
    } catch (error) {
      console.error('Failed to generate slug:', error);
    }
  };

  // Create tenant
  const createTenant = async (values: TenantCreateRequest) => {
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Tenant created successfully');
        setState(prev => ({
          ...prev,
          createModalVisible: false,
          generatedSlug: '',
        }));
        loadTenants();
      } else {
        message.error(result.error?.message || 'Failed to create tenant');
      }
    } catch (error) {
      message.error('Failed to create tenant');
    }
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

  // Table columns
  const columns: ColumnsType<Tenant> = [
    {
      title: 'Couple',
      key: 'couple',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.bride_name} & {record.groom_name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.slug}
          </div>
        </div>
      ),
    },
    {
      title: 'Wedding Date',
      dataIndex: 'wedding_date',
      key: 'wedding_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: true,
    },
    {
      title: 'Venue',
      dataIndex: 'venue_name',
      key: 'venue_name',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/dashboard/tenants/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

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
          {/* Filters and Search */}
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              <Search
                placeholder="Search by names or slug..."
                allowClear
                style={{ width: 300 }}
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
              />
              <Select
                placeholder="Filter by status"
                style={{ width: 150 }}
                allowClear
                onChange={handleStatusFilterChange}
              >
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadTenants}
                loading={state.loading}
              >
                Refresh
              </Button>
            </Space>
          </div>

          {/* Tenants Table */}
          <Table
            columns={columns}
            dataSource={state.tenants}
            rowKey="id"
            loading={state.loading}
            pagination={{
              current: state.currentPage,
              pageSize: state.pageSize,
              total: state.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} tenants`,
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
          />
        </Card>
      </div>

      {/* Create Tenant Modal */}
      <Modal
        title="Create New Tenant"
        open={state.createModalVisible}
        onCancel={() => setState(prev => ({
          ...prev,
          createModalVisible: false,
          generatedSlug: '',
        }))}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Formik
          initialValues={{
            bride_name: '',
            groom_name: '',
            wedding_date: '',
            venue_name: '',
            venue_address: '',
            venue_map_link: '',
            email: '',
            phone: '',
            theme_primary_color: '#E53E3E',
            theme_secondary_color: '#FED7D7',
          }}
          validationSchema={tenantValidationSchema}
          onSubmit={createTenant}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Bride Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Bride Name *
                  </label>
                  <Field name="bride_name">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        placeholder="Enter bride's name"
                        status={errors.bride_name && touched.bride_name ? 'error' : ''}
                        onChange={(e) => {
                          field.onChange(e);
                          generateSlug(e.target.value, values.groom_name);
                        }}
                      />
                    )}
                  </Field>
                  {errors.bride_name && touched.bride_name && (
                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                      {errors.bride_name}
                    </div>
                  )}
                </div>

                {/* Groom Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Groom Name *
                  </label>
                  <Field name="groom_name">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        placeholder="Enter groom's name"
                        status={errors.groom_name && touched.groom_name ? 'error' : ''}
                        onChange={(e) => {
                          field.onChange(e);
                          generateSlug(values.bride_name, e.target.value);
                        }}
                      />
                    )}
                  </Field>
                  {errors.groom_name && touched.groom_name && (
                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                      {errors.groom_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Generated Slug Preview */}
              {state.generatedSlug && (
                <div style={{ margin: '16px 0', padding: '8px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                  <strong>Generated URL:</strong> {state.generatedSlug}
                </div>
              )}

              {/* Wedding Date */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Wedding Date *
                </label>
                <Field name="wedding_date">
                  {({ field }: any) => (
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Select wedding date"
                      onChange={(date) => {
                        setFieldValue('wedding_date', date ? date.format('YYYY-MM-DD') : '');
                      }}
                      status={errors.wedding_date && touched.wedding_date ? 'error' : ''}
                    />
                  )}
                </Field>
                {errors.wedding_date && touched.wedding_date && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                    {errors.wedding_date}
                  </div>
                )}
              </div>

              {/* Venue Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Venue Name *
                  </label>
                  <Field name="venue_name">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        placeholder="Enter venue name"
                        status={errors.venue_name && touched.venue_name ? 'error' : ''}
                      />
                    )}
                  </Field>
                  {errors.venue_name && touched.venue_name && (
                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                      {errors.venue_name}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Venue Map Link
                  </label>
                  <Field name="venue_map_link">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        placeholder="https://maps.google.com/..."
                        status={errors.venue_map_link && touched.venue_map_link ? 'error' : ''}
                      />
                    )}
                  </Field>
                  {errors.venue_map_link && touched.venue_map_link && (
                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                      {errors.venue_map_link}
                    </div>
                  )}
                </div>
              </div>

              {/* Venue Address */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Venue Address *
                </label>
                <Field name="venue_address">
                  {({ field }: any) => (
                    <Input.TextArea
                      {...field}
                      placeholder="Enter complete venue address"
                      rows={2}
                      status={errors.venue_address && touched.venue_address ? 'error' : ''}
                    />
                  )}
                </Field>
                {errors.venue_address && touched.venue_address && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                    {errors.venue_address}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Email
                  </label>
                  <Field name="email">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        placeholder="contact@example.com"
                        status={errors.email && touched.email ? 'error' : ''}
                      />
                    )}
                  </Field>
                  {errors.email && touched.email && (
                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                      {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Phone
                  </label>
                  <Field name="phone">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        placeholder="+1234567890"
                        status={errors.phone && touched.phone ? 'error' : ''}
                      />
                    )}
                  </Field>
                  {errors.phone && touched.phone && (
                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                      {errors.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Colors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Primary Color
                  </label>
                  <Field name="theme_primary_color">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        type="color"
                        style={{ height: '40px' }}
                        status={errors.theme_primary_color && touched.theme_primary_color ? 'error' : ''}
                      />
                    )}
                  </Field>
                  {errors.theme_primary_color && touched.theme_primary_color && (
                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                      {errors.theme_primary_color}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Secondary Color
                  </label>
                  <Field name="theme_secondary_color">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        type="color"
                        style={{ height: '40px' }}
                        status={errors.theme_secondary_color && touched.theme_secondary_color ? 'error' : ''}
                      />
                    )}
                  </Field>
                  {errors.theme_secondary_color && touched.theme_secondary_color && (
                    <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                      {errors.theme_secondary_color}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <Space>
                  <Button
                    onClick={() => setState(prev => ({
                      ...prev,
                      createModalVisible: false,
                      generatedSlug: '',
                    }))}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    Create Tenant
                  </Button>
                </Space>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}