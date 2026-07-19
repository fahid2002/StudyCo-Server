import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getRecommendations, recordFeedback } from '../services/recommendation.service';
import { ApiError } from '../utils/ApiError';

export const getMyRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const results = await getRecommendations(String(req.user?.id));
  res.json({ success: true, data: results });
});

export const postFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, vote } = req.body as { sessionId: string; vote: 'up' | 'down' };
  if (!sessionId || !['up', 'down'].includes(vote)) {
    throw new ApiError(400, 'sessionId and a valid vote (up/down) are required.');
  }
  await recordFeedback(String(req.user?.id), sessionId, vote);
  const results = await getRecommendations(String(req.user?.id));
  res.json({ success: true, data: results });
});
