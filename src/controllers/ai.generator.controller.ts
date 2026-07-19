import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { GeneratedContent } from '../models/GeneratedContent';
import { chatCompletion } from '../services/ai.service';
import { ApiError } from '../utils/ApiError';
import { recordActivity } from '../services/activity.service';

const lengthTokens: Record<string, number> = { Short: 700, Medium: 1400, Long: 2400 };

export const generateContent = asyncHandler(async (req: Request, res: Response) => {
  const { type, topic, length } = req.body as {
    type: 'Study notes' | 'Summary' | 'Flashcards' | 'Practice quiz';
    topic: string;
    length: 'Short' | 'Medium' | 'Long';
  };

  if (!type || !topic || !length) throw new ApiError(400, 'type, topic, and length are required.');

  const prompt = `Create complete ${length.toLowerCase()}-length "${type}" content for a student studying: "${topic}".
Write it like polished class notes a student can directly revise from.
Use clear section headings, short paragraphs, numbered steps, and bullet points where helpful.
Do not use Markdown markers such as #, ##, **, or backticks.
Do not use LaTeX syntax such as $...$, \\frac, \\times, or \\text.
For formulas, write readable book-style formulas using Unicode symbols, for example:
lambda = h / p
E = h nu
Delta x Delta p >= h-bar / 2
Use simple explanatory text below each formula.
Finish the note with a short "Quick Revision Checklist" section.`;

  const output = await chatCompletion(
    [
      { role: 'system', content: 'You are an expert tutor who writes clear, exam-focused study material.' },
      { role: 'user', content: prompt },
    ],
    { maxTokens: lengthTokens[length] ?? lengthTokens.Medium }
  );

  const saved = await GeneratedContent.create({ user: req.user?.id, type, topic, length, output });
  await recordActivity({
    userId: req.user?.id,
    type: 'ai',
    title: 'Generated study content',
    detail: `${type}: ${topic}`,
    metadata: { generatedContentId: saved._id, length, content: output },
  });
  res.status(201).json({ success: true, data: saved });
});

export const listGeneratedContent = asyncHandler(async (req: Request, res: Response) => {
  const items = await GeneratedContent.find({ user: req.user?.id }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: items });
});
