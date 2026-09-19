import { Schema, model, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  session: Types.ObjectId;
  note: string;
  status: 'reserved' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'StudySession', required: true },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: ['reserved', 'cancelled'], default: 'reserved' },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, session: 1 }, { unique: true });

export const Booking = model<IBooking>('Booking', bookingSchema);
