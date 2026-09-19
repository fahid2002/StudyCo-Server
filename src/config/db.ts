import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env';

export async function connectDB(): Promise<void> {
  if (!env.mongoUri) {
    console.warn('[db] MONGODB_URI not set — skipping connection (set it in .env)');
    return;
  }
  try {
    const dnsServers = process.env.MONGODB_DNS_SERVERS
      ?.split(',')
      .map((server) => server.trim())
      .filter(Boolean);

    if (dnsServers?.length) {
      dns.setServers(dnsServers);
    }

    await mongoose.connect(env.mongoUri);
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] MongoDB connection error:', err);
    process.exit(1);
  }
}
