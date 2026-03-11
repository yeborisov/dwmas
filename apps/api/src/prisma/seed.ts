import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { githubId: '9MI3400735' },
    update: {},
    create: {
      githubId: '9MI3400735',
      username: 'yordanb',
      displayName: 'Yordan B.',
      email: 'yordan@example.com',
      role: 'ADMIN'
    }
  });

  const repo = await prisma.repository.upsert({
    where: { fullName: 'octocat/Hello-World' },
    update: {},
    create: {
      githubRepoId: '1296269',
      owner: 'octocat',
      name: 'Hello-World',
      fullName: 'octocat/Hello-World',
      isPrivate: false,
      defaultBranch: 'master',
      createdByUserId: admin.id
    }
  });

  await prisma.userRepositoryAssignment.upsert({
    where: { userId_repositoryId: { userId: admin.id, repositoryId: repo.id } },
    update: {},
    create: { userId: admin.id, repositoryId: repo.id }
  });

  await prisma.reportTemplate.createMany({
    data: [
      {
        name: 'Weekly Reliability',
        type: 'WEEKLY',
        description: 'Weekly failure trend report',
        configJson: { interval: '7d', include: ['failureRate', 'topFailingWorkflows'] },
        createdByUserId: admin.id
      },
      {
        name: 'Repository Health',
        type: 'REPOSITORY',
        description: 'Per-repository health summary',
        configJson: { include: ['runCount', 'avgDuration', 'failureRate'] },
        createdByUserId: admin.id
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
