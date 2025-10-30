'use client';

import { Row, Col, Card, Space } from 'antd';
import { Tenant } from '@/types/tenant';
import ColorField from './ColorField';
import ThemePreview from './ThemePreview';

interface ThemeTabProps {
  tenant: Tenant;
  editingField: string | null;
  editingValues: Record<string, any>;
  saving: boolean;
  onStartEditing: (field: string, currentValue: any) => void;
  onCancelEditing: () => void;
  onUpdateEditingValue: (field: string, value: any) => void;
  onSaveFieldUpdate: (field: string, value: any) => Promise<void>;
}

export default function ThemeTab({
  tenant,
  editingField,
  editingValues,
  saving,
  onStartEditing,
  onCancelEditing,
  onUpdateEditingValue,
  onSaveFieldUpdate,
}: ThemeTabProps) {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <Card title="Color Settings" size="small">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <ColorField
              field="theme_primary_color"
              label="Primary Color"
              value={tenant.theme_primary_color}
              isEditing={editingField === 'theme_primary_color'}
              editValue={editingValues.theme_primary_color ?? tenant.theme_primary_color}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
            <ColorField
              field="theme_secondary_color"
              label="Secondary Color"
              value={tenant.theme_secondary_color}
              isEditing={editingField === 'theme_secondary_color'}
              editValue={editingValues.theme_secondary_color ?? tenant.theme_secondary_color}
              saving={saving}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onUpdateValue={onUpdateEditingValue}
              onSave={onSaveFieldUpdate}
            />
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Theme Preview" size="small">
          <ThemePreview tenant={tenant} />
        </Card>
      </Col>
    </Row>
  );
}