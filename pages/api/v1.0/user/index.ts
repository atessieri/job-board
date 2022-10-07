import prisma from 'lib/server/database/prisma';
import { createUser, getUser, updateUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { Role } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

/**
 *  @swagger
 *  /api/v1.0/user:
 *    get:
 *      description: Return the information about the current user.
 *                   Every user can send it.
 *      responses:
 *        '200':
 *          description: Return the information about the current user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserType'
 *    post:
 *      description: Create a new user. Only the user
 *                   with ADMIN role can send it.
 *      requestBody:
 *        description: The information to create a new user
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/CreateUserType'
 *      responses:
 *        '200':
 *          description: The operation is performed correctly
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserType'
 *    put:
 *      description: Update the information of the current user.
 *                   Every user can send it.
 *      requestBody:
 *        description: The information to update the current user
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
  if (typeof userSession === 'undefined') {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  switch (req.method) {
    case 'GET': {
      return res.status(200).json(userSession);
    }
    case 'POST': {
      if (userSession.role !== Role.ADMIN) {
        return res.status(405).json({ message: 'Metod not allowed' });
      }
      if (typeof req.body.email === 'undefined') {
        throw new ParameterFormatError(`Parameter not correct: email undefined`, formatErrorCode);
      }
      const user = await createUser(
        prisma,
        req.body.email,
        req.body.name,
        req.body.username,
        req.body.imagePath,
        req.body.role,
      );
      return res.status(201).json(user);
    }
    case 'PUT': {
      const user = await updateUser(
        prisma,
        session.user.id,
        req.body.name,
        req.body.username,
        req.body.imagePath,
        req.body.role,
      );
      return res.status(200).json(user);
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
