import { Prisma, PrismaClient } from '@prisma/client';
import {
  formatErrorCode,
  maximumValueErrorCode,
  minimumValueErrorCode,
  ParameterFormatError,
  sizeErrorCode,
} from 'lib/exceptions/ParameterFormatError';

import {
  patternDecimal,
  patternJobLocation,
  patternJobTitle,
  patternJobDescription,
  jobTitleMaxSize,
  jobDescriptionMaxSize,
  jobLocationMaxSize,
  minimumTakeRecordNumber,
  maximumTakeRecordNumber,
  jobTitleMinSize,
  jobDescriptionMinSize,
  jobLocationMinSize,
} from 'lib/regexPattern';

import type { UserType } from 'lib/server/database/userManage';

/**
 *  @swagger
 *  components:
 *    schemas:
 *      JobType:
 *        description: Information about the job
 *        type: object
 *        required:
 *          - id
 *          - createdAt
 *          - updatedAt
 *          - title
 *          - description
 *          - salary
 *          - location
 *          - published
 *          - authorId
 *        properties:
 *          id:
 *            description: The identification of job
 *            type: integer
 *            format: int32
 *            example: 10
 *          createdAt:
 *            description: Date and time when the job was created
 *            type: string
 *            format: date-time
 *            example: '2017-07-21T17:32:28Z'
 *          updatedAt:
 *            description: Date and time when the job was updated
 *            type: string
 *            format: date-time
 *            example: '2017-07-21T17:32:28Z'
 *          title:
 *            description: The title of the job post
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,80}$'
 *            minLength: 1
 *            maxLength: 80
 *            example: 'Example title'
 *          description:
 *            description: The description of the job post
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,2000}$'
 *            minLength: 1
 *            maxLength: 2000
 *            example: 'Example description'
 *          salary:
 *            description: Salary of the job post
 *            type: string
 *            pattern: '^\d{1,6}(\.\d{0,3})?$'
 *            example: '1234.122'
 *          location:
 *            description: Location of the job
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,80}$'
 *            minLength: 1
 *            maxLength: 80
 *            example: 'Milan'
 *          published:
 *            description: True if the job post is public
 *            type: boolean
 *            example: true
 *          authorId:
 *            description: The identification of the job post author
 *            type: string
 *            example: 'cl5kt7g1005015nbfqoos7lgs'
 */
export type JobType = {
  id: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  published: boolean;
  authorId: string;
};

/**
 *  @swagger
 *  components:
 *    schemas:
 *      JobAppCountType:
 *        description: Information about the job and the application number
 *        type: object
 *        required:
 *          - job
 *          - appCount
 *        properties:
 *          job:
 *            $ref: '#/components/schemas/JobType'
 *          appCount:
 *            description: The application number
 *            type: integer
 *            format: int32
 *            example: 10
 */
export type JobAppCountType = {
  job: JobType;
  appCount: number;
};

