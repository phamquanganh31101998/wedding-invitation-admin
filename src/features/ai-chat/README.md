# AI Chat Feature

A basic AI chat interface integrated with OpenAI's GPT-3.5-turbo model.

## Setup

1. Add your OpenAI API key to your environment variables:

   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```

2. The feature is automatically available in the navigation menu as "AI Chat"

## Features

- Real-time chat with AI assistant
- Message history within session
- Clear chat functionality
- Loading states and error handling
- Responsive design with Ant Design components

## Usage

Navigate to `/ai-chat` in your authenticated dashboard to start chatting with the AI assistant.

## Architecture

- **Components**: Reusable chat UI components
- **Services**: Chat hooks and API integration
- **API Route**: `/api/chat` handles OpenAI integration
- **Types**: TypeScript interfaces for type safety
