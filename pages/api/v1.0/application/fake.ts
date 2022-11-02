import prisma from 'lib/server/database/prisma';
import { getUser, getUsersRole } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';
import { appCoverLetterMaxSize } from 'lib/regexPattern';
import { getJobs, JobAuthorAppCountType } from 'lib/server/database/jobManage';
import { createApplication } from 'lib/server/database/applicationManage';
import {
  HttpError,
  metodNotAllowedErrorCode,
  metodNotImplementedErrorCode,
  noLoggedInErrorCode,
} from 'lib/exceptions/HttpError';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';
import type { UserType } from 'lib/server/database/userManage';

type ApplicationFake = {
  coverLetter: string;
  jobId: number;
  jobAuthorId: string;
};

function createFakeApplications(workerUsers: UserType[], jobs: JobAuthorAppCountType[]) {
  let applications: ApplicationFake[] = [];
  jobs.forEach((job) => {
    if (job.appCount === 0) {
      applications.push({
        coverLetter: faker.lorem.paragraphs().slice(0, appCoverLetterMaxSize),
        jobId: job.job.id,
        jobAuthorId: workerUsers[Math.floor(Math.random() * workerUsers.length)].id,
      });
    }
  });
  return applications;
}

/**
 *  @swagger
 *  /api/v1.0/application/fake:
 *    post:
 *      description: Create new fake applications related to related to first
 *                   `number` WORKER users and first `number` job posts.
 *      operationId: addFakeApplication
 *      tags:
 *        - Data management
 *      requestBody:
 *        description: Number of fake records to be created.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - number
 *              properties:
 *                number:
 *                  type: integer
 *                  format: int32
 *                  minimum: 1
 *                  maximum: 1000
 *                  default: 10
 *                  example: 10
 *      responses:
 *        '200':
 *          description: The operation is performed correctly
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - number
 *                properties:
 *                  number:
 *                    type: integer
 *                    format: int32
 *                    example: 10
 *        '400':
 *          description: The parameter error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '401':
 *          description: No any login has been performed
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '405':
 *          description: The function cannot be used with current access rights
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '500':
 *          description: Internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '501':
 *          description: The function isn't implemented
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 */
const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (!session) {
    throw new HttpError('Not logged in', noLoggedInErrorCode, 401, new Error().stack);
  }
  const user = await getUser(prisma, session.user.id);
  if (typeof user === 'undefined' || user.role !== Role.ADMIN) {
    throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
  }
  switch (req.method) {
    case 'POST': {
      if (typeof req.body.number !== 'number') {
        throw new ParameterFormatError(
          `Parameter not correct: number ${req.body.number}`,
          formatErrorCode,
          new Error().stack,
        );
      }
      const [workerUsers, jobs] = await Promise.all([
        getUsersRole(prisma, Role.WORKER, req.body.number),
        getJobs(prisma, 'true', undefined, req.body.number),
      ]);
      const applications = createFakeApplications(workerUsers, jobs);
      if (applications.length > 0) {
        await Promise.all(
          applications.map((application) =>
            createApplication(
              prisma,
              application.coverLetter,
              application.jobId,
              application.jobAuthorId,
            ),
          ),
        );
      }
      return res.status(201).json({
        number: applications.length,
      });
    }
  }
  throw new HttpError(
    'Metod not implemented',
    metodNotImplementedErrorCode,
    501,
    new Error().stack,
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await apiHandler(req, res, callbackHandler);
}
