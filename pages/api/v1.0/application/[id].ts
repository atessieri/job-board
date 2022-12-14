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
 *  /api/v1.0/application/{id}:
 *    get:
 *      description: Return the information about the job post
 *                   identified by a `id`. Only the WORKER applied or
 *                   the COMPANY published the jop post.
 *      operationId: getApplicationithId
 *      tags:
 *        - Application management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *            format: int32
 *          description: Application identification
 *          example: 10
 *      responses:
 *        '200':
 *          description: Return the information about the application
 *                       identified by a `id`.
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
 *    put:
 *      description: Update the information of the application identified
 *                   by a `id`. Only the WORKER applied can send it.
 *      operationId: updateApplicationWithId
 *      tags:
 *        - Application management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *            format: int32
 *          description: Application identification
 *          example: 10
 *      requestBody:
 *        description: The information to update the application
 *                     identified by a `id`.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/UpdateApplicationType'
 *      responses:
 *        '200':
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
 *    delete:
 *      description: Remove the application identified
 *                   by a `id`. Only the WORKER applied can send it.
 *      operationId: deleteApplicationWithId
 *      tags:
 *        - Application management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *            format: int32
 *          description: Application identification
 *          example: 10
 *      responses:
 *        '200':
 *          description: The operation is performed correctly
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
  if (typeof req.query.id !== 'string') {
    throw new ParameterFormatError(
      `Parameter not correct: id ${req.query.id}`,
      formatErrorCode,
      new Error().stack,
    );
  }
  if (!session) {
    throw new HttpError('Not logged in', noLoggedInErrorCode, 401, new Error().stack);
  }
  const [user, application] = await Promise.all([
    getUser(prisma, session.user.id),
    getApplication(prisma, parseInt(req.query.id)),
  ]);
  if (typeof user === 'undefined' || typeof application === 'undefined') {
    throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
  }
  switch (req.method) {
    case 'GET': {
      switch (user.role) {
        case Role.WORKER:
          if (session.user.id !== application.authorId) {
            throw new HttpError(
              'Metod not allowed',
              metodNotAllowedErrorCode,
              405,
              new Error().stack,
            );
          }
          break;
        case Role.COMPANY:
          const job = await getJob(prisma, application.jobId);
          if (typeof application === 'undefined' || session.user.id !== job?.job.authorId) {
            throw new HttpError(
              'Metod not allowed',
              metodNotAllowedErrorCode,
              405,
              new Error().stack,
            );
          }
          break;
        default:
          throw new HttpError(
            'Metod not allowed',
            metodNotAllowedErrorCode,
            405,
            new Error().stack,
          );
      }
      return res.status(200).json(application);
    }
    case 'PUT': {
      if (user.role !== Role.WORKER || session.user.id !== application.authorId) {
        throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
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
        throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
      }
      await deleteApplication(prisma, parseInt(req.query.id));
      res.status(200).end();
      return;
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
