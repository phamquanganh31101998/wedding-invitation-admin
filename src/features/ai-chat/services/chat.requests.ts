import {
  ChatMessage,
  SendMessageParams,
  SendMessageResponse,
} from './chat.types';

export const sendChatMessage = async (
  params: SendMessageParams
): Promise<SendMessageResponse> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
};
