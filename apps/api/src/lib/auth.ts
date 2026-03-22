import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { env } from '../config/env.js';

export interface AuthPayload {
  id: string;
  role: 'DEVELOPER' | 'DEVOPS' | 'ADMIN';
  githubId?: string | null;
  username: string;
}

export const signAuthToken = (payload: AuthPayload) => jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });

export const verifyAuthToken = (token: string): AuthPayload => jwt.verify(token, env.JWT_SECRET) as AuthPayload;

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('dwmas_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};
