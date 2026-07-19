import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ChatMessage } from '../models/ChatMessage';
import { StudySession } from '../models/Session';
import { chatCompletion } from '../services/openai.service';
import { ApiError } from '../utils/ApiError';

const SYSTEM_PROMPT = `You are the StudyCo in-app assistant. StudyCo is a platform where students
book peer-led and tutor-led study sessions, and use AI tools to generate notes and get
session recommendations. Answer questions about the platform (how to host a session, how
filters/search work, what the AI tools do) and about the student's own upcoming sessions
when given that context. Be concise (2-4 sentences), friendly, and concrete. If you don't
have enough context to answer something about their account, say so plainly instead of
guessing.`;

export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await ChatMessage.find({ user: req.user?.id }).sort({ createdAt: 1 }).limit(50);
  res.json({ success: true, data: history });
});

export const postChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body as { message: string };
  if (!message?.trim()) throw new ApiError(400, 'Message cannot be empty.');

  const userId = req.user?.id;

  const upcoming = await StudySession.find({ host: userId, status: 'Upcoming' })
    .sort({ date: 1 })
    .limit(3);

  const contextNote = upcoming.length
    ? `The student's upcoming hosted sessions: ${upcoming
        .map((s) => `${s.title} on ${s.date.toDateString()}`)
        .join('; ')}.`
    : 'The student has no upcoming hosted sessions.';

  const history = await ChatMessage.find({ user: userId }).sort({ createdAt: 1 }).limit(20);

  await ChatMessage.create({ user: userId, role: 'user', content: message });

  const reply = await chatCompletion([
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n${contextNote}` },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ]);

  await ChatMessage.create({ user: userId, role: 'assistant', content: reply });

  res.json({ success: true, data: { reply } });
});
