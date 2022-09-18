import { PrismaClient } from '@prisma/client';
import {
  formatErrorCode,
  ParameterFormatError,
  sizeErrorCode,
} from 'lib/exceptions/ParameterFormatError';
import { patternAppCoverLetter } from 'lib/regexPattern';

import type { UserType } from 'lib/server/database/userManage';
import type { JobType } from 'lib/server/database/jobManage';

export type ApplicationType = {
  id: number;
  createdAt: string;
  coverLetter: String;
  jobId: number;
  authorId: string;
};

export type ApplicationAuthorType = {
  application: ApplicationType;
  author: UserType;
};

export type ApplicationJobType = {
  application: ApplicationType;
  job: JobType;
};

export async function getJobApplications(
  prisma: PrismaClient,
  jobId: number,
  take?: number,
  cursor?: number,
) {
  if (isNaN(jobId)) {
    throw new ParameterFormatError(`Parameter not correct: jobId ${jobId}`, formatErrorCode);
  }
  const queryResult = await prisma.application.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          imagePath: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    where: {
      jobId,
    },
    orderBy: [
      {
        id: 'desc',
      },
    ],
    take: typeof take !== 'undefined' && !isNaN(take) ? take : 10,
    cursor: typeof cursor !== 'undefined' && !isNaN(cursor) ? { id: cursor } : undefined,
    skip: typeof cursor !== 'undefined' && !isNaN(cursor) ? 1 : undefined,
  });
  return queryResult.map((application) => {
    return {
      application: {
        id: application.id,
        createdAt: application.createdAt.toISOString(),
        coverLetter: application.coverLetter,
        jobId: application.jobId,
        authorId: application.authorId,
      },
      author: {
        id: application.author.id,
        name: application.author.name,
        email: application.author.email,
        username: application.author.username,
        imagePath: application.author.imagePath,
        role: application.author.role,
        createdAt: application.author.createdAt.toISOString(),
        updatedAt: application.author.updatedAt.toISOString(),
      },
    };
  }) as ApplicationAuthorType[];
}

export async function getAuthorApplications(
  prisma: PrismaClient,
  authorId: string,
  take?: number,
  cursor?: number,
) {
  const queryResult = await prisma.application.findMany({
    include: {
      job: {
        select: {
          id: true,
          createdAt: true,
          title: true,
          description: true,
          salary: true,
          location: true,
          published: true,
          authorId: true,
        },
      },
    },
    where: {
      authorId,
    },
    orderBy: [
      {
        id: 'desc',
      },
    ],
    take: typeof take !== 'undefined' && !isNaN(take) ? take : 10,
    cursor: typeof cursor !== 'undefined' && !isNaN(cursor) ? { id: cursor } : undefined,
    skip: typeof cursor !== 'undefined' && !isNaN(cursor) ? 1 : undefined,
  });
  return queryResult.map((application) => {
    return {
      application: {
        id: application.id,
        createdAt: application.createdAt.toISOString(),
        coverLetter: application.coverLetter,
        jobId: application.jobId,
        authorId: application.authorId,
      },
      job: {
        id: application.job.id,
        createdAt: application.job.createdAt.toISOString(),
        title: application.job.title,
        description: application.job.description,
        salary: application.job.salary.toString(),
        location: application.job.location,
        published: application.job.published,
        authorId: application.job.authorId,
      },
    };
  }) as ApplicationJobType[];
}

export async function createApplication(
  prisma: PrismaClient,
  coverLetter: string,
  jobId: number,
  jobAuthorId: string,
) {
  if (!patternAppCoverLetter.test(coverLetter)) {
    throw new ParameterFormatError(
      `Parameter not correct: title size ${coverLetter.length} too long`,
      sizeErrorCode,
    );
  }
  if (isNaN(jobId)) {
    throw new ParameterFormatError(`Parameter not correct: jobId ${jobId}`, formatErrorCode);
  }
  const queryResult = await prisma.application.create({
    data: {
      coverLetter,
      job: {
        connect: { id: jobId },
      },
      author: {
        connect: { id: jobAuthorId },
      },
    },
  });
  return {
    id: queryResult.id,
    createdAt: queryResult.createdAt.toISOString(),
    coverLetter: queryResult.coverLetter,
    jobId: queryResult.jobId,
    authorId: queryResult.authorId,
  } as ApplicationType;
}

export async function getApplication(prisma: PrismaClient, applicationId: number) {
  if (isNaN(applicationId)) {
    throw new ParameterFormatError(
      `Parameter not correct: applicationId ${applicationId}`,
      formatErrorCode,
    );
  }
  const queryResult = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
  });
  if (queryResult === null) {
    return undefined;
  }
  return {
    id: queryResult.id,
    createdAt: queryResult.createdAt.toISOString(),
    coverLetter: queryResult.coverLetter,
    jobId: queryResult.jobId,
    authorId: queryResult.authorId,
  } as ApplicationType;
}

export async function updateApplication(
  prisma: PrismaClient,
  applicationId: number,
  coverLetter?: string,
) {
  if (isNaN(applicationId)) {
    throw new ParameterFormatError(
      `Parameter not correct: jobId ${applicationId}`,
      formatErrorCode,
    );
  }
  if (typeof coverLetter === 'string' && !patternAppCoverLetter.test(coverLetter)) {
    throw new ParameterFormatError(
      `Parameter not correct: title size ${coverLetter.length} too long`,
      sizeErrorCode,
    );
  }
  const queryResult = await prisma.application.update({
    data: {
      coverLetter,
    },
    where: {
      id: applicationId,
    },
  });
  return {
    id: queryResult.id,
    createdAt: queryResult.createdAt.toISOString(),
    coverLetter: queryResult.coverLetter,
    jobId: queryResult.jobId,
    authorId: queryResult.authorId,
  } as ApplicationType;
}

export async function deleteApplication(prisma: PrismaClient, applicationId: number) {
  if (isNaN(applicationId)) {
    throw new ParameterFormatError(
      `Parameter not correct: jobId ${applicationId}`,
      formatErrorCode,
    );
  }
  return await prisma.job.delete({
    where: {
      id: applicationId,
    },
  });
}
