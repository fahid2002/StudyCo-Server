import { Schema, model, Document, Types } from 'mongoose';

export interface IQuizScore extends Document {
  user: Types.ObjectId;
  topic: string;
  score: number;
  total: number;
  createdAt: Date;
}

const quizScoreSchema = new Schema<IQuizScore>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

quizScoreSchema.index({ user: 1, createdAt: -1 });

export const QuizScore = model<IQuizScore>('QuizScore', quizScoreSchema);
