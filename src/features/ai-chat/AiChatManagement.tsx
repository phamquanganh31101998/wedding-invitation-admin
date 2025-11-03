'use client';

import { useState } from 'react';
import { Card, Typography, Button, Space, Divider, Select, Alert } from 'antd';
import { DeleteOutlined, MessageOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useChat } from './useChat';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
// import WeddingContextDemo from './components/WeddingContextDemo';
import FunctionCallIndicator from './components/FunctionCallIndicator';
import { useGetTenantList } from '@/features/tenants/services/tenant.hooks';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AiChatManagement() {
  const [selectedTenantId, setSelectedTenantId] = useState<number | undefined>();

  const { messages, isLoading, sendMessage, clearChat } = useChat(selectedTenantId);

  // Use tenant hooks to get tenant list
  const { tenantList: tenants, isLoading: loadingTenants } = useGetTenantList({
    limit: 50,
  });

  const handleTenantChange = (tenantId: number | undefined) => {
    setSelectedTenantId(tenantId);
    clearChat(); // Clear chat when switching context
  };

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Space align="center" style={{ marginBottom: '16px' }}>
          <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={2} style={{ margin: 0 }}>
            AI Wedding Assistant
          </Title>
        </Space>
      </div>

      {/* Wedding Context Selector */}
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Text strong>Wedding Context:</Text>
            <Select
              style={{ minWidth: '300px' }}
              placeholder="Select a wedding for focused assistance"
              allowClear
              loading={loadingTenants}
              value={selectedTenantId}
              onChange={handleTenantChange}
            >
              {tenants.map(tenant => (
                <Option key={tenant.id} value={tenant.id}>
                  {tenant.brideName} & {tenant.groomName} - {tenant.venueName}
                </Option>
              ))}
            </Select>
          </div>

          {selectedTenant && (
            <Alert
              message={`Focused on: ${selectedTenant.brideName} & ${selectedTenant.groomName}`}
              type="info"
              icon={<InfoCircleOutlined />}
              showIcon
            />
          )}

          {!selectedTenantId && (
            <Alert
              message="General Wedding System Mode"
              type="success"
              showIcon
            />
          )}
        </Space>
      </Card>

      <Card>
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Chat Session
          </Title>
          {messages.length > 0 && (
            <Button
              icon={<DeleteOutlined />}
              onClick={clearChat}
              type="text"
              danger
            >
              Clear Chat
            </Button>
          )}
        </div>

        <FunctionCallIndicator
          isLoading={isLoading}
          functionName={messages[messages.length - 1]?.functionCalled}
        />

        <ChatWindow messages={messages} isLoading={isLoading} />

        <Divider style={{ margin: '16px 0' }} />

        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      </Card>
    </div>
  );
}
