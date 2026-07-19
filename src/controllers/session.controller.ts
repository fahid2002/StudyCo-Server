import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { StudySession } from '../models/Session';
import { Review } from '../models/Review';
import { ApiError } from '../utils/ApiError';
import { recordActivity } from '../services/activity.service';

// GET /api/sessions?search=&subject=&mode=&level=&sort=&page=&limit=
export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const { search, subject, mode, level, sort = 'newest', page = '1', limit = '8' } = req.query as Record<string, string>;

  const query: Record<string, unknown> = { status: 'Upcoming' };
  if (subject) query.subject = subject;
  if (mode) query.mode = mode;
  if (level) query.level = level;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    rating: { ratingAverage: -1 },
    price: { price: 1 },
  };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [items, total] = await Promise.all([
    StudySession.find(query)
      .sort(sortMap[sort] ?? sortMap.newest)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('host', 'name'),
    StudySession.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { total, page: pageNum, limit: limitNum, pages: Math.max(1, Math.ceil(total / limitNum)) },
  });
});

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await StudySession.findById(req.params.id).populate('host', 'name email');
  if (!session) throw new ApiError(404, 'Session not found.');
  const reviews = await Review.find({ session: session._id }).populate('author', 'name').sort({ createdAt: -1 });
  const related = await StudySession.find({ subject: session.subject, _id: { $ne: session._id } }).limit(4);
  res.json({ success: true, data: { session, reviews, related } });
});

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const { title, shortDescription, fullDescription, subject, mode, level, price, date, imageUrl } = req.body;

  if (!title || !shortDescription || !fullDescription || !subject || !mode || !level || price === undefined || !date) {
    throw new ApiError(400, 'Please fill in all required fields.');
  }

  const session = await StudySession.create({
    title,
    shortDescription,
    fullDescription,
    subject,
    mode,
    level,
    price,
    date,
    imageUrl,
    host: req.user?.id,
  });

  await recordActivity({
    userId: req.user?.id,
    type: 'session',
    title: 'Published a session',
    detail: title,
    metadata: { sessionId: session._id, subject, mode },
  });

  res.status(201).json({ success: true, data: session });
});

// Sessions hosted by the logged-in user — powers /items/manage
export const mySessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await StudySession.find({ host: req.user?.id }).sort({ date: 1 });
  res.json({ success: true, data: sessions });
});

export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await StudySession.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found.');
  if (String(session.host) !== String(req.user?.id)) {
    throw new ApiError(403, 'You can only delete sessions you host.');
  }
  const title = session.title;
  await session.deleteOne();
  await recordActivity({
    userId: req.user?.id,
    type: 'session',
    title: 'Deleted a session',
    detail: title,
    metadata: { sessionId: req.params.id },
  });
  res.json({ success: true, data: { id: req.params.id } });
});

export const reserveSeat = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Login is required to reserve a session.');

  const session = await StudySession.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found.');
  if (session.seatsReserved >= session.seatsTotal) {
    throw new ApiError(400, 'This session is full.');
  }
  if (session.attendees.some((attendee) => String(attendee) === String(userId))) {
    throw new ApiError(400, 'You have already reserved this session.');
  }
  session.seatsReserved += 1;
  session.attendees.push(new Types.ObjectId(userId));
  await session.save();
  await recordActivity({
    userId,
    type: 'booking',
    title: 'Reserved a seat',
    detail: session.title,
    metadata: { sessionId: session._id, date: session.date },
  });
  res.json({ success: true, data: session });
});

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body as { rating: number; comment: string };
  const session = await StudySession.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found.');
  if (!rating || !comment) throw new ApiError(400, 'Rating and comment are required.');

  const review = await Review.create({ session: session._id, author: req.user?.id, rating, comment });

  const allReviews = await Review.find({ session: session._id });
  session.ratingCount = allReviews.length;
  session.ratingAverage = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await session.save();
  await recordActivity({
    userId: req.user?.id,
    type: 'session',
    title: 'Reviewed a session',
    detail: session.title,
    metadata: { sessionId: session._id, rating },
  });

  res.status(201).json({ success: true, data: review });
});
