import OpenAI from 'openai';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!env.openaiApiKey) {
    throw new ApiError(500, 'OPENAI_API_KEY is not configured on the server.');
  }
  if (!client) client = new OpenAI({ apiKey: env.openaiApiKey });
  return client;
}

export async function chatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: env.openaiModel,
    messages,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 700,
  });
  return completion.choices[0]?.message?.content?.trim() ?? '';
}
