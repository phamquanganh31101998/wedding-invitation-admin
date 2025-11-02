'use client';

import { Card, Typography, Button, Space, Divider } from 'antd';
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { useChat } from './useChat';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const { Title, Text } = Typography;

export default function AiChatManagement() {
  const { messages, isLoading, sendMessage, clearChat } = useChat();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Space align="center" style={{ marginBottom: '16px' }}>
          <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={2} style={{ margin: 0 }}>
            AI Chat Assistant
          </Title>
        </Space>
        <Text type="secondary">
          Chat with our AI assistant for help with wedding planning, general
          questions, or just friendly conversation.
        </Text>
      </div>

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

        <ChatWindow messages={messages} isLoading={isLoading} />

        <Divider style={{ margin: '16px 0' }} />

        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      </Card>
    </div>
  );
}
