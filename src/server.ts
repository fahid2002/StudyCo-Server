import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import mongoose from 'mongoose';

let server: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[server] ${signal} received; closing HTTP server...`);

  const finish = async () => {
    await mongoose.disconnect().catch((error: unknown) => {
      console.error('[db] Error while closing MongoDB connection:', error);
    });

    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
      return;
    }

    process.exit(0);
  };

  if (server) {
    server.close(() => {
      void finish();
    });
  } else {
    void finish();
  }
}

async function start() {
  await connectDB();
  server = app.listen(env.port, () => {
    console.log(`[server] StudyCo API listening on http://localhost:${env.port}`);
  });
}

process.once('SIGUSR2', () => shutdown('SIGUSR2'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

start();
