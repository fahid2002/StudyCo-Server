/* Seeds MongoDB with realistic sessions and a demo host account.
   Run with: npm run seed */
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../models/User';
import { StudySession } from '../models/Session';

const sample = [
  {
    title: 'Calculus II: Integration Techniques',
    subject: 'Mathematics',
    mode: 'Online',
    level: 'Intermediate',
    price: 15,
    daysFromNow: 4,
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Data Structures and Algorithms Bootcamp',
    subject: 'Computer Science',
    mode: 'Online',
    level: 'Advanced',
    price: 20,
    daysFromNow: 6,
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'IELTS Speaking Practice Circle',
    subject: 'Languages',
    mode: 'Online',
    level: 'Beginner',
    price: 0,
    daysFromNow: 2,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Organic Chemistry Problem Lab',
    subject: 'Sciences',
    mode: 'In-person',
    level: 'Intermediate',
    price: 10,
    daysFromNow: 5,
    imageUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Financial Accounting Fundamentals',
    subject: 'Business',
    mode: 'Online',
    level: 'Beginner',
    price: 12,
    daysFromNow: 7,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'GRE Quant Sprint Sessions',
    subject: 'Test Prep',
    mode: 'Online',
    level: 'Intermediate',
    price: 18,
    daysFromNow: 3,
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Linear Algebra Study Circle',
    subject: 'Mathematics',
    mode: 'Online',
    level: 'Advanced',
    price: 15,
    daysFromNow: 8,
    imageUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Python for Data Science Workshop',
    subject: 'Computer Science',
    mode: 'Online',
    level: 'Beginner',
    price: 14,
    daysFromNow: 9,
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80',
  },
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
  for (const [index, session] of sample.entries()) {
    const date = new Date();
    date.setDate(date.getDate() + session.daysFromNow);
    await StudySession.create({
      title: session.title,
      shortDescription: `A focused ${session.level.toLowerCase()}-level session on ${session.title.toLowerCase()}.`,
      fullDescription: `This session works through ${session.title} in a small group. Bring specific questions or problems you are stuck on. The format is discussion-first, not a lecture.`,
      subject: session.subject,
      mode: session.mode,
      level: session.level,
      price: session.price,
      date,
      imageUrl: session.imageUrl,
      host: host._id,
      ratingAverage: Number((4.5 + index * 0.04).toFixed(1)),
      ratingCount: 18 + index * 4,
    });
  }

  console.log(`Seeded ${sample.length} sessions and demo host user (demo.student@studyco.app / demo1234).`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
