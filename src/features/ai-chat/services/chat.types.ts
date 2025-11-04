export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCalled?: string;
  functionResult?: any;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageParams {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  tenantId?: number;
}

export interface SendMessageResponse {
  message: string;
  functionCalled?: string;
  functionResult?: any;
  functionError?: boolean;
}
