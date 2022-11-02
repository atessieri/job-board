import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { Role } from '@prisma/client';
import { deleteJob, getJob, updateJob } from 'lib/server/database/jobManage';
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
 *  /api/v1.0/job/{id}:
 *    get:
 *      description: Return the information about the job post
 *                   identified by a `id`.  Everybody can send it.
 *      operationId: getJobWithId
 *      security: []
 *      tags:
 *        - Job post management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *            format: int32
 *          description: Job post identification
 *          example: 10
 *      responses:
 *        '200':
 *          description: Return the information about the job post
 *                       identified by a `id`.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/JobAppCountType'
 *        '400':
 *          description: The parameter error
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
 *      description: Update the information of the job identified
 *                   by a `id`. Only the user with
 *                   COMPANY role and owner of post can send it.
 *      operationId: updateJobWithId
 *      tags:
 *        - Job post management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *            format: int32
 *          description: Job post identification
 *          example: 10
 *      requestBody:
 *        description: The information to update the job
 *                     identified by a `id`.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/UpdateJobType'

 *      responses:
 *        '200':
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
 *    delete:
 *      description: Remove the information of the job identified
 *                   by a `id`. Only the user with
 *                   COMPANY role and owner of post can send it.
 *      operationId: deleteJobWithId
 *      tags:
 *        - Job post management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *            format: int32
 *          description: Job post identification
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
  switch (req.method) {
    case 'GET': {
      const job = await getJob(prisma, parseInt(req.query.id));
      return res.status(200).json(job);
    }
    case 'PUT': {
      if (!session) {
        throw new HttpError('Not logged in', noLoggedInErrorCode, 401, new Error().stack);
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
        throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
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
        throw new HttpError('Not logged in', noLoggedInErrorCode, 401, new Error().stack);
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
        throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
      }
      await deleteJob(prisma, parseInt(req.query.id));
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
