import { Schema, model, Document, Types } from 'mongoose';

export interface IRecommendationFeedback extends Document {
  user: Types.ObjectId;
  session: Types.ObjectId;
  vote: 'up' | 'down';
  createdAt: Date;
}

const feedbackSchema = new Schema<IRecommendationFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'StudySession', required: true },
    vote: { type: String, enum: ['up', 'down'], required: true },
  },
  { timestamps: true }
);

export const RecommendationFeedback = model<IRecommendationFeedback>(
  'RecommendationFeedback',
  feedbackSchema
);
