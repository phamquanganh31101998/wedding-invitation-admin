'use client';

import { useEffect, useRef } from 'react';
import { Card, Empty, Spin, Flex } from 'antd';
import ChatMessage from './ChatMessage';
import { ChatMessage as ChatMessageType } from '../services/chat.types';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card
      style={{
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
      }}
    >
      {messages.length === 0 ? (
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ height: '100%' }}
        >
          <Empty description="Start a conversation with the AI assistant" />
        </Flex>
      ) : (
        <div>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <Flex justify="center" align="center" style={{ padding: '16px' }}>
              <Spin size="small" />
              <span style={{ marginLeft: 8 }}>AI is thinking...</span>
            </Flex>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </Card>
  );
}
