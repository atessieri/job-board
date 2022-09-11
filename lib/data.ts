import { PrismaClient } from '@prisma/client';

export async function getJobApplications(prisma, jobId, take, cursor) {
  const query = {
    where: {
      id: jobId,
    },
    include: {
      author: true,
      application: {
        orderBy: [
          {
            id: 'desc',
          },
        ],
        take: isNaN(take) ? 10 : take,
      },
    },
  };
  if (!isNaN(cursor)) {
    query.include.application.cursor = { id: cursor };
    query.include.application.skip = 1;
  }
  return await prisma.job.findUnique(query);
}

export async function getUserAppliedJobs(prisma, applicationAuthorId, take, cursor) {
  const query = {
    where: {
      authorId: applicationAuthorId,
    },
    orderBy: [
      {
        id: 'desc',
      },
    ],
    include: {
      job: true,
    },
    take: isNaN(take) ? 10 : take,
  };
  if (!isNaN(cursor)) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }
  return await prisma.application.findMany(query);
}

export async function createApplication(prisma, applicationAuthorId, jobId, coverLetter) {
  return await prisma.application.create({
    data: {
      coverLetter,
      author: {
        connect: { id: applicationAuthorId },
      },
      job: {
        connect: { id: jobId },
      },
    },
  });
}

export async function getApplication(prisma, applicationAuthorId, applicationId) {
  return await prisma.application.findMany({
    where: {
      AND: [{ id: applicationId }, { authorId: applicationAuthorId }],
    },
    include: {
      author: true,
      job: true,
    },
  });
}

export async function updateApplication(prisma, userId, applicationId, coverLetter) {
  return await prisma.application.updateMany({
    data: { coverLetter },
    where: {
      AND: [{ id: applicationId }, { authorId: userId }],
    },
  });
}

export async function deleteApplication(prisma, applicationAuthorId, applicationId) {
  return await prisma.application.deleteMany({
    where: {
      AND: [{ id: applicationId }, { authorId: applicationAuthorId }],
    },
  });
}

export async function cleanDatabase(prisma, userId) {
  return await prisma.user.deleteMany({
    where: {
      NOT: {
        id: userId,
      },
    },
  });
}
