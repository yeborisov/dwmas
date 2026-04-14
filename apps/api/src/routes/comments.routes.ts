import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { githubService } from '../services/github.service.js';
import { requireAuth } from '../middleware/auth.js';

const commentSchema = z.object({ content: z.string().min(1).max(2000) });

export const commentsRouter = Router();
commentsRouter.use(requireAuth);

function resolveIssueNumber(issue: { githubIssueNumber?: number | null; githubIssueUrl?: string | null; description?: string | null }) {
  if (issue.githubIssueNumber) return issue.githubIssueNumber;
  const urlMatch = issue.githubIssueUrl?.match(/\/issues\/(\d+)/i);
  if (urlMatch) return Number(urlMatch[1]);
  const descMatch = issue.description?.match(/\/issues\/(\d+)/i);
  return descMatch ? Number(descMatch[1]) : null;
}

commentsRouter.get('/issues/:issueId/comments', async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: { id: String(req.params.issueId) },
    include: { repository: { select: { owner: true, name: true } } }
  });
  if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

  const issueNumber = resolveIssueNumber(issue as any);
  if (issueNumber && issue.repository) {
    try {
      const comments = await githubService.listIssueComments(issue.repository.owner, issue.repository.name, issueNumber);
      const data = comments.data.map((comment) => ({
        id: String(comment.id),
        content: comment.body || '',
        createdAt: comment.created_at,
        author: {
          username: comment.user?.login || 'github',
          displayName: comment.user?.login || 'github'
        }
      }));

      if (comments.data.length) {
        const latest = comments.data.reduce((max, c) => (c.updated_at && c.updated_at > max ? c.updated_at : max), comments.data[0].updated_at || comments.data[0].created_at);
        if (latest) {
          await prisma.issue.update({ where: { id: issue.id }, data: { updatedAt: new Date(latest) } });
        }
      }

      return res.json({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load GitHub comments';
      return res.status(502).json({ success: false, message });
    }
  }

  const data = await prisma.comment.findMany({ where: { issueId: String(req.params.issueId) }, include: { author: true } });
  return res.json({ success: true, data });
});

commentsRouter.post('/issues/:issueId/comments', async (req, res) => {
  const payload = commentSchema.parse(req.body);
  const issue = await prisma.issue.findUnique({
    where: { id: String(req.params.issueId) },
    include: { repository: { select: { owner: true, name: true } } }
  });
  if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

  const issueNumber = resolveIssueNumber(issue as any);
  if (issueNumber && issue.repository) {
    try {
      const ghComment = await githubService.createIssueComment(issue.repository.owner, issue.repository.name, issueNumber, payload.content);
      const comment = await prisma.comment.create({
        data: {
          issueId: issue.id,
          authorId: req.user!.id,
          content: payload.content,
          githubCommentId: String(ghComment.data.id)
        } as any
      });
      await prisma.issue.update({ where: { id: issue.id }, data: { updatedAt: new Date(ghComment.data.updated_at || ghComment.data.created_at) } });
      return res.status(201).json({ success: true, data: comment });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create GitHub comment';
      return res.status(502).json({ success: false, message });
    }
  }

  const comment = await prisma.comment.create({
    data: { issueId: String(req.params.issueId), authorId: req.user!.id, content: payload.content }
  });
  return res.status(201).json({ success: true, data: comment });
});

commentsRouter.delete('/issues/:issueId/comments/:commentId', async (req, res) => {
  await prisma.comment.delete({ where: { id: String(req.params.commentId) } });
  res.json({ success: true });
});
