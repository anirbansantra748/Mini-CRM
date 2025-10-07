import { Router } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';
import { Role } from '../models/enums.js';

const router = Router();

// GET /api/audit?projectId=
router.get('/', authMiddleware, requireRole(Role.ADMIN), async (req, res) => {
  const { projectId } = req.query as any;
  const filter: any = {};
  if (projectId) filter.projectId = projectId;
  const logs = await AuditLog.find(filter)
    .sort({ at: -1 })
    .populate('userId', 'email role')
    .populate('projectId', 'title')
    .lean();
  res.json({ items: logs });
});

export default router;
