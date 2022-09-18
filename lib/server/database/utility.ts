import { PrismaClient } from '@prisma/client';

export async function cleanDatabase(prisma: PrismaClient, userId: string) {
  await prisma.$transaction([
    prisma.application.deleteMany({}),
    prisma.job.deleteMany({}),
    prisma.user.deleteMany({
      where: {
        NOT: {
          id: userId,
        },
      },
    }),
  ]);
}
