import { z } from 'zod';

export const StatusEnum = z.enum(['LEAD', 'IN_PROGRESS', 'ON_HOLD', 'DONE']);

export const ProjectCreateSchema = z.object({
  title: z.string().min(2),
  client: z.string().min(2),
  budget: z.number().int().nonnegative(),
  status: StatusEnum.default('LEAD'),
});

export const ProjectUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  client: z.string().min(2).optional(),
  budget: z.number().int().nonnegative().optional(),
  status: StatusEnum.optional(),
});

export const ProjectQuerySchema = z.object({
  q: z.string().optional().default(''),
  status: z.enum(['', 'LEAD', 'IN_PROGRESS', 'ON_HOLD', 'DONE']).optional().default(''),
  page: z.coerce.number().int().min(1).optional().default(1),
  size: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type Status = z.infer<typeof StatusEnum>;
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;
export type ProjectQueryInput = z.infer<typeof ProjectQuerySchema>;
