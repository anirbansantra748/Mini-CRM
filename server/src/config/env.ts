import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

if (!env.DATABASE_URL) {
  console.warn('[env] DATABASE_URL is not set. Set it in .env');
}
if (!env.JWT_SECRET) {
  console.warn('[env] JWT_SECRET is not set. Set it in .env');
}
