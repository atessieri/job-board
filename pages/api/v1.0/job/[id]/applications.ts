import prisma from 'lib/server/database/prisma';
import { getJobApplications } from 'lib/server/database/applicationManage';
import { getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { Role } from '@prisma/client';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { getJob } from 'lib/server/database/jobManage';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (typeof req.query.id !== 'string') {
    throw new ParameterFormatError(`Parameter not correct: id ${req.query.id}`, formatErrorCode);
  }
  if (!session) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  const [user, job] = await Promise.all([
    getUser(prisma, session.user.id),
    getJob(prisma, parseInt(req.query.id)),
  ]);
  if (
    typeof user === 'undefined' ||
    user.role !== Role.COMPANY ||
    typeof job === 'undefined' ||
    session.user.id !== job.job.authorId
  ) {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  switch (req.method) {
    case 'GET': {
      const applications = await getJobApplications(
        prisma,
        parseInt(req.query.id),
        typeof req.query.take === 'string' ? parseInt(req.query.take) : undefined,
        typeof req.query.cursor === 'string' ? parseInt(req.query.cursor) : undefined,
      );
      return res.status(200).json(applications);
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
