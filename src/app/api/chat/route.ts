import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { AIPromptService } from '@/features/ai-chat/agents/ai-prompt.service';
import { agentFunctions } from '@/features/ai-chat/agents/agent-functions';

// AI Model configuration
const AI_MODEL = 'gpt-3.5-turbo';

// Prepare function definitions for OpenAI (using new tools format)
const tools = agentFunctions.map((func) => ({
  type: 'function' as const,
  function: {
    name: func.name,
    description: func.description,
    parameters: func.parameters,
  },
}));

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { messages, tenantId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate enhanced system prompt with wedding context
    const aiPromptService = new AIPromptService();
    const systemPrompt = await aiPromptService.generateSystemPrompt(tenantId);

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      tools: tools,
      tool_choice: 'auto', // Let AI decide when to call functions
    });

    const assistantMessage = completion.choices[0]?.message;

    // Check if AI wants to call a tool/function
    if (
      assistantMessage?.tool_calls &&
      assistantMessage.tool_calls.length > 0
    ) {
      const toolCall = assistantMessage.tool_calls[0];

      // Ensure it's a function tool call
      if (toolCall.type !== 'function') {
        throw new Error('Unsupported tool call type');
      }

      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments || '{}');

      try {
        // Find and execute the function
        const agentFunction = agentFunctions.find(
          (f) => f.name === functionName
        );
        if (!agentFunction) {
          throw new Error(`Function ${functionName} not found`);
        }

        console.log(`Executing function: ${functionName}`, functionArgs);
        const functionResult = await agentFunction.handler(functionArgs);

        // Send function result back to AI for final response
        const followUpCompletion = await openai.chat.completions.create({
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...messages,
            {
              role: 'assistant',
              content: assistantMessage.content,
              tool_calls: assistantMessage.tool_calls,
            },
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(functionResult),
            },
          ],
        });

        const finalMessage = followUpCompletion.choices[0]?.message?.content;

        if (!finalMessage) {
          return NextResponse.json(
            { error: 'No response from AI after function call' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: finalMessage,
          functionCalled: functionName,
          functionResult: functionResult,
        });
      } catch (functionError) {
        console.error(`Function ${functionName} error:`, functionError);

        // Send error back to AI to handle gracefully
        const errorCompletion = await openai.chat.completions.create({
          model: AI_MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...messages,
            {
              role: 'assistant',
              content: assistantMessage.content,
              tool_calls: assistantMessage.tool_calls,
            },
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error:
                  functionError instanceof Error
                    ? functionError.message
                    : 'Function execution failed',
              }),
            },
          ],
        });

        const errorMessage =
          errorCompletion.choices[0]?.message?.content ||
          'Sorry, I encountered an error while performing that action.';

        return NextResponse.json({
          message: errorMessage,
          functionCalled: functionName,
          functionError: true,
        });
      }
    }

    // No function call - return regular response
    if (!assistantMessage?.content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: assistantMessage.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
