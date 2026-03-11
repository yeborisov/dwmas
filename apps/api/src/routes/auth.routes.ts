import { Router } from 'express';
import { passport } from '../config/passport.js';
import { setAuthCookie, signAuthToken } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';

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

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, data: req.user });
});
