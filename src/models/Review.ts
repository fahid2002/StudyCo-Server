import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  session: Types.ObjectId;
  author: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    session: { type: Schema.Types.ObjectId, ref: 'StudySession', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', reviewSchema);
