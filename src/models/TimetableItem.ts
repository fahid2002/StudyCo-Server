import { Schema, model, Document, Types } from 'mongoose';

export interface ITimetableItem extends Document {
  user: Types.ObjectId;
  title: string;
  subject: string;
  startAt: Date;
  notes?: string;
  createdAt: Date;
}

const timetableItemSchema = new Schema<ITimetableItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

timetableItemSchema.index({ user: 1, startAt: 1 });

export const TimetableItem = model<ITimetableItem>('TimetableItem', timetableItemSchema);
