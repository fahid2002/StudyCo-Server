import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { generateToken } from '../utils/generateToken';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

const googleClient = new OAuth2Client(env.googleClientId);

function toAuthResponse(user: { _id: unknown; name: string; email: string; interests: string[] }) {
  const id = String(user._id);
  return {
    token: generateToken({ id, email: user.email, name: user.name }),
    user: { id, name: user.name, email: user.email, interests: user.interests },
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are all required.');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters.');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with that email already exists.');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), password: hashed });

  res.status(201).json({ success: true, data: toAuthResponse(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.password) {
    throw new ApiError(401, 'Incorrect email or password.');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new ApiError(401, 'Incorrect email or password.');
  }

  res.json({ success: true, data: toAuthResponse(user) });
});

// Demo login — used by the "Use demo account" button in the UI.
// Creates the demo user on first use so graders can log in without setup.
export const demoLogin = asyncHandler(async (_req: Request, res: Response) => {
  const email = 'demo.student@studyco.app';
  let user = await User.findOne({ email });
  if (!user) {
    const hashed = await bcrypt.hash('demo1234', 10);
    user = await User.create({
      name: 'Demo Student',
      email,
      password: hashed,
      interests: ['Mathematics', 'Computer Science', 'Test Prep'],
    });
  }
  res.json({ success: true, data: toAuthResponse(user) });
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body as { idToken: string };
  if (!idToken) throw new ApiError(400, 'Missing Google idToken.');
  if (!env.googleClientId) throw new ApiError(500, 'GOOGLE_CLIENT_ID is not configured on the server.');

  const ticket = await googleClient.verifyIdToken({ idToken, audience: env.googleClientId });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new ApiError(401, 'Could not verify Google account.');

  let user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name: payload.name ?? payload.email,
      email: payload.email.toLowerCase(),
      googleId: payload.sub,
    });
  }

  res.json({ success: true, data: toAuthResponse(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({
    success: true,
    data: { id: String(user._id), name: user.name, email: user.email, interests: user.interests },
  });
});

export const updateInterests = asyncHandler(async (req: Request, res: Response) => {
  const { interests } = req.body as { interests: string[] };
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { interests },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, data: { interests: user.interests } });
});
