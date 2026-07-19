import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : undefined;

    if (!token) {
      throw new ApiError(401, 'You must be logged in to do that.');
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
      req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
      next();
    } catch {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
  }
);
