import { Avatar, Tag } from 'antd';
import { UserOutlined, RobotOutlined, FunctionOutlined } from '@ant-design/icons';
import { ChatMessage as ChatMessageType } from '../services/chat.types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        marginBottom: 16,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <Avatar
        size="small"
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{
          backgroundColor: isUser ? '#1890ff' : '#52c41a',
          flexShrink: 0,
        }}
      />
      <div
        style={{
          maxWidth: '70%',
          padding: '8px 12px',
          borderRadius: 8,
          backgroundColor: isUser ? '#1890ff' : '#f6f6f6',
          color: isUser ? 'white' : 'black',
        }}
      >
        <div style={{ color: isUser ? 'white' : 'inherit', whiteSpace: 'pre-wrap' }}>
          {message.content}
        </div>

        {/* Show function call indicator for assistant messages */}
        {!isUser && message.functionCalled && (
          <div style={{ marginTop: '8px' }}>
            <Tag
              icon={<FunctionOutlined />}
              color="blue"
            >
              Executed: {message.functionCalled}
            </Tag>
          </div>
        )}

        <div
          style={{
            fontSize: '11px',
            opacity: 0.7,
            marginTop: 4,
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
