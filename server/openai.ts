import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_OPENAI_API_KEY') {
    throw new Error('OPENAI_API_KEY_MISSING');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey.trim(),
    });
  }

  return openaiClient;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateChatResponse(
  systemPrompt: string,
  messages: ChatMessage[],
  customModel?: string
): Promise<string> {
  const client = getOpenAIClient();
  const model = customModel || process.env.OPENAI_MODEL || 'gpt-4o';

  // Check if model is a reasoning model (o1, o3, etc.) which doesn't support custom temperature
  const isReasoningModel = /^o[1-9]/i.test(model);

  // Build the message list starting with system prompt
  const fullMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
  ];

  try {
    const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages: fullMessages,
    };

    // Only set temperature if not a reasoning model
    if (!isReasoningModel) {
      const customTemp = process.env.OPENAI_TEMPERATURE;
      if (customTemp !== undefined && customTemp !== '') {
        const parsed = parseFloat(customTemp);
        if (!isNaN(parsed)) {
          params.temperature = parsed;
        }
      }
    }

    const response = await client.chat.completions.create(params);
    const reply = response.choices[0]?.message?.content;
    if (!reply) {
      throw new Error('EMPTY_RESPONSE_FROM_AI');
    }
    return reply;
  } catch (error: any) {
    // If the model rejected temperature, retry without temperature
    if (
      error?.status === 400 &&
      typeof error?.message === 'string' &&
      error.message.includes('temperature')
    ) {
      console.warn(`[OpenAI] Model ${model} does not support custom temperature. Retrying without temperature parameter.`);
      const response = await client.chat.completions.create({
        model,
        messages: fullMessages,
      });
      const reply = response.choices[0]?.message?.content;
      if (!reply) {
        throw new Error('EMPTY_RESPONSE_FROM_AI');
      }
      return reply;
    }
    throw error;
  }
}
