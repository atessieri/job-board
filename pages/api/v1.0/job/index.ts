import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { createJob } from 'lib/server/database/jobManage';
import { Role } from '@prisma/client';
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
 *  /api/v1.0/job:
 *    post:
 *      description: Create new job post. Only the user
 *                   with COMPANY role can send it.
 *      operationId: addJobPost
 *      tags:
 *        - Job post management
 *      requestBody:
 *        description: The information to create new job post
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/CreateJobType'
 *      responses:
 *        '201':
 *          description: The operation is performed correctly
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/JobType'
 *        '400':
 *          description: The parameter error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '401':
 *          description: No any login has been performed
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '405':
 *          description: The function cannot be used with current access rights
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '500':
 *          description: Internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '501':
 *          description: The function isn't implemented
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
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
  if (typeof user === 'undefined' || user.role !== Role.COMPANY) {
    throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405);
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
  throw new HttpError('Metod not implemented', metodNotImplementedErrorCode, 501);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
