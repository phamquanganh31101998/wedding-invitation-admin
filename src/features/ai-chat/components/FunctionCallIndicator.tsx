'use client';

import { Alert, Typography, Space } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface FunctionCallIndicatorProps {
  isLoading: boolean;
  functionName?: string;
  error?: boolean;
}

export default function FunctionCallIndicator({
  isLoading,
  functionName,
  error
}: FunctionCallIndicatorProps) {
  if (!isLoading && !functionName) return null;

  if (isLoading) {
    return (
      <Alert
        message={
          <Space>
            <LoadingOutlined spin />
            <Text>AI is performing an action...</Text>
          </Space>
        }
        type="info"
        showIcon={false}
        style={{ marginBottom: '16px' }}
      />
    );
  }

  if (error) {
    return (
      <Alert
        message={
          <Space>
            <ExclamationCircleOutlined />
            <Text>Action failed: {functionName}</Text>
          </Space>
        }
        type="error"
        showIcon={false}
        style={{ marginBottom: '16px' }}
      />
    );
  }

  return (
    <Alert
      message={
        <Space>
          <CheckCircleOutlined />
          <Text>Action completed: {functionName}</Text>
        </Space>
      }
      type="success"
      showIcon={false}
      style={{ marginBottom: '16px' }}
    />
  );
}