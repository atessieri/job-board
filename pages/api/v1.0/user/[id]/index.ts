import prisma from 'lib/server/database/prisma';
import { deleteUser, getUser, updateUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';
import { Role } from '@prisma/client';

/**
 *  @swagger
 *  /api/v1.0/user/{id}:
 *    get:
 *      description: Return the information about the user
 *                   identified by a `id`. Only the user
 *                   with ADMIN role can send it.
 *      operationId: getUserWithId
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *          description: User identification
 *          example: 'cl5kt7g1005015nbfqoos7lgs'
 *      responses:
 *        '200':
 *          description: Return the information about the user
 *                       identified by a numeric `id`.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserType'
 *    put:
 *      description: Update the information of the user identified
 *                   by a `id`. Only the user with
 *                   ADMIN role can send it.
 *      operationId: updateUserWithId
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *          description: User identification
 *          example: 'cl5kt7g1005015nbfqoos7lgs'
 *      requestBody:
 *        description: The information to update the user
 *                     identified by a `id`.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/UpdateUserType'
 *      responses:
 *        '200':
 *          description: The operation is performed correctly
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserType'
 *    delete:
 *      description: Remove the user identified by
 *                   a numeric `id`. Only the user
 *                   with ADMIN role can send it.
 *      operationId: deleteUserWithId
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *          description: User identification
 *          example: 'cl5kt7g1005015nbfqoos7lgs'
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
    return res.status(401).json({ message: 'Not logged in' });
  }
  const userSession = await getUser(prisma, session.user.id);
  if (typeof userSession === 'undefined' || userSession.role !== Role.ADMIN) {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  if (typeof req.query.id !== 'string') {
    return res.status(400).json({ message: 'Parameter format error' });
  }
  switch (req.method) {
    case 'GET': {
      const user = await getUser(prisma, req.query.id);
      if (typeof user === 'undefined') {
        return res.status(400).json({ message: 'User not found' });
      }
      return res.status(200).json(user);
    }
    case 'PUT': {
      const user = await updateUser(
        prisma,
        req.query.id,
        req.body.name,
        req.body.username,
        req.body.imagePath,
        req.body.role,
      );
      return res.status(200).json(user);
    }
    case 'DELETE': {
      await deleteUser(prisma, req.query.id);
      res.status(200).end();
      return;
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
