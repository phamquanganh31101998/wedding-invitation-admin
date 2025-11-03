import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { AIPromptService } from '@/features/ai-chat/agents/ai-prompt.service';
import { agentFunctions } from '@/features/ai-chat/agents/agent-functions';

// Prepare function definitions for OpenAI
const functions = agentFunctions.map((func) => ({
  name: func.name,
  description: func.description,
  parameters: func.parameters,
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
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      functions: functions,
      function_call: 'auto', // Let AI decide when to call functions
    });

    const assistantMessage = completion.choices[0]?.message;

    // Check if AI wants to call a function
    if (assistantMessage?.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(
        assistantMessage.function_call.arguments || '{}'
      );

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
          model: 'gpt-5-nano',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...messages,
            {
              role: 'assistant',
              content: null,
              function_call: assistantMessage.function_call,
            },
            {
              role: 'function',
              name: functionName,
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
          model: 'gpt-5-nano',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...messages,
            {
              role: 'assistant',
              content: null,
              function_call: assistantMessage.function_call,
            },
            {
              role: 'function',
              name: functionName,
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
