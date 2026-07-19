import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] StudyCo API listening on http://localhost:${env.port}`);
  });
}

start();
