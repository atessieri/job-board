import prisma from 'lib/server/database/prisma';
import { createUser, getUser, updateUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
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
 *  /api/v1.0/user:
 *    get:
 *      description: Return the information about the current user.
 *                   Every user can send it.
 *      operationId: getCurrentUser
 *      tags:
 *        - User management
 *      responses:
 *        '200':
 *          description: Return the information about the current user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserType'
 *        '401':
 *          description: No any login has been performed
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
 *    post:
 *      description: Create new user. Only the user
 *                   with ADMIN role can send it.
 *      operationId: addUser
 *      tags:
 *        - User management
 *      requestBody:
 *        description: The information to create a new user
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/CreateUserType'
 *      responses:
 *        '201':
 *          description: The operation is performed correctly
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserType'
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
 *      description: Update the information of the current user.
 *                   Every user can send it.
 *      operationId: updateUser
 *      tags:
 *        - User management
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
  const userSession = await getUser(prisma, session.user.id);
  if (typeof userSession === 'undefined') {
    throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
  }
  switch (req.method) {
    case 'GET': {
      return res.status(200).json(userSession);
    }
    case 'POST': {
      if (userSession.role !== Role.ADMIN) {
        throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
      }
      if (typeof req.body.email === 'undefined') {
        throw new ParameterFormatError(
          `Parameter not correct: email undefined`,
          formatErrorCode,
          new Error().stack,
        );
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
