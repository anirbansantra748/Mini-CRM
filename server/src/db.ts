import mongoose from 'mongoose';
import { env } from './config/env.js';

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function connectDB() {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL not configured');

  const maxAttempts = 20; // ~40s total with 2s backoff
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      await mongoose.connect(env.DATABASE_URL, { autoIndex: true });
      console.log('[db] connected');
      return;
    } catch (err) {
      attempt++;
      console.warn(`[db] connect attempt ${attempt}/${maxAttempts} failed: ${(err as Error).message}`);
      await sleep(2000);
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts');
}
