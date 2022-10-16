import apiHandler from 'lib/server/apiHandler';
import prisma from 'lib/server/database/prisma';
import { getUser } from 'lib/server/database/userManage';
import { getJobs } from 'lib/server/database/jobManage';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { Role } from '@prisma/client';
import { HttpError, metodNotImplementedErrorCode } from 'lib/exceptions/HttpError';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

/**
 *  @swagger
 *  /api/v1.0/user/{id}/jobs:
 *    get:
 *      description: Return a list of job posts published by the user
 *                   identified by an `id` limited by the 'take' parameter
 *                   and starting from the 'cursor' parameter. If the `id`
 *                   is the same as the current user id and it is a
 *                   COMPANY as the role the job posts returned are published
 *                   and private. Everybody can send it.
 *      operationId: getJobsWithId
 *      security: []
 *      tags:
 *        - Job post management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *          description: User identification
 *          example: 'cl5kt7g1005015nbfqoos7lgs'
 *        - in: query
 *          name: take
 *          schema:
 *            type: integer
 *            format: int32
 *            minimum: 1
 *            maximum: 1000
 *            default: 10
 *            example: 10
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
 *          description: List of job posts published with the post author information
 *                       and the application counter
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/JobAuthorAppCountType'
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
 */
const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (typeof req.query.id !== 'string') {
    throw new ParameterFormatError(`Parameter not correct: id ${req.query.id}`, formatErrorCode);
  }
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
      onlyPublished = 'false';
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
        req.query.id,
        typeof req.query.take === 'string' ? parseInt(req.query.take) : undefined,
        typeof req.query.cursor === 'string' ? parseInt(req.query.cursor) : undefined,
      );
      return res.status(200).json(jobs);
    }
  }
  throw new HttpError('Metod not implemented', metodNotImplementedErrorCode, 501);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await apiHandler(req, res, callbackHandler);
}
