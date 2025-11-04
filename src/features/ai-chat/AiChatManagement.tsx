'use client';

import { useState } from 'react';
import { Card, Typography, Button, Space, Divider, Select, Flex } from 'antd';
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { useChat } from './useChat';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useGetTenantList } from '@/features/tenants/services/tenant.hooks';
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

  return (
    <Flex vertical style={{ padding: '24px' }}>
      <Flex vertical style={{ marginBottom: '24px' }}>
        <Space align="center" style={{ marginBottom: '16px' }}>
          <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={2} style={{ margin: 0 }}>
            AI Wedding Assistant
          </Title>
        </Space>
      </Flex>

      <Card>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: '16px' }}
        >
          <Flex align="center" gap={12}>
            <Text strong>Focus on:</Text>
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
          </Flex>

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
        </Flex>


        <ChatWindow messages={messages} isLoading={isLoading} />

        <Divider style={{ margin: '16px 0' }} />

        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      </Card>
    </Flex>
  );
}
