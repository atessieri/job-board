import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { Role } from '@prisma/client';
import { createApplication } from 'lib/server/database/applicationManage';
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
 *  /api/v1.0/application:
 *    post:
 *      description: Create new application related to the job post. Only the user
 *                   with WORKER role can send it and only one time per post.
 *      operationId: addApplication
 *      tags:
 *        - Application management
 *      requestBody:
 *        description: The information to create new application
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/CreateApplicationType'
 *      responses:
 *        '201':
 *          description: The operation is performed correctly
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApplicationType'
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
    throw new HttpError('Not logged in', noLoggedInErrorCode, 401, new Error().stack);
  }
  const user = await getUser(prisma, session.user.id);
  if (typeof user === 'undefined' || user.role !== Role.WORKER) {
    throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
  }
  switch (req.method) {
    case 'POST': {
      if (typeof req.body.jobId !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: jobId ${req.body.jobId}`,
          formatErrorCode,
          new Error().stack,
        );
      }
      if (typeof req.body.coverLetter !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: coverLetter ${req.body.coverLetter}`,
          formatErrorCode,
          new Error().stack,
        );
      }
      const application = await createApplication(
        prisma,
        req.body.coverLetter,
        req.body.jobId,
        session.user.id,
      );
      return res.status(201).json(application);
    }
  }
  throw new HttpError(
    'Metod not implemented',
    metodNotImplementedErrorCode,
    501,
    new Error().stack,
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await apiHandler(req, res, callbackHandler);
}
