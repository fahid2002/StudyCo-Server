import { Schema, model, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  user: Types.ObjectId;
  session: Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    session: { type: Schema.Types.ObjectId, ref: 'StudySession', required: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, session: 1 }, { unique: true });

export const Bookmark = model<IBookmark>('Bookmark', bookmarkSchema);
