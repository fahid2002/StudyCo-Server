import dotenv from 'dotenv';
dotenv.config();

function get(name: string, fallback = ''): string {
  const value = process.env[name];
  if (value === undefined && !fallback) {
    console.warn(`[env] Missing environment variable: ${name}`);
  }
  return value ?? fallback;
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  mongoUri: get('MONGODB_URI'),
  jwtSecret: get('JWT_SECRET', 'dev_only_secret_change_me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: get('GEMINI_API_KEY'),
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  googleClientId: get('GOOGLE_CLIENT_ID'),
};
