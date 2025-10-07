import { Router } from 'express';
import { z } from 'zod';
import { Project } from '../models/Project.js';
import { AuditLog } from '../models/AuditLog.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { Role } from '../models/enums.js';
import { diffObjects } from '../utils/diff.js';

const router = Router();

// Local schemas (mirrors shared)
const StatusEnum = z.enum(['LEAD', 'IN_PROGRESS', 'ON_HOLD', 'DONE']);
const ProjectCreateSchema = z.object({ title: z.string().min(2), client: z.string().min(2), budget: z.number().int().nonnegative(), status: StatusEnum.default('LEAD') });
const ProjectUpdateSchema = z.object({ title: z.string().min(2).optional(), client: z.string().min(2).optional(), budget: z.number().int().nonnegative().optional(), status: StatusEnum.optional() });
const ProjectQuerySchema = z.object({ q: z.string().optional().default(''), status: z.enum(['', 'LEAD', 'IN_PROGRESS', 'ON_HOLD', 'DONE']).optional().default(''), page: z.coerce.number().int().min(1).optional().default(1), size: z.coerce.number().int().min(1).max(100).optional().default(10), });

// GET /api/projects?q=&status=&page=&size=
router.get('/', authMiddleware, validate(ProjectQuerySchema, 'query'), async (req, res) => {
  const { q = '', status = '', page = 1, size = 10 } = req.query as any;
  const filter: any = {};
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { client: { $regex: q, $options: 'i' } },
    ];
  }
  if (status) filter.status = status;

  // Restrict member visibility: members see owner or assigned projects only
  const userId = req.user!._id;
  const isAdmin = req.user!.role === Role.ADMIN;
  if (!isAdmin) {
    filter.$and = [
      filter.$and || {},
      { $or: [{ ownerId: userId }, { members: userId }] },
    ].filter(Boolean);
  }

  const skip = (Number(page) - 1) * Number(size);
  const [items, total] = await Promise.all([
    Project.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(size))
      .populate('ownerId', 'email name')
      .populate('members', 'email name')
      .lean(),
    Project.countDocuments(filter),
  ]);

  res.json({ items, total, page: Number(page), size: Number(size) });
});

// POST /api/projects
router.post('/', authMiddleware, validate(ProjectCreateSchema), async (req, res) => {
  const body = req.body as any;
  const ownerId = req.user!._id;
  const isAdmin = req.user!.role === Role.ADMIN;
  const members = isAdmin && Array.isArray(body.members) ? body.members : [];
  const created = await Project.create({ title: body.title, client: body.client, budget: body.budget, status: body.status, ownerId, members });
  await AuditLog.create({ projectId: created._id, userId: ownerId, action: 'create', diff: body });
  res.status(201).json(created);
});

// PATCH /api/projects/:id
router.patch('/:id', authMiddleware, validate(ProjectUpdateSchema), async (req, res) => {
  const { id } = req.params;
  let update = req.body as any;
  const existing = await Project.findById(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const isOwner = String(existing.ownerId) === req.user!._id;
  const isAdmin = req.user!.role === Role.ADMIN;
  const isAssigned = existing.members?.some((m: any) => String(m) === req.user!._id);
  if (!isOwner && !isAdmin && !isAssigned) return res.status(403).json({ error: 'Forbidden' });

  // If user is assigned but not owner/admin, only allow status updates
  if (!isOwner && !isAdmin && isAssigned) {
    update = { status: update.status };
  }

  const before = existing.toObject();
  Object.assign(existing, update);
  await existing.save();
  const after = existing.toObject();
  const diff = diffObjects(before, after);
  await AuditLog.create({ projectId: existing._id, userId: req.user!._id, action: 'update', diff });
  res.json(existing);
});

// DELETE /api/projects/:id (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user!.role !== Role.ADMIN) return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  const existing = await Project.findById(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await Project.deleteOne({ _id: id });
  await AuditLog.create({ projectId: id, userId: req.user!._id, action: 'delete', diff: { id } });
  res.status(204).send();
});

// PATCH /api/projects/:id/members (admin only)
router.patch('/:id/members', authMiddleware, async (req, res) => {
  if (req.user!.role !== Role.ADMIN) return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  const { memberIds } = req.body as { memberIds: string[] };
  const existing = await Project.findById(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const before = existing.toObject();
  existing.members = Array.isArray(memberIds) ? (memberIds as any) : ([] as any);
  await existing.save();
  const after = existing.toObject();
  const diff = diffObjects(before, after);
  await AuditLog.create({ projectId: existing._id, userId: req.user!._id, action: 'update', diff });
  res.json(existing);
});

export default router;
