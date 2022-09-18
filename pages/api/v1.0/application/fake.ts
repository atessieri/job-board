import prisma from 'lib/server/database/prisma';
import { getUser, getUsersRole } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';
import { appCoverLetterMaxSize } from 'lib/regexPattern';
import { getJobs, JobAuthorAppCountType } from 'lib/server/database/jobManage';
import { createApplication } from 'lib/server/database/applicationManage';

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
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
