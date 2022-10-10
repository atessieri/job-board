import apiHandler from 'lib/server/apiHandler';
import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import { Role } from '@prisma/client';
import { cleanDatabase } from 'lib/server/database/utility';
import {
  HttpError,
  metodNotAllowedErrorCode,
  metodNotImplementedErrorCode,
  noLoggedInErrorCode,
} from 'lib/exceptions/HttpError';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

/**
 *  @swagger
 *  /api/v1.0/clean:
 *    delete:
 *      description: Remove every applications, jobs and users except the current one.
 *                   Only the user with ADMIN role can send it.
 *      operationId: getClean
 *      responses:
 *        '200':
 *          description: The operation is performed correctly
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
    case 'DELETE': {
      await cleanDatabase(prisma, session.user.id);
      res.status(200).end();
      return;
    }
  }
  throw new HttpError('Metod not implemented', metodNotImplementedErrorCode, 501);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
