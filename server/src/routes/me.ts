import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = Router();

// GET /api/me
router.get('/', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user!._id).select('_id email role name company').lean();
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user._id, email: user.email, role: user.role, name: user.name || '', company: user.company || '' });
});

// PATCH /api/me { name?, company? }
router.patch('/', authMiddleware, async (req, res) => {
  const { name, company } = req.body as { name?: string; company?: string };
  const updated = await User.findByIdAndUpdate(req.user!._id, { name, company }, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ id: updated._id, email: updated.email, role: updated.role, name: updated.name || '', company: updated.company || '' });
});

export default router;
