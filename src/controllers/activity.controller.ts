import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Activity } from '../models/Activity';
import { Booking } from '../models/Booking';
import { ApiError } from '../utils/ApiError';
import { recordActivity } from '../services/activity.service';

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

export const activityStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const [totalBookings, generatedContent, analyzedDocuments, downloads] = await Promise.all([
    Booking.countDocuments({
      user: userId,
      $or: [{ status: 'reserved' }, { status: { $exists: false } }],
    }),
    Activity.countDocuments({ user: userId, type: 'ai', title: 'Generated study content' }),
    Activity.countDocuments({ user: userId, type: 'ai', title: 'Analyzed a document' }),
    Activity.countDocuments({ user: userId, type: 'ai', title: 'Downloaded AI document' }),
  ]);

  res.json({
    success: true,
    data: { totalBookings, generatedContent, analyzedDocuments, downloads },
  });
});

export const recordAiDownload = asyncHandler(async (req: Request, res: Response) => {
  const filename = typeof req.body.filename === 'string' ? req.body.filename.trim() : '';
  const tool = typeof req.body.tool === 'string' ? req.body.tool.trim() : 'AI tool';
  if (!filename) throw new ApiError(400, 'A downloaded filename is required.');

  await recordActivity({
    userId: req.user?.id,
    type: 'ai',
    title: 'Downloaded AI document',
    detail: filename,
    metadata: { tool, filename },
  });

  res.status(201).json({ success: true, data: { recorded: true } });
});
