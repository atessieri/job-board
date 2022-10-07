import apiHandler from 'lib/server/apiHandler';
import prisma from 'lib/server/database/prisma';
import { getUser, getUsers } from 'lib/server/database/userManage';
import { Role } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

/**
 *  @swagger
 *  /api/v1.0/users:
 *    get:
 *      description: Return a list of users limited by 'take' parameter
 *                   and starting from 'cursor' parameter. Only the user
 *                   with ADMIN role can send it.
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
 *            type: string
 *          description: The identification of the starting point element from which to start.
 *          example: 'cl5kt7g1005015nbfqoos7lgs'
 *      responses:
 *        '200':
 *          description: List of users
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/UserType'
 */
const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (!session) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  const user = await getUser(prisma, session.user.id);
  if (typeof user === 'undefined' || user.role !== Role.ADMIN) {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  switch (req.method) {
    case 'GET': {
      const users = await getUsers(
        prisma,
        typeof req.query.take === 'string' ? parseInt(req.query.take) : undefined,
        typeof req.query.cursor === 'string' ? req.query.cursor : undefined,
      );
      return res.status(200).json(users);
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
