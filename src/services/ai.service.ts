import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

type ChatRole = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
}

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getGeminiApiKey() {
  if (!env.geminiApiKey) {
    throw new ApiError(500, 'GEMINI_API_KEY is not configured on the server.');
  }
  return env.geminiApiKey;
}

function buildGeminiPayload(messages: ChatMessage[], opts: { temperature?: number; maxTokens?: number }) {
  const systemText = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n');

  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

  return {
    contents,
    ...(systemText ? { systemInstruction: { parts: [{ text: systemText }] } } : {}),
    generationConfig: {
      temperature: opts.temperature ?? 0.6,
      maxOutputTokens: Math.max(opts.maxTokens ?? 700, 256),
      thinkingConfig: {
        thinkingLevel: 'MINIMAL',
      },
    },
  };
}

function extractText(payload: GeminiResponse) {
  return payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim() ?? '';
}

export async function chatCompletion(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const response = await fetch(`${GEMINI_API_BASE}/${env.geminiModel}:generateContent?key=${getGeminiApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildGeminiPayload(messages, opts)),
  });

  const data = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new ApiError(response.status, data.error?.message || 'Gemini could not generate a response.');
  }

  const text = extractText(data);
  if (!text) throw new ApiError(502, 'Gemini returned an empty response.');
  return text;
}

export async function* streamChatCompletion(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): AsyncGenerator<string> {
  const response = await fetch(`${GEMINI_API_BASE}/${env.geminiModel}:streamGenerateContent?alt=sse&key=${getGeminiApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildGeminiPayload(messages, opts)),
  });

  if (!response.ok || !response.body) {
    const data = (await response.json().catch(() => null)) as GeminiResponse | null;
    throw new ApiError(response.status, data?.error?.message || 'Gemini could not stream a response.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    buffer = buffer.replace(/\r\n/g, '\n');
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const dataLine = event.split('\n').find((line) => line.startsWith('data: '));
      if (!dataLine) continue;

      const payload = JSON.parse(dataLine.replace('data: ', '')) as GeminiResponse;
      const token = extractText(payload);
      if (token) yield token;
    }
  }
}
