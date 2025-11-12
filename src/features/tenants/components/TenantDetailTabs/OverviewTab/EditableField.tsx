'use client';

import { Typography, Button, Input, DatePicker, Space } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

interface EditableFieldProps {
  field: string;
  label: string;
  value: any;
  type?: 'text' | 'textarea' | 'date' | 'email' | 'phone' | 'url';
  isEditing: boolean;
  editValue: any;
  saving: boolean;
  onStartEditing: (field: string, currentValue: any) => void;
  onCancelEditing: () => void;
  onUpdateValue: (field: string, value: any) => void;
  onSave: (field: string, value: any) => Promise<void>;
}

export default function EditableField({
  field,
  label,
  value,
  type = 'text',
  isEditing,
  editValue,
  saving,
  onStartEditing,
  onCancelEditing,
  onUpdateValue,
  onSave,
}: EditableFieldProps) {
  if (isEditing) {
    return (
      <div>
        <Text strong>{label}:</Text>
        <div style={{ marginTop: 8 }}>
          {type === 'textarea' ? (
            <TextArea
              value={editValue}
              onChange={(e) => onUpdateValue(field, e.target.value)}
              rows={3}
              autoFocus
            />
          ) : type === 'date' ? (
            <DatePicker
              value={editValue ? dayjs(editValue) : null}
              onChange={(date) =>
                onUpdateValue(field, date ? date.format('YYYY-MM-DD') : '')
              }
              style={{ width: '100%' }}
              autoFocus
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => onUpdateValue(field, e.target.value)}
              type={
                type === 'email' ? 'email' : type === 'phone' ? 'tel' : 'text'
              }
              autoFocus
            />
          )}
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
        <Text>
          {type === 'date' && value
            ? dayjs(value).format('MMM DD, YYYY')
            : value || 'Not set'}
        </Text>
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
