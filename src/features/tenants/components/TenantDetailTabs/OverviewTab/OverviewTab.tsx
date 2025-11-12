'use client';

import { Row, Col, Card, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { TenantUI } from '@/types/tenant';
import EditableField from './EditableField';

const { Text } = Typography;

interface OverviewTabProps {
  tenant: TenantUI;
  editingField: string | null;
  editingValues: Record<string, any>;
  saving: boolean;
  onStartEditing: (field: string, currentValue: any) => void;
  onCancelEditing: () => void;
  onUpdateEditingValue: (field: string, value: any) => void;
  onSaveFieldUpdate: (field: string, value: any) => Promise<void>;
}

export default function OverviewTab({
  tenant,
  editingField,
  editingValues,
  saving,
  onStartEditing,
  onCancelEditing,
  onUpdateEditingValue,
  onSaveFieldUpdate,
}: OverviewTabProps) {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <Card title="Basic Information" size="small">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <EditableField
              field="brideName"
              label="Bride Name"
              value={tenant.brideName}
              type="text"
              isEditing={editingField === 'brideName'}
              editValue={editingValues.brideName ?? tenant.brideName}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <EditableField
              field="groomName"
              label="Groom Name"
              value={tenant.groomName}
              type="text"
              isEditing={editingField === 'groomName'}
              editValue={editingValues.groomName ?? tenant.groomName}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <EditableField
              field="weddingDate"
              label="Wedding Date"
              value={tenant.weddingDate}
              type="date"
              isEditing={editingField === 'weddingDate'}
              editValue={editingValues.weddingDate ?? tenant.weddingDate}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <div>
              <Text strong>Tenant Slug:</Text>
              <div style={{ marginTop: 4 }}>
                <Text code>{tenant.slug}</Text>
              </div>
            </div>
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Contact Information" size="small">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <EditableField
              field="email"
              label="Email"
              value={tenant.email}
              type="email"
              isEditing={editingField === 'email'}
              editValue={editingValues.email ?? tenant.email}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <EditableField
              field="phone"
              label="Phone"
              value={tenant.phone}
              type="phone"
              isEditing={editingField === 'phone'}
              editValue={editingValues.phone ?? tenant.phone}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <div>
              <Text strong>Created:</Text>
              <div style={{ marginTop: 4 }}>
                <Text>
                  {dayjs(tenant.createdAt).format('MMM DD, YYYY HH:mm')}
                </Text>
              </div>
            </div>
            <div>
              <Text strong>Last Updated:</Text>
              <div style={{ marginTop: 4 }}>
                <Text>
                  {dayjs(tenant.updatedAt).format('MMM DD, YYYY HH:mm')}
                </Text>
              </div>
            </div>
          </Space>
        </Card>
      </Col>

      <Col xs={24}>
        <Card title="Venue Information" size="small">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <EditableField
              field="venueName"
              label="Venue Name"
              value={tenant.venueName}
              type="text"
              isEditing={editingField === 'venueName'}
              editValue={editingValues.venueName ?? tenant.venueName}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <EditableField
              field="venueAddress"
              label="Venue Address"
              value={tenant.venueAddress}
              type="textarea"
              isEditing={editingField === 'venueAddress'}
              editValue={editingValues.venueAddress ?? tenant.venueAddress}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <EditableField
              field="venueMapLink"
              label="Map Link"
              value={tenant.venueMapLink}
              type="url"
              isEditing={editingField === 'venueMapLink'}
              editValue={editingValues.venueMapLink ?? tenant.venueMapLink}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
