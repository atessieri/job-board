import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { createJob } from 'lib/server/database/jobManage';
import { Role } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (!session) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  const user = await getUser(prisma, session.user.id);
  if (typeof user === 'undefined' || user.role !== Role.COMPANY) {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  switch (req.method) {
    case 'POST': {
      if (typeof req.body.title !== 'string') {
        throw new ParameterFormatError(`Parameter not correct: title undefined`, formatErrorCode);
      }
      if (typeof req.body.description !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: description undefined`,
          formatErrorCode,
        );
      }
      if (typeof req.body.salary !== 'string') {
        throw new ParameterFormatError(`Parameter not correct: salary undefined`, formatErrorCode);
      }
      if (typeof req.body.location !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: location undefined`,
          formatErrorCode,
        );
      }
      if (typeof req.body.published !== 'undefined' && typeof req.body.published !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: published undefined`,
          formatErrorCode,
        );
      }
      const job = createJob(
        prisma,
        session.user.id,
        req.body.title,
        req.body.description,
        req.body.salary,
        req.body.location,
        req.body.published,
      );
      return res.status(201).json(job);
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
