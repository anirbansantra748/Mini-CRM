import { Router } from 'express';
import { User } from '../models/User.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { Role } from '../models/enums.js';

const router = Router();

// GET /api/users (admin only)
router.get('/', authMiddleware, requireRole(Role.ADMIN), async (_req, res) => {
  const users = await User.find({}).select('_id email role createdAt').lean();
  res.json({ items: users });
});

// PATCH /api/users/:id/role { role }
router.patch('/:id/role', authMiddleware, requireRole(Role.ADMIN), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body as { role: 'ADMIN' | 'MEMBER' };
  if (!['ADMIN', 'MEMBER'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const updated = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ id: updated._id, email: updated.email, role: updated.role });
});

export default router;
