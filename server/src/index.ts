import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import auditRoutes from './routes/audit.js';
import userRoutes from './routes/users.js';
import meRoutes from './routes/me.js';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Basic rate limit for mutations
const limiter = rateLimit({ windowMs: 60 * 1000, limit: 100 });
app.use(limiter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/me', meRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`[server] listening on http://localhost:${env.PORT}`);
    });
  })
  .catch((e) => {
    console.error('Failed to start', e);
    process.exit(1);
  });
