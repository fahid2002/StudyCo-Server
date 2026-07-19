import { Schema, model, Document, Types } from 'mongoose';

export interface IGeneratedContent extends Document {
  user: Types.ObjectId;
  type: 'Study notes' | 'Summary' | 'Flashcards' | 'Practice quiz';
  topic: string;
  length: 'Short' | 'Medium' | 'Long';
  output: string;
  createdAt: Date;
}

const generatedContentSchema = new Schema<IGeneratedContent>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Study notes', 'Summary', 'Flashcards', 'Practice quiz'], required: true },
    topic: { type: String, required: true },
    length: { type: String, enum: ['Short', 'Medium', 'Long'], required: true },
    output: { type: String, required: true },
  },
  { timestamps: true }
);

export const GeneratedContent = model<IGeneratedContent>('GeneratedContent', generatedContentSchema);
