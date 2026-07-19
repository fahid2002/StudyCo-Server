import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fs from 'fs/promises';
import { extractText } from '../services/document.service';
import { chatCompletion } from '../services/ai.service';
import { ApiError } from '../utils/ApiError';
import { recordActivity } from '../services/activity.service';

export const analyzeDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, 'Upload a PDF, DOCX, or TXT file.');

  let text: string;
  try {
    text = await extractText(req.file.path);
  } finally {
    await fs.unlink(req.file.path).catch(() => undefined);
  }

  const trimmed = text.slice(0, 12000);

  const output = await chatCompletion(
    [
      {
        role: 'system',
        content:
          'You analyze uploaded study documents for students. Return: ' +
          '1) a 3-5 sentence summary, 2) 5-8 key points as bullets, and 3) action items. ' +
          'Use clear section headings. Do not use Markdown markers such as #, ##, **, or backticks. ' +
          'Write formulas in readable book-style notation, not LaTeX.',
      },
      { role: 'user', content: `Document contents:\n\n${trimmed}` },
    ],
    { maxTokens: 1600 }
  );

  await recordActivity({
    userId: req.user?.id,
    type: 'ai',
    title: 'Analyzed a document',
    detail: req.file.originalname,
    metadata: { charactersExtracted: text.length, content: output },
  });

  res.json({
    success: true,
    data: { filename: req.file.originalname, charactersExtracted: text.length, analysis: output },
  });
});
