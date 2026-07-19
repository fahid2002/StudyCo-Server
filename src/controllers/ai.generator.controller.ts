import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { GeneratedContent } from '../models/GeneratedContent';
import { chatCompletion } from '../services/openai.service';
import { ApiError } from '../utils/ApiError';

const lengthTokens: Record<string, number> = { Short: 220, Medium: 450, Long: 800 };

export const generateContent = asyncHandler(async (req: Request, res: Response) => {
  const { type, topic, length } = req.body as {
    type: 'Study notes' | 'Summary' | 'Flashcards' | 'Practice quiz';
    topic: string;
    length: 'Short' | 'Medium' | 'Long';
  };

  if (!type || !topic || !length) throw new ApiError(400, 'type, topic, and length are required.');

  const prompt = `Create ${length.toLowerCase()}-length "${type}" content for a student studying: "${topic}".
Format it clearly with headings or numbering where appropriate. Do not pad with filler —
every line should help someone actually study this topic.`;

  const output = await chatCompletion(
    [
      { role: 'system', content: 'You are an expert tutor who writes clear, exam-focused study material.' },
      { role: 'user', content: prompt },
    ],
    { maxTokens: lengthTokens[length] ?? 450 }
  );

  const saved = await GeneratedContent.create({ user: req.user?.id, type, topic, length, output });
  res.status(201).json({ success: true, data: saved });
});

export const listGeneratedContent = asyncHandler(async (req: Request, res: Response) => {
  const items = await GeneratedContent.find({ user: req.user?.id }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: items });
});
