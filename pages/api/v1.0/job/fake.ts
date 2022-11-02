import prisma from 'lib/server/database/prisma';
import { getUser, getUsersRole } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';
import { jobDescriptionMaxSize, jobLocationMaxSize, jobTitleMaxSize } from 'lib/regexPattern';
import { createJob } from 'lib/server/database/jobManage';
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

type JobFake = {
  jobAuthorId: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  onlyPublished: string;
};

function createFakeJobs(companyUsers: UserType[]) {
  let jobs: JobFake[] = [];
  companyUsers.forEach((user) => {
    jobs.push({
      jobAuthorId: user.id,
      title: faker.company.catchPhrase().slice(0, jobTitleMaxSize),
      description: faker.lorem.paragraphs().slice(0, jobDescriptionMaxSize),
      salary: faker.commerce.price(1000, 6000),
      location: faker.address.cityName().slice(0, jobLocationMaxSize),
      onlyPublished: Math.random() < 0.5 ? 'false' : 'true',
    });
  });
  return jobs;
}

/**
 *  @swagger
 *  /api/v1.0/job/fake:
 *    post:
 *      description: Create fake job related to first `number` COMPANY users. Only the user
 *                   with ADMIN role can send it.
 *      operationId: addFakeJobs
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
 *        '201':
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
      const companyUsers = await getUsersRole(prisma, Role.COMPANY, req.body.number);
      const jobs = createFakeJobs(companyUsers);
      if (jobs.length > 0) {
        await Promise.all(
          jobs.map((job) =>
            createJob(
              prisma,
              job.jobAuthorId,
              job.title,
              job.description,
              job.salary,
              job.location,
              job.onlyPublished,
            ),
          ),
        );
      }
      return res.status(201).json({
        number: jobs.length,
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