/**
 *  @swagger
 *  components:
 *    schemas:
 *      JobAuthorAppCountType:
 *        description: Information about the job, the job post author and the application number
 *        type: object
 *        required:
 *          - job
 *          - author
 *          - appCount
 *        properties:
 *          job:
 *            $ref: '#/components/schemas/JobType'
 *          author:
 *            $ref: '#/components/schemas/UserType'
 *          appCount:
 *            description: The application number
 *            type: integer
 *            format: int32
 *            example: 10
 */
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
  if (typeof take != 'undefined') {
    if (take < minimumTakeRecordNumber) {
      throw new ParameterFormatError(
        `Parameter not in range: take ${take}`,
        minimumValueErrorCode,
        new Error().stack,
      );
    } else if (take > maximumTakeRecordNumber) {
      throw new ParameterFormatError(
        `Parameter not in range: take ${take}`,
        maximumValueErrorCode,
        new Error().stack,
      );
    }
  }
  let published: boolean;
  if (typeof onlyPublished === 'undefined' || onlyPublished === 'true') {
    published = true;
  } else if (onlyPublished === 'false') {
    published = false;
  } else {
    throw new ParameterFormatError(
      `Parameter not correct: published ${onlyPublished}`,
      sizeErrorCode,
      new Error().stack,
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
        updatedAt: job.updatedAt.toISOString(),
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

/**
 *  @swagger
 *  components:
 *    schemas:
 *      CreateJobType:
 *        description: Information about the job to be created
 *        type: object
 *        required:
 *          - title
 *          - description
 *          - salary
 *          - location
 *          - published
 *        properties:
 *          title:
 *            description: The title of the job post
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,80}$'
 *            minLength: 1
 *            maxLength: 80
 *            example: 'Example title'
 *          description:
 *            description: The description of the job post
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,2000}$'
 *            minLength: 1
 *            maxLength: 2000
 *            example: 'Example description'
 *          salary:
 *            description: Salary of the job post
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,80}$'
 *            example: '1234.122'
 *          location:
 *            description: Location of the job
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,2000}$'
 *            minLength: 1
 *            maxLength: 80
 *            example: 'Milan'
 *          published:
 *            description: True if the job post is public
 *            type: boolean
 *            example: true
 */
export async function createJob(
  prisma: PrismaClient,
  jobAuthorId: string,
  title: string,
  description: string,
  salary: string,
  location: string,
  onlyPublished?: string,
) {
  if (title.length > jobTitleMaxSize) {
    throw new ParameterFormatError(
      `Parameter not correct: title size ${title.length} too long`,
      sizeErrorCode,
      new Error().stack,
    );
  }
  if (title.length < jobTitleMinSize) {
    throw new ParameterFormatError(
      `Parameter not correct: title size ${title.length} too short`,
      sizeErrorCode,
      new Error().stack,
    );
  }
  if (!patternJobTitle.test(title)) {
    throw new ParameterFormatError(
      `Parameter not correct: title ${title}`,
      formatErrorCode,
      new Error().stack,
    );
  }
  if (description.length > jobDescriptionMaxSize) {
    throw new ParameterFormatError(
      `Parameter not correct: description ${description.length} too long`,
      sizeErrorCode,
      new Error().stack,
    );
  }
  if (description.length < jobDescriptionMinSize) {
    throw new ParameterFormatError(
      `Parameter not correct: description ${description.length} too short`,
      sizeErrorCode,
      new Error().stack,
    );
  }
  if (!patternJobDescription.test(description)) {
    throw new ParameterFormatError(
      `Parameter not correct: description ${description}`,
      formatErrorCode,
      new Error().stack,
    );
  }
  if (!patternDecimal.test(salary)) {
    throw new ParameterFormatError(
      `Parameter not correct: salary ${salary}`,
      formatErrorCode,
      new Error().stack,
    );
  }
  if (location.length > jobLocationMaxSize) {
    throw new ParameterFormatError(
      `Parameter not correct: location size ${location.length} too long`,
      sizeErrorCode,
      new Error().stack,
    );
  }
  if (location.length < jobLocationMinSize) {
    throw new ParameterFormatError(
      `Parameter not correct: location size ${location.length} too short`,
      sizeErrorCode,
      new Error().stack,
    );
  }
  if (!patternJobLocation.test(location)) {
    throw new ParameterFormatError(
      `Parameter not correct: location ${location}`,
      formatErrorCode,
      new Error().stack,
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
      new Error().stack,
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
    updatedAt: queryResult.updatedAt.toISOString(),
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
    throw new ParameterFormatError(
      `Parameter not correct: jobId ${jobId}`,
      formatErrorCode,
      new Error().stack,
    );
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
      updatedAt: queryResult.updatedAt.toISOString(),
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

/**
 *  @swagger
 *  components:
 *    schemas:
 *      UpdateJobType:
 *        description: Information about the job to be updated
 *        type: object
 *        properties:
 *          title:
 *            description: The title of the job post
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,80}$'
 *            minLength: 1
 *            maxLength: 80
 *            example: 'Example title'
 *          description:
 *            description: The description of the job post
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,2000}$'
 *            minLength: 1
 *            maxLength: 2000
 *            example: 'Example description'
 *          salary:
 *            description: Salary of the job post
 *            type: string
 *            pattern: '^\d{1,6}(\.\d{0,3})?$'
 *            example: '1234.122'
 *          location:
 *            description: Location of the job
 *            type: string
 *            pattern: '^[\s\w\d\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{1,80}$'
 *            minLength: 1
 *            maxLength: 80
 *            example: 'Milan'
 *          published:
 *            description: True if the job post is public
 *            type: boolean
 *            example: true
 */
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
    throw new ParameterFormatError(
      `Parameter not correct: jobId ${jobId}`,
      formatErrorCode,
      new Error().stack,
    );
  }
  if (typeof title === 'string') {
    if (title.length > jobTitleMaxSize) {
      throw new ParameterFormatError(
        `Parameter not correct: title size ${title.length} too long`,
        sizeErrorCode,
        new Error().stack,
      );
    }
    if (title.length < jobTitleMinSize) {
      throw new ParameterFormatError(
        `Parameter not correct: title size ${title.length} too short`,
        sizeErrorCode,
        new Error().stack,
      );
    }
    if (!patternJobTitle.test(title)) {
      throw new ParameterFormatError(
        `Parameter not correct: title ${title}`,
        formatErrorCode,
        new Error().stack,
      );
    }
  }
  if (typeof description === 'string') {
    if (description.length > jobDescriptionMaxSize) {
      throw new ParameterFormatError(
        `Parameter not correct: description ${description.length} too long`,
        sizeErrorCode,
        new Error().stack,
      );
    }
    if (description.length < jobDescriptionMinSize) {
      throw new ParameterFormatError(
        `Parameter not correct: description ${description.length} too short`,
        sizeErrorCode,
        new Error().stack,
      );
    }
    if (!patternJobDescription.test(description)) {
      throw new ParameterFormatError(
        `Parameter not correct: description ${description}`,
        formatErrorCode,
        new Error().stack,
      );
    }
  }
  if (typeof salary === 'string' && !patternDecimal.test(salary)) {
    throw new ParameterFormatError(
      `Parameter not correct: salary ${salary}`,
      formatErrorCode,
      new Error().stack,
    );
  }
  if (typeof location === 'string') {
    if (location.length > jobLocationMaxSize) {
      throw new ParameterFormatError(
        `Parameter not correct: location size ${location.length} too long`,
        sizeErrorCode,
        new Error().stack,
      );
    }
    if (location.length < jobLocationMinSize) {
      throw new ParameterFormatError(
        `Parameter not correct: location size ${location.length} too short`,
        sizeErrorCode,
        new Error().stack,
      );
    }
    if (!patternJobLocation.test(location)) {
      throw new ParameterFormatError(
        `Parameter not correct: location ${location} too long`,
        formatErrorCode,
        new Error().stack,
      );
    }
  }
  let published: boolean | undefined;
  if (typeof onlyPublished === 'undefined') {
    published = onlyPublished;
  } else if (onlyPublished === 'false') {
    published = false;
  } else if (onlyPublished === 'true') {
    published = true;
  } else {
    throw new ParameterFormatError(
      `Parameter not correct: published ${published}`,
      sizeErrorCode,
      new Error().stack,
    );
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
    updatedAt: queryResult.updatedAt.toISOString(),
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
    throw new ParameterFormatError(
      `Parameter not correct: jobId ${jobId}`,
      formatErrorCode,
      new Error().stack,
    );
  }
  return await prisma.job.delete({
    where: {
      id: jobId,
    },
  });
}
