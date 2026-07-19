/* Seeds the database with a realistic set of sessions and a demo host account.
   Run with: npm run seed */
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../models/User';
import { StudySession } from '../models/Session';

const sample = [
  { title: 'Calculus II: Integration Techniques', subject: 'Mathematics', mode: 'Online', level: 'Intermediate', price: 15, daysFromNow: 4 },
  { title: 'Data Structures & Algorithms Bootcamp', subject: 'Computer Science', mode: 'Online', level: 'Advanced', price: 20, daysFromNow: 6 },
  { title: 'IELTS Speaking Practice Circle', subject: 'Languages', mode: 'Online', level: 'Beginner', price: 0, daysFromNow: 2 },
  { title: 'Organic Chemistry Problem Lab', subject: 'Sciences', mode: 'In-person', level: 'Intermediate', price: 10, daysFromNow: 5 },
  { title: 'Financial Accounting Fundamentals', subject: 'Business', mode: 'Online', level: 'Beginner', price: 12, daysFromNow: 7 },
  { title: 'GRE Quant Sprint Sessions', subject: 'Test Prep', mode: 'Online', level: 'Intermediate', price: 18, daysFromNow: 3 },
  { title: 'Linear Algebra Study Circle', subject: 'Mathematics', mode: 'Online', level: 'Advanced', price: 15, daysFromNow: 8 },
  { title: 'Python for Data Science Workshop', subject: 'Computer Science', mode: 'Online', level: 'Beginner', price: 14, daysFromNow: 9 },
];

async function seed() {
  await mongoose.connect(env.mongoUri);

  let host = await User.findOne({ email: 'demo.student@studyco.app' });
  if (!host) {
    host = await User.create({
      name: 'Demo Student',
      email: 'demo.student@studyco.app',
      password: await bcrypt.hash('demo1234', 10),
      interests: ['Mathematics', 'Computer Science', 'Test Prep'],
    });
  }

  await StudySession.deleteMany({});
  for (const s of sample) {
    const date = new Date();
    date.setDate(date.getDate() + s.daysFromNow);
    await StudySession.create({
      title: s.title,
      shortDescription: `A focused ${s.level.toLowerCase()}-level session on ${s.title.toLowerCase()}.`,
      fullDescription: `This session works through ${s.title} in a small group. Bring specific questions or problems you're stuck on — the format is discussion-first, not a lecture.`,
      subject: s.subject,
      mode: s.mode,
      level: s.level,
      price: s.price,
      date,
      host: host._id,
      ratingAverage: 4.5 + Math.random() * 0.4,
      ratingCount: Math.floor(10 + Math.random() * 40),
    });
  }

  console.log(`Seeded ${sample.length} sessions and demo host user (demo.student@studyco.app / demo1234).`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
