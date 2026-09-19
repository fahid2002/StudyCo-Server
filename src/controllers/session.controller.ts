import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { StudySession } from '../models/Session';
import { Booking } from '../models/Booking';
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

// Sessions reserved by the logged-in user — powers /bookings
export const bookedSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await StudySession.find({ attendees: req.user?.id })
    .sort({ date: 1 })
    .populate('host', 'name');
  const bookings = await Booking.find({
    user: req.user?.id,
    session: { $in: sessions.map((session) => session._id) },
  });
  const bookingBySession = new Map(bookings.map((booking) => [String(booking.session), booking]));

  res.json({
    success: true,
    data: sessions.map((session) => ({
      session,
      booking: bookingBySession.get(String(session._id)) ?? null,
    })),
  });
});

export const updateBooking = asyncHandler(async (req: Request, res: Response) => {
  const note = typeof req.body.note === 'string' ? req.body.note.trim() : '';
  if (note.length > 500) throw new ApiError(400, 'Booking note must be 500 characters or fewer.');

  const session = await StudySession.findOne({ _id: req.params.id, attendees: req.user?.id });
  if (!session) throw new ApiError(404, 'You do not have a booking for this session.');

  const booking = await Booking.findOneAndUpdate(
    { user: req.user?.id, session: session._id },
    { user: req.user?.id, session: session._id, note },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await recordActivity({
    userId: req.user?.id,
    type: 'booking',
    title: 'Updated booking details',
    detail: session.title,
    metadata: { sessionId: session._id },
  });

  res.json({ success: true, data: booking });
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Login is required to cancel a booking.');

  const session = await StudySession.findOneAndUpdate(
    {
      _id: req.params.id,
      attendees: userId,
      seatsReserved: { $gt: 0 },
    },
    {
      $pull: { attendees: userId },
      $inc: { seatsReserved: -1 },
    },
    { new: true }
  );

  if (!session) throw new ApiError(404, 'You do not have a booking for this session.');

  await Booking.findOneAndUpdate(
    { user: userId, session: session._id },
    { status: 'cancelled' },
    { new: true }
  );
  await recordActivity({
    userId,
    type: 'booking',
    title: 'Cancelled a booking',
    detail: session.title,
    metadata: { sessionId: session._id },
  });

  res.json({
    success: true,
    data: { sessionId: session._id, seatsReserved: session.seatsReserved, status: 'cancelled' },
  });
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
  await Booking.findOneAndUpdate(
    { user: userId, session: session._id },
    { $set: { status: 'reserved' }, $setOnInsert: { user: userId, session: session._id, note: '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
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
  if (!session.attendees.some((attendee) => String(attendee) === String(req.user?.id))) {
    throw new ApiError(403, 'You can review a session after reserving a seat.');
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be an integer from 1 to 5.');
  }
  const trimmedComment = typeof comment === 'string' ? comment.trim() : '';
  if (!trimmedComment) throw new ApiError(400, 'A review comment is required.');
  if (trimmedComment.length > 1000) throw new ApiError(400, 'Review comment must be 1000 characters or fewer.');

  const review = await Review.create({ session: session._id, author: req.user?.id, rating, comment: trimmedComment });

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
