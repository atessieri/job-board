import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { Role } from '@prisma/client';
import { getJob } from 'lib/server/database/jobManage';
import {
  deleteApplication,
  getApplication,
  updateApplication,
} from 'lib/server/database/applicationManage';

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
  const [user, application] = await Promise.all([
    getUser(prisma, session.user.id),
    getApplication(prisma, parseInt(req.query.id)),
  ]);
  if (typeof user === 'undefined' || typeof application === 'undefined') {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  switch (req.method) {
    case 'GET': {
      switch (user.role) {
        case Role.WORKER:
          if (session.user.id !== application.authorId) {
            return res.status(405).json({ message: 'Metod not allowed' });
          }
          break;
        case Role.COMPANY:
          const job = await getJob(prisma, application.jobId);
          if (typeof application === 'undefined' || session.user.id !== job?.job.authorId) {
            return res.status(405).json({ message: 'Metod not allowed' });
          }
          break;
        default:
          return res.status(405).json({ message: 'Metod not allowed' });
      }
      return res.status(200).json(application);
    }
    case 'PUT': {
      if (user.role !== Role.WORKER || session.user.id !== application.authorId) {
        return res.status(405).json({ message: 'Metod not allowed' });
      }
      const applicationUpdated = await updateApplication(
        prisma,
        parseInt(req.query.id),
        req.body.coverLetter,
      );
      return res.status(200).json(applicationUpdated);
    }
    case 'DELETE': {
      if (user.role !== Role.WORKER || session.user.id !== application.authorId) {
        return res.status(405).json({ message: 'Metod not allowed' });
      }
      await deleteApplication(prisma, parseInt(req.query.id));
      res.status(200).end();
      return;
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
