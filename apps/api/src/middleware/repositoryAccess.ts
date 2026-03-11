import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const requireRepositoryAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (req.user.role === 'ADMIN' || req.user.role === 'DEVOPS') return next();

  const repoId = String(req.params.repoId);
  const assignment = await prisma.userRepositoryAssignment.findFirst({
    where: { userId: req.user.id, repositoryId: repoId }
  });

  if (!assignment) return res.status(403).json({ success: false, message: 'No repository access' });
  return next();
};
