import { Prisma, PrismaClient } from '@prisma/client';
import {
  formatErrorCode,
  ParameterFormatError,
  sizeErrorCode,
} from 'lib/exceptions/ParameterFormatError';
import {
  patternDecimal,
  patternJobLocation,
  patternJobTitle,
  patternJobDescription,
} from 'lib/regexPattern';

import type { UserType } from 'lib/server/database/userManage';

export type JobType = {
  id: number;
  createdAt: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  published: boolean;
  authorId: string;
};

export type JobAppCountType = {
  job: JobType;
  appCount: number;
};

export type JobAuthorAppCountType = {
  job: JobType;
  author: UserType;
  appCount: number;
};

export async function getJobs(
  prisma: PrismaClient,
  onlyPublished?: string,
  jobAuthorId?: string,
  take?: number,
  cursor?: number,
) {
  let published: boolean;
  if (typeof onlyPublished === 'undefined' || onlyPublished === 'true') {
    published = true;
  } else if (onlyPublished === 'false') {
    published = false;
  } else {
    throw new ParameterFormatError(
      `Parameter not correct: published ${onlyPublished}`,
      sizeErrorCode,
    );
  }
  const queryResult = await prisma.job.findMany({
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
      _count: {
        select: { application: true },
      },
    },
    where: {
      AND: [
        {
          authorId: jobAuthorId,
        },
        {
          published,
        },
      ],
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
  return queryResult.map((job) => {
    return {
      job: {
        id: job.id,
        createdAt: job.createdAt.toISOString(),
        title: job.title,
        description: job.description,
        salary: job.salary.toString(),
        location: job.location,
        published: job.published,
        authorId: job.authorId,
      },
      author: {
        id: job.author.id,
        name: job.author.name,
        email: job.author.email,
        username: job.author.username,
        imagePath: job.author.imagePath,
        role: job.author.role,
        createdAt: job.author.createdAt.toISOString(),
        updatedAt: job.author.updatedAt.toISOString(),
      },
      appCount: job._count.application,
    };
  }) as JobAuthorAppCountType[];
}

export async function createJob(
  prisma: PrismaClient,
  jobAuthorId: string,
  title: string,
  description: string,
  salary: string,
  location: string,
  onlyPublished?: string,
) {
  if (!patternJobTitle.test(title)) {
    throw new ParameterFormatError(
      `Parameter not correct: title size ${title.length} too long`,
      sizeErrorCode,
    );
  }
  if (!patternJobDescription.test(description)) {
    throw new ParameterFormatError(
      `Parameter not correct: description size ${description.length} too long`,
      sizeErrorCode,
    );
  }
  if (!patternDecimal.test(salary)) {
    throw new ParameterFormatError(`Parameter not correct: salary ${salary}`, formatErrorCode);
  }
  if (!patternJobLocation.test(location)) {
    throw new ParameterFormatError(
      `Parameter not correct: location size ${location.length} too long`,
      sizeErrorCode,
    );
  }
  let published: boolean;
  if (typeof onlyPublished === 'undefined' || onlyPublished == 'false') {
    published = false;
  } else if (onlyPublished == 'true') {
    published = true;
  } else {
    throw new ParameterFormatError(
      `Parameter not correct: published ${onlyPublished}`,
      formatErrorCode,
    );
  }
  const queryResult = await prisma.job.create({
    data: {
      title,
      description,
      salary: new Prisma.Decimal(salary),
      location,
      published,
      author: {
        connect: { id: jobAuthorId },
      },
    },
  });
  return {
    id: queryResult.id,
    createdAt: queryResult.createdAt.toISOString(),
    title: queryResult.title,
    description: queryResult.description,
    salary: queryResult.salary.toString(),
    location: queryResult.location,
    published: queryResult.published,
    authorId: queryResult.authorId,
  } as JobType;
}

export async function getJob(prisma: PrismaClient, jobId: number) {
  if (isNaN(jobId)) {
    throw new ParameterFormatError(`Parameter not correct: jobId ${jobId}`, formatErrorCode);
  }
  const queryResult = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
    include: {
      _count: {
        select: { application: true },
      },
    },
  });
  if (queryResult === null) {
    return undefined;
  }
  return {
    job: {
      id: queryResult.id,
      createdAt: queryResult.createdAt.toISOString(),
      title: queryResult.title,
      description: queryResult.description,
      salary: queryResult.salary.toString(),
      location: queryResult.location,
      published: queryResult.published,
      authorId: queryResult.authorId,
    },
    appCount: queryResult._count.application,
  } as JobAppCountType;
}

export async function updateJob(
  prisma: PrismaClient,
  jobId: number,
  title?: string,
  description?: string,
  salary?: string,
  location?: string,
  onlyPublished?: string,
) {
  if (isNaN(jobId)) {
    throw new ParameterFormatError(`Parameter not correct: jobId ${jobId}`, formatErrorCode);
  }
  if (typeof title === 'string' && !patternJobTitle.test(title)) {
    throw new ParameterFormatError(
      `Parameter not correct: title size ${title.length} too long`,
      sizeErrorCode,
    );
  }
  if (typeof description === 'string' && !patternJobDescription.test(description)) {
    throw new ParameterFormatError(
      `Parameter not correct: description size ${description.length} too long`,
      sizeErrorCode,
    );
  }
  if (typeof salary === 'string' && !patternDecimal.test(salary)) {
    throw new ParameterFormatError(`Parameter not correct: salary ${salary}`, formatErrorCode);
  }
  if (typeof location === 'string' && !patternJobLocation.test(location)) {
    throw new ParameterFormatError(
      `Parameter not correct: location size ${location.length} too long`,
      sizeErrorCode,
    );
  }
  let published: boolean | undefined;
  if (typeof onlyPublished === 'undefined') {
    published = onlyPublished;
  } else if (onlyPublished === 'false') {
    published = false;
  } else if (onlyPublished === 'true') {
    published = true;
  } else {
    throw new ParameterFormatError(`Parameter not correct: published ${published}`, sizeErrorCode);
  }
  const queryResult = await prisma.job.update({
    data: {
      title,
      description,
      salary: typeof salary !== 'undefined' ? new Prisma.Decimal(salary) : undefined,
      location,
      published,
    },
    where: {
      id: jobId,
    },
  });
  return {
    id: queryResult.id,
    createdAt: queryResult.createdAt.toISOString(),
    title: queryResult.title,
    description: queryResult.description,
    salary: queryResult.salary.toString(),
    location: queryResult.location,
    published: queryResult.published,
    authorId: queryResult.authorId,
  } as JobType;
}

export async function deleteJob(prisma: PrismaClient, jobId: number) {
  if (isNaN(jobId)) {
    throw new ParameterFormatError(`Parameter not correct: jobId ${jobId}`, formatErrorCode);
  }
  return await prisma.job.delete({
    where: {
      id: jobId,
    },
  });
}
