import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { Role } from '@prisma/client';
import { createApplication } from 'lib/server/database/applicationManage';

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
  if (typeof user === 'undefined' || user.role !== Role.WORKER) {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  switch (req.method) {
    case 'POST': {
      if (typeof req.body.jobId !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: jobId ${req.body.jobId}`,
          formatErrorCode,
        );
      }
      if (typeof req.body.coverLetter !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: coverLetter ${req.body.coverLetter}`,
          formatErrorCode,
        );
      }
      const application = createApplication(
        prisma,
        req.body.coverLetter,
        req.body.jobId,
        session.user.id,
      );
      return res.status(201).json(application);
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
