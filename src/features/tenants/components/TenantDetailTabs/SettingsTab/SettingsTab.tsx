'use client';

import { Row, Col, Card, Space, Typography, Tag, Divider, Button } from 'antd';
import { CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { TenantUI } from '@/types/tenant';

const { Text } = Typography;

interface SettingsTabProps {
  tenant: TenantUI;
  saving: boolean;
  onUpdateTenantStatus: (isActive: boolean) => Promise<void>;
}

export default function SettingsTab({
  tenant,
  saving,
  onUpdateTenantStatus,
}: SettingsTabProps) {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <Card title="Tenant Status" size="small">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Current Status:</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={tenant.isActive ? 'green' : 'red'} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {tenant.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>Status Management:</Text>
              <div style={{ marginTop: 8 }}>
                <Space direction="vertical">
                  <Button
                    type={tenant.isActive ? 'default' : 'primary'}
                    icon={tenant.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                    onClick={() => onUpdateTenantStatus(!tenant.isActive)}
                    loading={saving}
                    block
                  >
                    {tenant.isActive ? 'Deactivate Tenant' : 'Activate Tenant'}
                  </Button>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {tenant.isActive
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
                <Text code>{tenant.id}</Text>
              </div>
            </div>
            <div>
              <Text strong>Slug:</Text>
              <div style={{ marginTop: 4 }}>
                <Text code>{tenant.slug}</Text>
              </div>
            </div>
            <div>
              <Text strong>Created At:</Text>
              <div style={{ marginTop: 4 }}>
                <Text>{dayjs(tenant.createdAt).format('MMMM DD, YYYY [at] HH:mm')}</Text>
              </div>
            </div>
            <div>
              <Text strong>Last Updated:</Text>
              <div style={{ marginTop: 4 }}>
                <Text>{dayjs(tenant.updatedAt).format('MMMM DD, YYYY [at] HH:mm')}</Text>
              </div>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}