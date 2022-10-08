import prisma from 'lib/server/database/prisma';
import { getUser, getUsersRole } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';
import { jobDescriptionMaxSize, jobLocationMaxSize, jobTitleMaxSize } from 'lib/regexPattern';
import { createJob } from 'lib/server/database/jobManage';

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
 *      parameters:
 *        - in: query
 *          name: number
 *          required: true
 *          schema:
 *            type: integer
 *            format: int32
 *            minimum: 1
 *            maximum: 1000
 *            default: 10
 *          description: Number of fake records to be created.
 *          example: 10
 *      responses:
 *        '201':
 *          description: The operation is performed correctly
 */
const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (!session) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  const user = await getUser(prisma, session.user.id);
  if (typeof user === 'undefined' || user.role !== Role.ADMIN) {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  switch (req.method) {
    case 'POST': {
      if (typeof req.body.number !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: number ${req.body.number}`,
          formatErrorCode,
        );
      }
      const companyUsers = await getUsersRole(prisma, Role.COMPANY, parseInt(req.body.number));
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
      res.status(201).end();
      return;
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
