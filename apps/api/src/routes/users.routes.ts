import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const updateSchema = z.object({
  role: z.enum(['DEVELOPER', 'DEVOPS', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  repositoryIds: z.array(z.string()).optional()
});

export const usersRouter = Router();
usersRouter.use(requireAuth, requireRoles('ADMIN'));

usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    include: {
      assignments: {
        include: {
          repository: {
            select: { id: true, fullName: true }
          }
        }
      }
    }
  });
  res.json({ success: true, data: users });
});

usersRouter.get('/:userId', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
    include: {
      assignments: {
        include: {
          repository: {
            select: { id: true, fullName: true }
          }
        }
      }
    }
  });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: user });
});

usersRouter.put('/:userId', async (req, res) => {
  const parsed = updateSchema.parse(req.body);
  const { repositoryIds, ...rest } = parsed;

  const user = await prisma.user.update({ where: { id: req.params.userId }, data: rest });
  if (repositoryIds) {
    await prisma.userRepositoryAssignment.deleteMany({ where: { userId: user.id } });
    await prisma.userRepositoryAssignment.createMany({
      data: repositoryIds.map((repositoryId) => ({ userId: user.id, repositoryId }))
    });
  }

  res.json({ success: true, data: user });
});

usersRouter.delete('/:userId', async (req, res) => {
  await prisma.user.update({ where: { id: req.params.userId }, data: { isActive: false } });
  res.json({ success: true });
});
