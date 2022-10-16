import apiHandler from 'lib/server/apiHandler';
import prisma from 'lib/server/database/prisma';
import { getJobs } from 'lib/server/database/jobManage';
import { HttpError, metodNotImplementedErrorCode } from 'lib/exceptions/HttpError';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

/**
 *  @swagger
 *  /api/v1.0/jobs:
 *    get:
 *      description: Return a list of job posts published limited by 'take' parameter
 *                   and starting from 'cursor' parameter. Everybody can send it.
 *      operationId: getJobs
 *      security: []
 *      tags:
 *        - Job post management
 *      parameters:
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
  switch (req.method) {
    case 'GET': {
      const jobs = await getJobs(
        prisma,
        'true',
        undefined,
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
