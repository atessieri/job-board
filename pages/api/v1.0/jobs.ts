import apiHandler from 'lib/server/apiHandler';
import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import { getJobs } from 'lib/server/database/jobManage';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { Role } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  let onlyPublished: string | undefined;
  if (!session) {
    onlyPublished = 'true';
  } else {
    const user = await getUser(prisma, session.user.id);
    if (
      typeof user === 'undefined' ||
      user.role !== Role.COMPANY ||
      session.user.id !== req.query.id
    ) {
      onlyPublished = 'true';
    } else if (
      typeof req.query.onlyPublished === 'undefined' ||
      typeof req.query.onlyPublished === 'string'
    ) {
      onlyPublished = req.query.onlyPublished;
    } else {
      throw new ParameterFormatError(
        `Parameter not correct: onlyPublished ${req.query.onlyPublished}`,
        formatErrorCode,
      );
    }
  }
  switch (req.method) {
    case 'GET': {
      const jobs = await getJobs(
        prisma,
        onlyPublished,
        undefined,
        typeof req.query.take === 'string' ? parseInt(req.query.take) : undefined,
        typeof req.query.cursor === 'string' ? parseInt(req.query.cursor) : undefined,
      );
      return res.status(200).json(jobs);
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
