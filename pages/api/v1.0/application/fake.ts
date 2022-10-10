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
    applications.push({
      coverLetter: faker.lorem.paragraphs().slice(0, appCoverLetterMaxSize),
      jobId: job.job.id,
      jobAuthorId: workerUsers[Math.floor(Math.random() * workerUsers.length)].id,
    });
  });
  return applications;
}

/**
 *  @swagger
 *  /api/v1.0/application:
 *    post:
 *      description: Create new fake applications related to related to first
 *                   `number` WORKER users and first `number` job posts.
 *      operationId: addApplication
 *      requestBody:
 *        description: The information to create new application
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/CreateApplicationType'
 *      responses:
 *        '200':
 *          description: The operation is performed correctly
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApplicationType'
 */
const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (!session) {
    throw new HttpError('Not logged in', noLoggedInErrorCode, 401);
  }
  const user = await getUser(prisma, session.user.id);
  if (typeof user === 'undefined' || user.role !== Role.ADMIN) {
    throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405);
  }
  switch (req.method) {
    case 'POST': {
      if (typeof req.body.number !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: number ${req.body.number}`,
          formatErrorCode,
        );
      }
      const [workerUsers, jobs] = await Promise.all([
        getUsersRole(prisma, Role.WORKER, parseInt(req.body.number)),
        getJobs(prisma, 'true', undefined, parseInt(req.body.number)),
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
      res.status(201).end();
      return;
    }
  }
  throw new HttpError('Metod not implemented', metodNotImplementedErrorCode, 501);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
