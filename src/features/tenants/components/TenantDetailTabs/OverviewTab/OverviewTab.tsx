'use client';

import { Row, Col, Card, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { Tenant } from '@/types/tenant';
import EditableField from './EditableField';

const { Text } = Typography;

interface OverviewTabProps {
  tenant: Tenant;
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
              field="bride_name"
              label="Bride Name"
              value={tenant.bride_name}
              type="text"
              isEditing={editingField === 'bride_name'}
              editValue={editingValues.bride_name ?? tenant.bride_name}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <EditableField
              field="groom_name"
              label="Groom Name"
              value={tenant.groom_name}
              type="text"
              isEditing={editingField === 'groom_name'}
              editValue={editingValues.groom_name ?? tenant.groom_name}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <EditableField
              field="wedding_date"
              label="Wedding Date"
              value={tenant.wedding_date}
              type="date"
              isEditing={editingField === 'wedding_date'}
              editValue={editingValues.wedding_date ?? tenant.wedding_date}
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
                <Text>{dayjs(tenant.created_at).format('MMM DD, YYYY HH:mm')}</Text>
              </div>
            </div>
            <div>
              <Text strong>Last Updated:</Text>
              <div style={{ marginTop: 4 }}>
                <Text>{dayjs(tenant.updated_at).format('MMM DD, YYYY HH:mm')}</Text>
              </div>
            </div>
          </Space>
        </Card>
      </Col>

      <Col xs={24}>
        <Card title="Venue Information" size="small">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <EditableField
              field="venue_name"
              label="Venue Name"
              value={tenant.venue_name}
              type="text"
              isEditing={editingField === 'venue_name'}
              editValue={editingValues.venue_name ?? tenant.venue_name}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <EditableField
              field="venue_address"
              label="Venue Address"
              value={tenant.venue_address}
              type="textarea"
              isEditing={editingField === 'venue_address'}
              editValue={editingValues.venue_address ?? tenant.venue_address}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <EditableField
              field="venue_map_link"
              label="Map Link"
              value={tenant.venue_map_link}
              type="url"
              isEditing={editingField === 'venue_map_link'}
              editValue={editingValues.venue_map_link ?? tenant.venue_map_link}
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