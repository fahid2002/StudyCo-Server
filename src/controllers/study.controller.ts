import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { SavedNote } from '../models/SavedNote';
import { Bookmark } from '../models/Bookmark';
import { TimetableItem } from '../models/TimetableItem';
import { QuizScore } from '../models/QuizScore';
import { StudySession } from '../models/Session';
import { ApiError } from '../utils/ApiError';
import { recordActivity } from '../services/activity.service';

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const { search = '', folder = '' } = req.query as Record<string, string>;
  const query: Record<string, unknown> = { user: req.user?.id };
  if (folder) query.folder = folder;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { folder: { $regex: search, $options: 'i' } },
    ];
  }
  const notes = await SavedNote.find(query).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: notes });
});

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const { title, folder = 'General', content, source } = req.body as Record<string, string>;
  if (!title || !content) throw new ApiError(400, 'Title and content are required.');
  const note = await SavedNote.create({ user: req.user?.id, title, folder, content, source });
  await recordActivity({ userId: req.user?.id, type: 'ai', title: 'Saved a note', detail: title, metadata: { noteId: note._id, content } });
  res.status(201).json({ success: true, data: note });
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await SavedNote.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
  if (!note) throw new ApiError(404, 'Saved note not found.');
  res.json({ success: true, data: { id: req.params.id } });
});

export const listBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const items = await Bookmark.find({ user: req.user?.id }).sort({ createdAt: -1 }).populate('session');
  res.json({ success: true, data: items });
});

export const toggleBookmark = asyncHandler(async (req: Request, res: Response) => {
  const session = await StudySession.findById(req.params.sessionId);
  if (!session) throw new ApiError(404, 'Session not found.');
  const existing = await Bookmark.findOne({ user: req.user?.id, session: session._id });
  if (existing) {
    await existing.deleteOne();
    res.json({ success: true, data: { bookmarked: false } });
    return;
  }
  await Bookmark.create({ user: req.user?.id, session: session._id });
  await recordActivity({ userId: req.user?.id, type: 'session', title: 'Bookmarked a session', detail: session.title, metadata: { sessionId: session._id } });
  res.status(201).json({ success: true, data: { bookmarked: true } });
});

export const listTimetable = asyncHandler(async (req: Request, res: Response) => {
  const items = await TimetableItem.find({ user: req.user?.id }).sort({ startAt: 1 });
  res.json({ success: true, data: items });
});

export const createTimetableItem = asyncHandler(async (req: Request, res: Response) => {
  const { title, subject, startAt, notes } = req.body as Record<string, string>;
  if (!title || !subject || !startAt) throw new ApiError(400, 'Title, subject, and start time are required.');
  const item = await TimetableItem.create({ user: req.user?.id, title, subject, startAt, notes });
  await recordActivity({ userId: req.user?.id, type: 'profile', title: 'Added timetable item', detail: title });
  res.status(201).json({ success: true, data: item });
});

export const deleteTimetableItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await TimetableItem.findOneAndDelete({ _id: req.params.id, user: req.user?.id });
  if (!item) throw new ApiError(404, 'Timetable item not found.');
  res.json({ success: true, data: { id: req.params.id } });
});

export const listQuizScores = asyncHandler(async (req: Request, res: Response) => {
  const scores = await QuizScore.find({ user: req.user?.id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: scores });
});

export const createQuizScore = asyncHandler(async (req: Request, res: Response) => {
  const { topic, score, total } = req.body as { topic: string; score: number; total: number };
  if (!topic || score === undefined || !total) throw new ApiError(400, 'Topic, score, and total are required.');
  const item = await QuizScore.create({ user: req.user?.id, topic, score, total });
  await recordActivity({ userId: req.user?.id, type: 'profile', title: 'Completed quiz practice', detail: `${topic}: ${score}/${total}` });
  res.status(201).json({ success: true, data: item });
});
