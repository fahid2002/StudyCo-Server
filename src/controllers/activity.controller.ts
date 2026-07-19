import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Activity } from '../models/Activity';
import { ApiError } from '../utils/ApiError';

export const listActivities = asyncHandler(async (req: Request, res: Response) => {
  const activities = await Activity.find({ user: req.user?.id }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: activities });
});

export const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
  const activity = await Activity.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
  if (!activity) throw new ApiError(404, 'History item not found.');
  res.json({ success: true, data: { id: req.params.id } });
});

export const clearActivities = asyncHandler(async (req: Request, res: Response) => {
  await Activity.deleteMany({ user: req.user?.id });
  res.json({ success: true, data: { cleared: true } });
});
