import type { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../lib/auth.js';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.dwmas_token as string | undefined;
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    req.user = verifyAuthToken(token);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid session' });
  }
};

export const requireRoles = (...roles: Array<'DEVELOPER' | 'DEVOPS' | 'ADMIN'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  };
};
