import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { sendChatMessage } from './chat.requests';
import { SendMessageParams } from './chat.types';

// Hook for sending chat messages
export const useSendMessage = () => {
  const { mutateAsync: sendMessage, isPending } = useMutation({
    mutationFn: (params: SendMessageParams) => sendChatMessage(params),
    onError: (error: Error) => {
      console.error('Error sending message:', error);
      message.error(error.message || 'Failed to send message');
    },
  });

  return {
    sendMessage,
    isSending: isPending,
  };
};
