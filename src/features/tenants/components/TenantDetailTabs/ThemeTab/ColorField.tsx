'use client';

import { Typography, Button, Input, Space } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ColorFieldProps {
  field: string;
  label: string;
  value: string;
  isEditing: boolean;
  editValue: string;
  saving: boolean;
  onStartEditing: (field: string, currentValue: any) => void;
  onCancelEditing: () => void;
  onUpdateValue: (field: string, value: any) => void;
  onSave: (field: string, value: any) => Promise<void>;
}

export default function ColorField({
  field,
  label,
  value,
  isEditing,
  editValue,
  saving,
  onStartEditing,
  onCancelEditing,
  onUpdateValue,
  onSave,
}: ColorFieldProps) {
  if (isEditing) {
    return (
      <div>
        <Text strong>{label}:</Text>
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              value={editValue}
              onChange={(e) => onUpdateValue(field, e.target.value)}
              style={{ flex: 1 }}
              placeholder="#000000"
            />
            <input
              type="color"
              value={editValue}
              onChange={(e) => onUpdateValue(field, e.target.value)}
              style={{ width: 40, height: 32, border: 'none', borderRadius: 4 }}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={() => onSave(field, editValue)}
              >
                Save
              </Button>
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={onCancelEditing}
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4,
        }}
      >
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
          onClick={() => onStartEditing(field, value)}
        />
      </div>
    </div>
  );
}
