import { PrismaClient } from '@prisma/client';
import {
  formatErrorCode,
  maximumValueErrorCode,
  minimumValueErrorCode,
  ParameterFormatError,
  sizeErrorCode,
} from 'lib/exceptions/ParameterFormatError';
import {
  appCoverLetterMaxSize,
  maximumTakeRecordNumber,
  minimumTakeRecordNumber,
  patternAppCoverLetter,
} from 'lib/regexPattern';

import type { UserType } from 'lib/server/database/userManage';
import type { JobType } from 'lib/server/database/jobManage';

/**
 *  @swagger
 *  components:
 *    schemas:
 *      ApplicationType:
 *        description: Information about the application
 *        type: object
 *        required:
 *          - id
 *          - createdAt
 *          - updatedAt
 *          - coverLetter
 *          - jobId
 *          - authorId
 *        properties:
 *          id:
 *            description: The identification of the application
 *            type: integer
 *            format: int32
 *            example: 10
 *          createdAt:
 *            description: Date and time when the application was created
 *            type: string
 *            format: date-time
 *            example: '2017-07-21T17:32:28Z'
 *          updatedAt:
 *            description: Date and time when the application was updated
 *            type: string
 *            format: date-time
 *            example: '2017-07-21T17:32:28Z'
 *          coverLetter:
 *            description: The cover letter of the application
 *            type: string
 *            maxLength: 1000
 *            example: 'Example cover letter'
 *          jobId:
 *            description: The identification of the job post
 *            type: integer
 *            format: int32
 *            example: 10
 *          authorId:
 *            description: The identification of the application author
 *            type: string
 *            example: 'cl5kt7g1005015nbfqoos7lgs'
 */
export type ApplicationType = {
  id: number;
  createdAt: string;
  updatedAt: string;
  coverLetter: String;
  jobId: number;
  authorId: string;
};

/**
 *  @swagger
 *  components:
 *    schemas:
 *      ApplicationAuthorType:
 *        description: Information about the application and its author
 *        type: object
 *        required:
 *          - application
 *          - author
 *        properties:
 *          application:
 *            $ref: '#/components/schemas/ApplicationType'
 *          author:
 *            $ref: '#/components/schemas/UserType'
 */
export type ApplicationAuthorType = {
  application: ApplicationType;
  author: UserType;
};

/**
 *  @swagger
 *  components:
 *    schemas:
 *      ApplicationJobType:
 *        description: Information about the application and the job post related
 *        type: object
 *        required:
 *          - application
 *          - job
 *        properties:
 *          application:
 *            $ref: '#/components/schemas/ApplicationType'
 *          job:
 *            $ref: '#/components/schemas/JobType'
 */
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
  if (typeof take != 'undefined') {
    if (take < minimumTakeRecordNumber) {
      throw new ParameterFormatError(`Parameter not in range: take ${take}`, minimumValueErrorCode);
    } else if (take > maximumTakeRecordNumber) {
      throw new ParameterFormatError(`Parameter not in range: take ${take}`, maximumValueErrorCode);
    }
  }
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
        updatedAt: application.updatedAt.toISOString(),
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
  if (typeof take != 'undefined') {
    if (take < minimumTakeRecordNumber) {
      throw new ParameterFormatError(`Parameter not in range: take ${take}`, minimumValueErrorCode);
    } else if (take > maximumTakeRecordNumber) {
      throw new ParameterFormatError(`Parameter not in range: take ${take}`, maximumValueErrorCode);
    }
  }
  const queryResult = await prisma.application.findMany({
    include: {
      job: {
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
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
        updatedAt: application.updatedAt.toISOString(),
        coverLetter: application.coverLetter,
        jobId: application.jobId,
        authorId: application.authorId,
      },
      job: {
        id: application.job.id,
        createdAt: application.job.createdAt.toISOString(),
        updatedAt: application.job.updatedAt.toISOString(),
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

/**
 *  @swagger
 *  components:
 *    schemas:
 *      CreateApplicationType:
 *        description: Information about the application to be created
 *        type: object
 *        required:
 *          - coverLetter
 *          - jobId
 *        properties:
 *          coverLetter:
 *            description: The cover letter of the application
 *            type: string
 *            maxLength: 1000
 *            example: 'Example cover letter'
 *          jobId:
 *            description: The identification of the job post
 *            type: integer
 *            format: int32
 *            example: 10
 */
export async function createApplication(
  prisma: PrismaClient,
  coverLetter: string,
  jobId: number,
  jobAuthorId: string,
) {
  if (coverLetter.length > appCoverLetterMaxSize) {
    throw new ParameterFormatError(
      `Parameter not correct: coverLetter size ${coverLetter.length} too long`,
      sizeErrorCode,
    );
  }
  if (!patternAppCoverLetter.test(coverLetter)) {
    throw new ParameterFormatError(
      `Parameter not correct: coverLetter ${coverLetter}`,
      formatErrorCode,
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
    updatedAt: queryResult.updatedAt.toISOString(),
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
    updatedAt: queryResult.updatedAt.toISOString(),
    coverLetter: queryResult.coverLetter,
    jobId: queryResult.jobId,
    authorId: queryResult.authorId,
  } as ApplicationType;
}

/**
 *  @swagger
 *  components:
 *    schemas:
 *      UpdateApplicationType:
 *        description: Information about the application to be updated
 *        type: object
 *        properties:
 *          coverLetter:
 *            description: The cover letter of the application
 *            type: string
 *            maxLength: 1000
 *            example: 'Example cover letter'
 */
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
  if (typeof coverLetter === 'string') {
    if (coverLetter.length > appCoverLetterMaxSize) {
      throw new ParameterFormatError(
        `Parameter not correct: coverLetter size ${coverLetter.length} too long`,
        sizeErrorCode,
      );
    }
    if (!patternAppCoverLetter.test(coverLetter)) {
      throw new ParameterFormatError(
        `Parameter not correct: coverLetter ${coverLetter}`,
        formatErrorCode,
      );
    }
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
    updatedAt: queryResult.updatedAt.toISOString(),
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
