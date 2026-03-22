import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
      githubId?: string | null;
      username: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
