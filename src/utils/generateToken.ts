import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function generateToken(payload: { id: string; email: string; name: string }): string {
  const options: jwt.SignOptions = { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwtSecret, options);
}
