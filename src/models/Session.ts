import { Schema, model, Document, Types } from 'mongoose';

export type SessionMode = 'Online' | 'In-person';
export type SessionLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type SessionSubject =
  | 'Mathematics'
  | 'Computer Science'
  | 'Languages'
  | 'Sciences'
  | 'Business'
  | 'Test Prep';

export interface IStudySession extends Document {
  _id: Types.ObjectId;
  title: string;
  shortDescription: string;
  fullDescription: string;
  subject: SessionSubject;
  mode: SessionMode;
  level: SessionLevel;
  price: number;
  date: Date;
  imageUrl?: string;
  host: Types.ObjectId;
  attendees: Types.ObjectId[];
  ratingAverage: number;
  ratingCount: number;
  seatsTotal: number;
  seatsReserved: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  createdAt: Date;
}

const sessionSchema = new Schema<IStudySession>(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, required: true },
    subject: {
      type: String,
      required: true,
      enum: ['Mathematics', 'Computer Science', 'Languages', 'Sciences', 'Business', 'Test Prep'],
    },
    mode: { type: String, required: true, enum: ['Online', 'In-person'] },
    level: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    price: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    imageUrl: { type: String },
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    seatsTotal: { type: Number, default: 8 },
    seatsReserved: { type: Number, default: 0 },
    status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' },
  },
  { timestamps: true }
);

sessionSchema.index({ title: 'text', shortDescription: 'text' });

export const StudySession = model<IStudySession>('StudySession', sessionSchema);
