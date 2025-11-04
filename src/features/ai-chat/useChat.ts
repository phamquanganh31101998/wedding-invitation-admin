'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from './services/chat.types';
import { useSendMessage } from './services/chat.hooks';

export const useChat = (tenantId?: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { sendMessage: sendMessageAPI, isSending } = useSendMessage();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSending) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const data = await sendMessageAPI({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          tenantId, // Pass the selected tenant ID for context
        });

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          functionCalled: data.functionCalled,
          functionResult: data.functionResult,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    },
    [messages, sendMessageAPI, isSending, tenantId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Clear messages when tenant context changes
  useEffect(() => {
    setMessages([]);
  }, [tenantId]);

  return {
    messages,
    isLoading: isSending,
    sendMessage,
    clearChat,
  };
};
