'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Typography,
  Card,
  Tabs,
  Button,
  Input,
  DatePicker,
  Space,
  message,
  Spin,
  Tag,
  Divider,
  Row,
  Col,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { Tenant, TenantUpdateRequest } from '@/types/tenant';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Validation schema for tenant updates

interface TenantDetailState {
  tenant: Tenant | null;
  loading: boolean;
  editingField: string | null;
  editingValues: Record<string, any>;
  saving: boolean;
  themePreviewVisible: boolean;
}

export default function TenantDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.id as string;

  const [state, setState] = useState<TenantDetailState>({
    tenant: null,
    loading: false,
    editingField: null,
    editingValues: {},
    saving: false,
    themePreviewVisible: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

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
          router.push('/dashboard/tenants');
        }
      }
    } catch (error) {
      message.error('Failed to load tenant');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [tenantId, router]);

  // Load tenant on mount
  useEffect(() => {
    if (session && tenantId) {
      loadTenant();
    }
  }, [session, tenantId, loadTenant]);

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

  // Save field update
  const saveFieldUpdate = async (field: string, value: any) => {
    if (!state.tenant) return;

    setState(prev => ({ ...prev, saving: true }));

    try {
      const updateData: TenantUpdateRequest = { [field]: value };

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

    const action = isActive ? 'activate' : 'deactivate';

    Modal.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Tenant`,
      content: `Are you sure you want to ${action} this tenant?`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        setState(prev => ({ ...prev, saving: true }));

        try {
          const response = await fetch(`/api/tenants/${state.tenant!.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: isActive }),
          });

          const result = await response.json();

          if (result.success) {
            setState(prev => ({
              ...prev,
              tenant: result.data,
              saving: false,
            }));
            message.success(`Tenant ${action}d successfully`);
          } else {
            message.error(result.error?.message || `Failed to ${action} tenant`);
            setState(prev => ({ ...prev, saving: false }));
          }
        } catch (error) {
          message.error(`Failed to ${action} tenant`);
          setState(prev => ({ ...prev, saving: false }));
        }
      },
    });
  };

  // Render editable field
  const renderEditableField = (
    field: string,
    label: string,
    value: any,
    type: 'text' | 'textarea' | 'date' | 'email' | 'phone' | 'url' = 'text'
  ) => {
    const isEditing = state.editingField === field;
    const editValue = state.editingValues[field] ?? value;

    if (isEditing) {
      return (
        <div>
          <Text strong>{label}:</Text>
          <div style={{ marginTop: 8 }}>
            {type === 'textarea' ? (
              <TextArea
                value={editValue}
                onChange={(e) =>
                  setState(prev => ({
                    ...prev,
                    editingValues: { ...prev.editingValues, [field]: e.target.value },
                  }))
                }
                rows={3}
                autoFocus
              />
            ) : type === 'date' ? (
              <DatePicker
                value={editValue ? dayjs(editValue) : null}
                onChange={(date) =>
                  setState(prev => ({
                    ...prev,
                    editingValues: {
                      ...prev.editingValues,
                      [field]: date ? date.format('YYYY-MM-DD') : '',
                    },
                  }))
                }
                style={{ width: '100%' }}
                autoFocus
              />
            ) : (
              <Input
                value={editValue}
                onChange={(e) =>
                  setState(prev => ({
                    ...prev,
                    editingValues: { ...prev.editingValues, [field]: e.target.value },
                  }))
                }
                type={type === 'email' ? 'email' : type === 'phone' ? 'tel' : 'text'}
                autoFocus
              />
            )}
            <div style={{ marginTop: 8 }}>
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<SaveOutlined />}
                  loading={state.saving}
                  onClick={() => saveFieldUpdate(field, editValue)}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={cancelEditing}
                >
                  Cancel
                </Button>
              </Space>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <Text strong>{label}:</Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Text>
            {type === 'date' && value ? dayjs(value).format('MMM DD, YYYY') : value || 'Not set'}
          </Text>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => startEditing(field, value)}
          />
        </div>
      </div>
    );
  };

  // Render color picker field
  const renderColorField = (field: string, label: string, value: string) => {
    const isEditing = state.editingField === field;
    const editValue = state.editingValues[field] ?? value;

    if (isEditing) {
      return (
        <div>
          <Text strong>{label}:</Text>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input
                value={editValue}
                onChange={(e) =>
                  setState(prev => ({
                    ...prev,
                    editingValues: { ...prev.editingValues, [field]: e.target.value },
                  }))
                }
                style={{ flex: 1 }}
                placeholder="#000000"
              />
              <input
                type="color"
                value={editValue}
                onChange={(e) =>
                  setState(prev => ({
                    ...prev,
                    editingValues: { ...prev.editingValues, [field]: e.target.value },
                  }))
                }
                style={{ width: 40, height: 32, border: 'none', borderRadius: 4 }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<SaveOutlined />}
                  loading={state.saving}
                  onClick={() => saveFieldUpdate(field, editValue)}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={cancelEditing}
                >
                  Cancel
                </Button>
              </Space>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <Text strong>{label}:</Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: value,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
              }}
            />
            <Text>{value}</Text>
          </div>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => startEditing(field, value)}
          />
        </div>
      </div>
    );
  };

  if (status === 'loading' || state.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!state.tenant) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Text>Tenant not found</Text>
      </div>
    );
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
              href: '/dashboard/tenants',
              title: (
                <span>
                  <TeamOutlined />
                  <span>Tenant Management</span>
                </span>
              ),
            },
            {
              title: `${state.tenant.bride_name} & ${state.tenant.groom_name}`,
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
              onClick={() => router.push('/dashboard/tenants')}
            >
              Back to Tenants
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {state.tenant.bride_name} & {state.tenant.groom_name}
            </Title>
            <Tag color={state.tenant.is_active ? 'green' : 'red'}>
              {state.tenant.is_active ? 'Active' : 'Inactive'}
            </Tag>
          </div>
          <Space>
            <Button
              type={state.tenant.is_active ? 'default' : 'primary'}
              icon={state.tenant.is_active ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => updateTenantStatus(!state.tenant!.is_active)}
              loading={state.saving}
            >
              {state.tenant.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => setState(prev => ({ ...prev, themePreviewVisible: true }))}
            >
              Preview Theme
            </Button>
          </Space>
        </div>
        <Tabs
          defaultActiveKey="overview"
          type="card"
          items={[
            {
              key: 'overview',
              label: 'Overview',
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card title="Basic Information" size="small">
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {renderEditableField('bride_name', 'Bride Name', state.tenant.bride_name)}
                        {renderEditableField('groom_name', 'Groom Name', state.tenant.groom_name)}
                        {renderEditableField('wedding_date', 'Wedding Date', state.tenant.wedding_date, 'date')}
                        <div>
                          <Text strong>Tenant Slug:</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text code>{state.tenant.slug}</Text>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="Contact Information" size="small">
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {renderEditableField('email', 'Email', state.tenant.email, 'email')}
                        {renderEditableField('phone', 'Phone', state.tenant.phone, 'phone')}
                        <div>
                          <Text strong>Created:</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text>{dayjs(state.tenant.created_at).format('MMM DD, YYYY HH:mm')}</Text>
                          </div>
                        </div>
                        <div>
                          <Text strong>Last Updated:</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text>{dayjs(state.tenant.updated_at).format('MMM DD, YYYY HH:mm')}</Text>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Card title="Venue Information" size="small">
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {renderEditableField('venue_name', 'Venue Name', state.tenant.venue_name)}
                        {renderEditableField('venue_address', 'Venue Address', state.tenant.venue_address, 'textarea')}
                        {renderEditableField('venue_map_link', 'Map Link', state.tenant.venue_map_link, 'url')}
                      </Space>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'theme',
              label: 'Theme Configuration',
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card title="Color Settings" size="small">
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {renderColorField('theme_primary_color', 'Primary Color', state.tenant.theme_primary_color)}
                        {renderColorField('theme_secondary_color', 'Secondary Color', state.tenant.theme_secondary_color)}
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="Theme Preview" size="small">
                      <div style={{ padding: 16 }}>
                        <div
                          style={{
                            background: `linear-gradient(135deg, ${state.tenant.theme_primary_color}, ${state.tenant.theme_secondary_color})`,
                            padding: 24,
                            borderRadius: 8,
                            color: '#fff',
                            textAlign: 'center',
                          }}
                        >
                          <Title level={4} style={{ color: '#fff', margin: 0 }}>
                            {state.tenant.bride_name} & {state.tenant.groom_name}
                          </Title>
                          <Text style={{ color: '#fff', opacity: 0.9 }}>
                            {dayjs(state.tenant.wedding_date).format('MMMM DD, YYYY')}
                          </Text>
                        </div>
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                          <Button
                            type="primary"
                            style={{ backgroundColor: state.tenant.theme_primary_color, borderColor: state.tenant.theme_primary_color }}
                          >
                            Primary Button
                          </Button>
                          <Button
                            style={{
                              marginLeft: 8,
                              backgroundColor: state.tenant.theme_secondary_color,
                              borderColor: state.tenant.theme_secondary_color,
                              color: '#000'
                            }}
                          >
                            Secondary Button
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'settings',
              label: 'Status & Settings',
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card title="Tenant Status" size="small">
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div>
                          <Text strong>Current Status:</Text>
                          <div style={{ marginTop: 8 }}>
                            <Tag color={state.tenant.is_active ? 'green' : 'red'} style={{ fontSize: 14, padding: '4px 12px' }}>
                              {state.tenant.is_active ? 'Active' : 'Inactive'}
                            </Tag>
                          </div>
                        </div>

                        <Divider />

                        <div>
                          <Text strong>Status Management:</Text>
                          <div style={{ marginTop: 8 }}>
                            <Space direction="vertical">
                              <Button
                                type={state.tenant.is_active ? 'default' : 'primary'}
                                icon={state.tenant.is_active ? <StopOutlined /> : <CheckCircleOutlined />}
                                onClick={() => updateTenantStatus(!state.tenant!.is_active)}
                                loading={state.saving}
                                block
                              >
                                {state.tenant.is_active ? 'Deactivate Tenant' : 'Activate Tenant'}
                              </Button>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {state.tenant.is_active
                                  ? 'Deactivating will hide this tenant from active lists and prevent new RSVPs'
                                  : 'Activating will make this tenant visible and allow RSVP submissions'
                                }
                              </Text>
                            </Space>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="System Information" size="small">
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div>
                          <Text strong>Tenant ID:</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text code>{state.tenant.id}</Text>
                          </div>
                        </div>
                        <div>
                          <Text strong>Slug:</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text code>{state.tenant.slug}</Text>
                          </div>
                        </div>
                        <div>
                          <Text strong>Created At:</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text>{dayjs(state.tenant.created_at).format('MMMM DD, YYYY [at] HH:mm')}</Text>
                          </div>
                        </div>
                        <div>
                          <Text strong>Last Updated:</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text>{dayjs(state.tenant.updated_at).format('MMMM DD, YYYY [at] HH:mm')}</Text>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </div>

      {/* Theme Preview Modal */}
      <Modal
        title="Theme Preview"
        open={state.themePreviewVisible}
        onCancel={() => setState(prev => ({ ...prev, themePreviewVisible: false }))}
        footer={null}
        width={600}
      >
        <div style={{ padding: 16 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${state.tenant.theme_primary_color}, ${state.tenant.theme_secondary_color})`,
              padding: 40,
              borderRadius: 12,
              color: '#fff',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            <Title level={2} style={{ color: '#fff', margin: 0, marginBottom: 8 }}>
              {state.tenant.bride_name} & {state.tenant.groom_name}
            </Title>
            <Title level={4} style={{ color: '#fff', margin: 0, opacity: 0.9, fontWeight: 'normal' }}>
              {dayjs(state.tenant.wedding_date).format('MMMM DD, YYYY')}
            </Title>
            <div style={{ marginTop: 16 }}>
              <Text style={{ color: '#fff', opacity: 0.8 }}>
                {state.tenant.venue_name}
              </Text>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                style={{
                  backgroundColor: state.tenant.theme_primary_color,
                  borderColor: state.tenant.theme_primary_color,
                  minWidth: 120
                }}
              >
                RSVP Now
              </Button>
              <Button
                size="large"
                style={{
                  backgroundColor: state.tenant.theme_secondary_color,
                  borderColor: state.tenant.theme_secondary_color,
                  color: '#000',
                  minWidth: 120
                }}
              >
                View Details
              </Button>
            </Space>
          </div>
        </div>
      </Modal>
    </div >
  );
}