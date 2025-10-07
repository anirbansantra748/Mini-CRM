import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { env } from '../config/env.js';
import { Role } from '../models/enums.js';

const router = Router();

// Local schemas (mirrors shared)
const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const SignupSchema = z.object({ email: z.string().email(), password: z.string().min(6), role: z.enum(['ADMIN', 'MEMBER']).optional() });

router.post('/signup', validate(SignupSchema), async (req, res) => {
  const { email, password, role } = req.body as { email: string; password: string; role?: 'ADMIN' | 'MEMBER' };
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed, role: role === 'ADMIN' ? Role.ADMIN : Role.MEMBER });
  return res.status(201).json({ id: user._id, email: user.email, role: user.role });
});

router.post('/login', validate(LoginSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ email: user.email, role: user.role }, env.JWT_SECRET, { subject: String(user._id), expiresIn: '7d' });
  return res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
});

export default router;
