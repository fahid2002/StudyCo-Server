import { Schema, model, Document, Types } from 'mongoose';

export interface ISavedNote extends Document {
  user: Types.ObjectId;
  title: string;
  folder: string;
  content: string;
  source?: string;
  createdAt: Date;
}

const savedNoteSchema = new Schema<ISavedNote>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    folder: { type: String, required: true, trim: true, default: 'General' },
    content: { type: String, required: true },
    source: { type: String, trim: true },
  },
  { timestamps: true }
);

savedNoteSchema.index({ user: 1, folder: 1, createdAt: -1 });
savedNoteSchema.index({ title: 'text', content: 'text', folder: 'text' });

export const SavedNote = model<ISavedNote>('SavedNote', savedNoteSchema);
