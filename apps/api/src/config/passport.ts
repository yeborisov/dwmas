import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { env } from './env.js';
import { prisma } from './prisma.js';

const adminIds = new Set((env.ADMIN_GITHUB_IDS || '').split(',').map((v) => v.trim()).filter(Boolean));
const adminUsernames = new Set((env.ADMIN_GITHUB_USERNAMES || '').split(',').map((v) => v.trim()).filter(Boolean));
const devopsIds = new Set((env.DEVOPS_GITHUB_IDS || '').split(',').map((v) => v.trim()).filter(Boolean));
const devopsUsernames = new Set((env.DEVOPS_GITHUB_USERNAMES || '').split(',').map((v) => v.trim()).filter(Boolean));

function resolveBootstrapRole(githubId: string, username: string) {
  if (adminIds.has(githubId) || adminUsernames.has(username)) return 'ADMIN' as const;
  if (devopsIds.has(githubId) || devopsUsernames.has(username)) return 'DEVOPS' as const;
  return null;
}

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
      scope: ['read:user', 'user:email']
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: {
        id: string;
        username?: string;
        emails?: Array<{ value?: string }>;
        photos?: Array<{ value?: string }>;
        displayName?: string;
      },
      done: (error: Error | null, user?: unknown) => void
    ) => {
      try {
        const githubId = profile.id;
        const username = profile.username || `gh_${githubId}`;
        const email = profile.emails?.[0]?.value;
        const avatarUrl = profile.photos?.[0]?.value;
        const bootstrapRole = resolveBootstrapRole(githubId, username);
        const existing = await prisma.user.findUnique({ where: { githubId } });
        const role = bootstrapRole ?? existing?.role ?? 'DEVELOPER';

        const user = await prisma.user.upsert({
          where: { githubId },
          update: {
            username,
            email,
            avatarUrl,
            displayName: profile.displayName || username,
            role
          },
          create: {
            githubId,
            username,
            email,
            avatarUrl,
            displayName: profile.displayName || username,
            role
          }
        });

        done(null, user);
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

export { passport };
