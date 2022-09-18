import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { Role } from '@prisma/client';
import { deleteJob, getJob, updateJob } from 'lib/server/database/jobManage';

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
  switch (req.method) {
    case 'GET': {
      const job = getJob(prisma, parseInt(req.query.id));
      return res.status(200).json(job);
    }
    case 'PUT': {
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
      const jobUpdated = await updateJob(
        prisma,
        parseInt(req.query.id),
        req.body.title,
        req.body.description,
        req.body.salary,
        req.body.location,
        req.body.published,
      );
      return res.status(200).json(jobUpdated);
    }
    case 'DELETE': {
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
      await deleteJob(prisma, parseInt(req.query.id));
      res.status(200).end();
      return;
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
