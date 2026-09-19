import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ContactMessage } from '../models/ContactMessage';
import { ApiError } from '../utils/ApiError';

export const createContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const subject = typeof req.body.subject === 'string' ? req.body.subject.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  if (!name || !email || !subject || !message) {
    throw new ApiError(400, 'Name, email, subject, and message are required.');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, 'Please provide a valid email address.');
  if (name.length > 100 || email.length > 160 || subject.length > 160 || message.length > 5000) {
    throw new ApiError(400, 'One or more fields exceed the allowed length.');
  }

  const contactMessage = await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({
    success: true,
    data: { id: contactMessage._id, message: 'Your message has been received.' },
  });
});
