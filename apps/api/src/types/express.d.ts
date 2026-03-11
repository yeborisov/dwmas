import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
      githubId: string;
      username: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
