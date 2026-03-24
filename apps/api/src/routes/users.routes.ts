import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const createSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  role: z.enum(['DEVELOPER', 'DEVOPS', 'ADMIN']).default('DEVELOPER'),
  githubId: z.string().optional(),
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  repositoryIds: z.array(z.string()).optional()
});

const updateSchema = z.object({
  role: z.enum(['DEVELOPER', 'DEVOPS', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  repositoryIds: z.array(z.string()).optional(),
  password: z.string().min(8).optional()
});

export const usersRouter = Router();
usersRouter.use(requireAuth, requireRoles('ADMIN'));

usersRouter.post('/', async (req, res) => {
  const parsed = createSchema.parse(req.body);
  const { password, repositoryIds, githubId, ...rest } = parsed;
  const passwordHash = await bcrypt.hash(password, 10);
  const resolvedGithubId = githubId && githubId.trim().length > 0 ? githubId : `local_${rest.username}`;

  try {
    const user = await prisma.user.create({
      data: {
        ...rest,
        githubId: resolvedGithubId,
        passwordHash
      }
    });

    if (repositoryIds?.length) {
      await prisma.userRepositoryAssignment.createMany({
        data: repositoryIds.map((repositoryId) => ({ userId: user.id, repositoryId }))
      });
    }
  const { passwordHash: _passwordHash, ...safeUser } = user;
  void _passwordHash;
  res.status(201).json({ success: true, data: safeUser });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Username or GitHub ID already exists' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

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
  const { repositoryIds, password, ...rest } = parsed;

  const data: Record<string, unknown> = { ...rest };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({ where: { id: req.params.userId }, data });
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

usersRouter.delete('/:userId/hard', async (req, res) => {
  const userId = req.params.userId;
  await prisma.userRepositoryAssignment.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  res.json({ success: true });
});

usersRouter.post('/:userId/reset-password', async (req, res) => {
  const tempPassword = crypto.randomBytes(9).toString('base64url');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.update({
    where: { id: req.params.userId },
    data: { passwordHash }
  });

  res.json({ success: true, data: { id: user.id, username: user.username, tempPassword } });
});
