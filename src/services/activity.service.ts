import { Types } from 'mongoose';
import { Activity, ActivityType } from '../models/Activity';

export async function recordActivity({
  userId,
  type,
  title,
  detail,
  metadata,
}: {
  userId?: string | Types.ObjectId;
  type: ActivityType;
  title: string;
  detail?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!userId) return;

  await Activity.create({
    user: new Types.ObjectId(String(userId)),
    type,
    title,
    detail,
    metadata,
  });
}
