import { Types } from 'mongoose';
import { StudySession, IStudySession } from '../models/Session';
import { RecommendationFeedback } from '../models/RecommendationFeedback';
import { User } from '../models/User';

/**
 * Rule-based recommendation engine.
 *
 * Score = subject match with the user's saved interests
 *       + a small bonus for sessions similar to ones the user has up-voted
 *       - a penalty for subjects the user has down-voted
 *       + a mild boost for higher-rated sessions
 *
 * This intentionally avoids calling the LLM for every recommendation request:
 * it's fast, free, and fully explainable (the "why recommended" reason comes
 * straight from the rule that fired).
 */
export async function getRecommendations(userId: string, limit = 6) {
  const user = await User.findById(userId);
  const interests = user?.interests ?? [];

  const feedback = await RecommendationFeedback.find({ user: userId }).populate<{
    session: IStudySession;
  }>('session');

  const upvotedSubjects = new Set(
    feedback.filter((f) => f.vote === 'up').map((f) => f.session.subject)
  );
  const downvotedSubjects = new Set(
    feedback.filter((f) => f.vote === 'down').map((f) => f.session.subject)
  );

  const candidates = await StudySession.find({ status: 'Upcoming' }).populate('host', 'name');

  const scored = candidates.map((session) => {
    let score = 0;
    let reason = 'Popular with students right now';

    if (interests.includes(session.subject)) {
      score += 3;
      reason = `Matches your interest in ${session.subject}`;
    }
    if (upvotedSubjects.has(session.subject)) {
      score += 2;
      reason = `You've liked ${session.subject} sessions before`;
    }
    if (downvotedSubjects.has(session.subject)) {
      score -= 4;
    }
    score += session.ratingAverage / 5; // 0 - 1 bonus

    return { session, score, reason };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({ session: s.session, reason: s.reason }));
}

export async function recordFeedback(userId: string, sessionId: string, vote: 'up' | 'down') {
  await RecommendationFeedback.findOneAndUpdate(
    { user: new Types.ObjectId(userId), session: new Types.ObjectId(sessionId) },
    { vote },
    { upsert: true, new: true }
  );
}
