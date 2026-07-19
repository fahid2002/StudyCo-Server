import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  if (!env.mongoUri) {
    console.warn('[db] MONGODB_URI not set — skipping connection (set it in .env)');
    return;
  }
  try {
    await mongoose.connect(env.mongoUri);
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] MongoDB connection error:', err);
    process.exit(1);
  }
}
