import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fs from 'fs/promises';
import { extractText } from '../services/document.service';
import { chatCompletion } from '../services/openai.service';
import { ApiError } from '../utils/ApiError';

export const analyzeDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, 'Upload a PDF, DOCX, or TXT file.');

  let text: string;
  try {
    text = await extractText(req.file.path);
  } finally {
    // Clean up the temp upload either way.
    await fs.unlink(req.file.path).catch(() => undefined);
  }

  const trimmed = text.slice(0, 12000); // keep prompt size sane

  const output = await chatCompletion(
    [
      {
        role: 'system',
        content:
          'You analyze uploaded study documents (lecture notes, papers, readings). Return: ' +
          '1) a 3-5 sentence summary, 2) 5-8 key points as a bulleted list, 3) any action items ' +
          '(things to review, practice, or follow up on). Use clear headings for each section.',
      },
      { role: 'user', content: `Document contents:\n\n${trimmed}` },
    ],
    { maxTokens: 900 }
  );

  res.json({
    success: true,
    data: { filename: req.file.originalname, charactersExtracted: text.length, analysis: output },
  });
});
