import prisma from 'lib/server/database/prisma';
import { getJobApplications } from 'lib/server/database/applicationManage';
import { getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { Role } from '@prisma/client';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { getJob } from 'lib/server/database/jobManage';
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
 *  /api/v1.0/job/{id}/applications:
 *    get:
 *      description: Return the information about the applications related to the job post
 *                   identified by a `id` limited by 'take' parameter and starting
 *                   from 'cursor' parameter. Only the user with
 *                   COMPANY role and owner of post can send it.
 *      operationId: getApplicationsJobWithId
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *            format: int32
 *          description: Job post identification
 *          example: 10
 *        - in: query
 *          name: take
 *          schema:
 *            type: integer
 *            format: int32
 *            minimum: 1
 *            maximum: 1000
 *            default: 10
 *          description: Number of records to be received.
 *          example: 10
 *        - in: query
 *          name: cursor
 *          schema:
 *            type: integer
 *            format: int32
 *          description: The identification of the starting point element from which to start.
 *          example: 10
 *      responses:
 *        '200':
 *          description: Return the information about the applications related to the job post
 *                       identified by a `id`.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/ApplicationAuthorType'
 */
const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (typeof req.query.id !== 'string') {
    throw new ParameterFormatError(`Parameter not correct: id ${req.query.id}`, formatErrorCode);
  }
  if (!session) {
    throw new HttpError('Not logged in', noLoggedInErrorCode, 401);
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
    throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405);
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
  throw new HttpError('Metod not implemented', metodNotImplementedErrorCode, 501);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
