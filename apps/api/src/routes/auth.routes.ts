import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { passport } from '../config/passport.js';
import { setAuthCookie, signAuthToken } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

export const authRouter = Router();

authRouter.get('/github', passport.authenticate('github', { session: false }));

authRouter.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), (req, res) => {
  const user = req.user as {
    id: string;
    role: 'DEVELOPER' | 'DEVOPS' | 'ADMIN';
    githubId: string;
    username: string;
  };
  const token = signAuthToken(user);
  setAuthCookie(res, token);
  res.redirect(process.env.APP_URL || 'http://localhost:5173/dashboard');
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('dwmas_token');
  res.json({ success: true });
});

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password are required' });

  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, role: true, githubId: true, passwordHash: true } });
  if (!user || !user.passwordHash) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = signAuthToken({ id: user.id, role: user.role, githubId: user.githubId, username: user.username });
  setAuthCookie(res, token);
  return res.json({ success: true, data: { id: user.id, username: user.username, role: user.role } });
});

authRouter.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
    select: { id: true, passwordHash: true }
  });

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.passwordHash) {
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required' });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  const nextHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: nextHash } });
  return res.json({ success: true });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = req.user as { id: string; githubId?: string; username?: string; role: string };

  // Re-evaluate bootstrap role from env vars on every /me call
  // This ensures role updates take effect without requiring re-login
  const adminIds = new Set((env.ADMIN_GITHUB_IDS || '').split(',').map((v) => v.trim()).filter(Boolean));
  const adminUsernames = new Set((env.ADMIN_GITHUB_USERNAMES || '').split(',').map((v) => v.trim()).filter(Boolean));
  const devopsIds = new Set((env.DEVOPS_GITHUB_IDS || '').split(',').map((v) => v.trim()).filter(Boolean));
  const devopsUsernames = new Set((env.DEVOPS_GITHUB_USERNAMES || '').split(',').map((v) => v.trim()).filter(Boolean));

  let expectedRole: string | null = null;
  if ((user.githubId && adminIds.has(user.githubId)) || (user.username && adminUsernames.has(user.username))) {
    expectedRole = 'ADMIN';
  } else if ((user.githubId && devopsIds.has(user.githubId)) || (user.username && devopsUsernames.has(user.username))) {
    expectedRole = 'DEVOPS';
  }

  if (expectedRole && expectedRole !== user.role) {
    // Update DB and re-issue cookie with correct role
    const updated = await prisma.user.update({ where: { id: user.id }, data: { role: expectedRole as 'ADMIN' | 'DEVOPS' | 'DEVELOPER' } });
    const token = signAuthToken({ id: updated.id, role: updated.role, githubId: updated.githubId, username: updated.username });
    setAuthCookie(res, token);
    return res.json({ success: true, data: updated });
  }

  res.json({ success: true, data: req.user });
});
