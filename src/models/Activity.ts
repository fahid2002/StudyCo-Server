import { Schema, model, Document, Types } from 'mongoose';

export type ActivityType =
  | 'auth'
  | 'session'
  | 'booking'
  | 'ai'
  | 'recommendation'
  | 'profile';

export interface IActivity extends Document {
  user: Types.ObjectId;
  type: ActivityType;
  title: string;
  detail?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['auth', 'session', 'booking', 'ai', 'recommendation', 'profile'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    detail: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export const Activity = model<IActivity>('Activity', activitySchema);
