import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const commentSchema = z.object({ content: z.string().min(1).max(2000) });

export const commentsRouter = Router();
commentsRouter.use(requireAuth);

commentsRouter.get('/issues/:issueId/comments', async (req, res) => {
  const data = await prisma.comment.findMany({ where: { issueId: String(req.params.issueId) }, include: { author: true } });
  res.json({ success: true, data });
});

commentsRouter.post('/issues/:issueId/comments', async (req, res) => {
  const payload = commentSchema.parse(req.body);
  const comment = await prisma.comment.create({
    data: { issueId: String(req.params.issueId), authorId: req.user!.id, content: payload.content }
  });
  res.status(201).json({ success: true, data: comment });
});

commentsRouter.delete('/issues/:issueId/comments/:commentId', async (req, res) => {
  await prisma.comment.delete({ where: { id: String(req.params.commentId) } });
  res.json({ success: true });
});
