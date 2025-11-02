'use client';

import { useEffect, useRef } from 'react';
import { Card, Empty, Spin } from 'antd';
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
        <Empty
          description="Start a conversation with the AI assistant"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        />
      ) : (
        <div>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <Spin size="small" />
              <span style={{ marginLeft: 8 }}>AI is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </Card>
  );
}
